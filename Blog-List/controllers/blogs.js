//Actual route handlers
const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const blog = require('../models/blog')
require('dotenv').config()

blogRouter.get('/', async (request, response) => {

  const blogs = await Blog
    .find({}).populate('user', { name: 1, username: 1 })
  
  response.json(blogs)
      
  })

  blogRouter.get('/:id', async (request, response) => {

    const blog = await Blog
      .findById(request.params.id).populate('user', { name: 1, username: 1 })
    
    response.json(blog)
        
    })

blogRouter.post('/', async (request, response) => {
    const { author, title, url, likes } = request.body
    
    const user = request.user
    const blog = new Blog({
      author: author,
      title: title,
      url: url,
      likes: likes,
      user: user
    })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)    
  })

blogRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const blogToDelete = await Blog.findById(request.params.id)
  
  if (!blogToDelete) {
    return response.status(204).end()
  } 
  
  if (blogToDelete.user.toString() === user._id.toString()) {
  
      await blogToDelete.deleteOne()

      user.blogs = user.blogs.filter(b => b.toString() !== blogToDelete._id.toString())
      await user.save()
      response.status(204).end()
  
  } else {
    response.status(401).json({ error: 'Cannot delete blogs you did not create'})
  }
   
})

blogRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const updatedBlog = {
    title: title,
    author: author,
    url: url,
    likes: likes
  }
     
    await Blog.findByIdAndUpdate(request.params.id, 
      updatedBlog, 
      {
        new: true,
        runValidators: true
      }
    )
    response.status(200).json(updatedBlog)
  
})

module.exports = blogRouter