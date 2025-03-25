const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { beforeEach, test, describe, after } = require('node:test')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const User = require('../models/user')

const api = supertest(app)

describe('when there is one user in database', () => {
  
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sikreto', 10)
    const user = new User({
        username: "pattisian",
        passwordHash
    })
    await user.save()
  })

  test('user list is returned as json', async () => {
    
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('users with invalid passwords are not created and the operation returns status 400', async () => {
   
    const userInvalidPassword = {
      name: "Tricia",
      username: "trixia"
    }

    const result = await api
      .post('/api/users')
      .send(userInvalidPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    assert(result.body.error.includes('provide a password that is at least 3 characters long'))  

  })

  test('users with duplicated usernames are not created and the operation returns status 400', async () => {
        
    const duplicateUsername = {
      name: "Raelyn",
      username: "pattisian",
      password: "salainen"
    }
  
  const result = await api
    .post('/api/users')
    .send(duplicateUsername)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(result.body.error, 'expected `username` to be unique')

  })
})

after(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
  })



