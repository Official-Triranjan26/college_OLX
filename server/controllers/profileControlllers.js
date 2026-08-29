const productModel = require("../models/productModel")
const userModel = require("../models/userModel");
const { use } = require("../routes/userRoutes");

const getWishlist = async(req,res)=>{
    try {
        const userId=req.params.id;
        console.log(userId);
        const user = await userModel.findOne({_id:userId});
        console.log("user",user.wishlist)
        const wishlist = user.wishlist;
        console.log(wishlist)
        return res.status(200).json(wishlist)
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
}

const getListed = async(req,res)=>{
    try {
        const userId=req.params.id;
        const products = await productModel.find({owner:userId})
        return res.status(200).json(products)
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
}

const getPurchases = async(req,res)=>{
    try {
        const userId=req.params.id;
        const products = await productModel.find({sold : true},{'paymentDetails.coustomer_id': userId}).populate('owner')
        return res.status(200).json(products)
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
    
}

const getSold = async(req,res)=>{
    try {
        const userId=req.params.id;
        const products = await productModel.find({sold : true},{owner: userId})
        return res.status(200).send(products)
        
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
}
module.exports={getWishlist,getListed,getPurchases,getSold}