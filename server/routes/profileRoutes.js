const express = require("express")
const {getListed,getPurchases,getSold,getWishlist} = require("../controllers/profileControlllers")
const Router = express.Router()

Router.get('/wishlist/:id',getWishlist)
Router.get('/listed/:id',getListed)
Router.get('/purchases/:id',getPurchases)
Router.get('/sold/:id',getSold)


module.exports = Router