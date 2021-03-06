const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { nonExistingId } = require('../tests/test_helper')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

  




blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username : 1, name : 1})
  response.json(blogs.map(blog => blog.toJSON()))
  })
  
blogRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  

  const blog = new Blog({
    title : body.title,
    auther : body.auther,
    url : body.url,
    likes : body.likes,
    user : user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body
  blog = body
  if (blog['user']) {
    blog.user = blog.user.id
  }
  delete blog['id']
  delete blog['__v']
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})  
  response.json(updatedBlog)
})

blogRouter.delete('/:id', async (request,response) => {
  const body = request.body
  blog = await Blog.findById(request.params.id)
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  response.json(deletedBlog)
})

module.exports = blogRouter