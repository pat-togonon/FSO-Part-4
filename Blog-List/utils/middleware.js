const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  const sensitiveInfo = ['password']

  const sanitizedBody = { ...request.body }

  sensitiveInfo.forEach(info => {
    if (sanitizedBody[info]) {
      sanitizedBody[info] = '[REDACTED]'
    }
  })

  logger.info('Method: ', request.method)
  logger.info('Path: ', request.path)
  logger.info('Body: ', sanitizedBody)
  logger.info('---')
  next()    
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else {
    request.token = null
  }
  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  
  request.user = await User.findById(decodedToken.id)

  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error('error is ', error.name, 'and message is ', error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.message === 'data and salt arguments required') {
    return response.status(400).send({ error: 'Please input password' })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  }

  next(error)

}



module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}