import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'


const userProduct = asyncHandler(async (req, res, next) => {
  /*   req.user = await User.findById('65310452118f9aeabba9ab58').select('-password');
    next() */
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ "message": "Not authorized, token failed" })
    }
  }
  if (!token) {
    res.status(401).json({ "message": "Not authorized, no token" })
  }
})




export {
  userProduct
} 