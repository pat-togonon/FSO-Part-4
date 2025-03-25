//Here are the blogs itself (the content) 

const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    minLength: [5, 'Blog titles should have at least 5 characters'],
    required: [true, 'Please input the blog title']
  },
  author: {
    type: String,
    minLength: [5, 'Author names should have at least 5 characters'],
    required: [true, 'Please input author name']
  },
  url: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?([www.])?([\w.-]+)\.([a-z]{2,6})(\/[\w.~/-]*)*(\?.*)?$/i.test(v)
      },
        message: () => `Invalid url. Please check and try again`
    },
   required: [true, 'Please input url']
  },
  likes: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)