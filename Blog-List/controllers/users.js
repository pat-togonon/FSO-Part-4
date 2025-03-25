const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  if (!password || password.length < 3) {
    return response.status(400).json({ error: 'Please provide a password that is at least 3 characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const userList = await User
      .find({}).populate('blogs', { title: 1, author: 1 })
    
    response.json(userList)
})

module.exports = usersRouter