const { test, after, describe, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/list_helper')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
   await Blog.deleteMany({})
     
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
   
})

describe('indexing blogs', () => {
  let user
  beforeEach(async () => {
    user = await helper.createUserForTest()
  })
  
  test('blogs are returned as json and there are 6 in total', async () => {
    await api
      .get('/api/blogs')
      .set(helper.authorizationHeader(user))
      .expect(200)
      .expect('Content-Type', /application\/json/)

      const totalBlogs = await helper.blogsInDb()
      assert.strictEqual(totalBlogs.length, 6)

  })

  test('the unique identifier of each blog post is named id', async () => {
    
    const blogs = await helper.blogsInDb()
   
    assert(blogs.every(blog => "id" in blog))
    assert.strictEqual(blogs.every(blog => "_id" in blog), false)
    
  })
})

describe('blog creation', () => {
  let user
  beforeEach(async () => {
    user = await helper.createUserForTest()
  })

  test('a new blog post can be created', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newBlog = new Blog({
      title: "Productivity enhancement",
      author: "Daniel Shrieves",
      url: "productivityhacks.com",
      likes: 12
    })

    await newBlog.save()
    const blogsAtEnd = await helper.blogsInDb()
    const blogTitles = blogsAtEnd.map(blog => blog.title)
  
    assert.strictEqual(blogsAtStart.length, blogsAtEnd.length - 1)
    assert(blogTitles.includes("Productivity enhancement"))
  })

  test('missing number of likes defaults to zero', async () => {
    const newBlog = new Blog({
      title: "Productivity enhancement",
      author: "Daniel Shrieves",
      url: "productivityhacks.com",
     })

    await newBlog.save()
    const blogsAtEnd = await helper.blogsInDb()
    const addedBlog = blogsAtEnd.filter(blog => blog.title === "Productivity enhancement")
    assert.strictEqual(addedBlog[0].likes, 0)
  })

  test('no title or url in request data so 400 Bad request', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newBlog1 = {
      title: "With a title here",
      author: "Pat Togonon",
      likes: 12
    }

    const newBlog2 = {
      url: "withaurl.com",
      author: "Tricia Togonon",
      likes: 94
    }

    await api
      .post('/api/blogs')
      .set(helper.authorizationHeader(user))
      .send(newBlog1)
      .expect(400)

    await api
      .post('/api/blogs')
      .set(helper.authorizationHeader(user))
      .send(newBlog2)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

  })

  test('cannot create blogs if missing token', async () => {
    const newBlog = new Blog({
      title: "Productivity enhancement",
      author: "Daniel Shrieves",
      url: "productivityhacks.com",
      likes: 12
    })

    await api
      .post('/api/blogs')
      .set('Authentication', '')
      .send(newBlog)
      .expect(401)
      
  })
})

describe('blog deletion', () => {
  let user
  beforeEach(async () => {
    user = await helper.createUserForTest()
  })

  test('can delete one blog post resource', async () => {
    const blogToDelete = await Blog.create({
      title: "Productivity enhancement",
      author: "Daniel Shrieves",
      url: "productivityhacks.com",
      likes: 12,
      user: user._id
    })

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set(helper.authorizationHeader(user))
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const blogsId = blogsAtEnd.filter(blogs => blogs.id === blogToDelete.id)
    assert.deepStrictEqual(blogsId, [])
  })
})

describe('updating blogs', () => {
  let user
  beforeEach(async () => {
    user = await helper.createUserForTest()
  })

  test('one blog post resource can be updated', async () => {
    const blogToUpdate = await Blog.create({
      title: "Productivity enhancement",
      author: "Daniel Shrieves",
      url: "productivityhacks.com",
      likes: 12,
      user: user._id
    })
    
    const updatedBlog = { 
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: 100 
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set(helper.authorizationHeader(user))
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  })
})

after(async () => {
  await mongoose.connection.close()
})