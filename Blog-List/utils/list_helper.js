const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')


const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogList) => {
 
  return blogList.map(blog => blog.likes)
    .reduce((totalLikes, likes) => totalLikes + likes, 0)

}

const favoriteBlog = (blogList) => {
  
  const likesList = blogList.map(blog => blog.likes)
  const max = Math.max(...likesList)

  return blogList.filter(blog => blog.likes === max)[0]
    
}

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const authorizationHeader = user => { 
  const token = jwt.sign({
          username: user.username,
          id: user._id
      }, process.env.SECRET)

  return { Authorization: `Bearer ${token}` }
}

const createUserForTest = async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sikreto', 10)
    const userForTest =  await User.create({
        username: "test",
        passwordHash
    })

  const savedUser = await userForTest.save()
  return savedUser
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  initialBlogs,
  blogsInDb,
  usersInDb,
  authorizationHeader,
  createUserForTest
}