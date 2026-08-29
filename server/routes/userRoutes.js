const express = require("express")
const { authSignup, authSignin, getUserByID,updateWishlist } = require("../controllers/userController")
const Router = express.Router()

Router.post('/signup',authSignup)
Router.post('/signin',authSignin)
Router.get('/name/:id',getUserByID)
Router.put('/updateWishlist/:productId',updateWishlist)


module.exports = Router