const productModel = require("../models/productModel")
const {LocalStorage}=require("node-localstorage")

const sellProduct = async (req,res) => { 
    localStorage = new LocalStorage('./local')
    const {featured,productName,brandName,description,details,images,owner,price,picupLocation,catagory}=req.body; 
   
    if(!productName || !description || !details || !images || !price || !picupLocation  || !catagory){ 
      return res.status(400).json({ 
        success:false, 
        message:"credentials not provideded !!" 
      }) 
    } 
   const user_ID=localStorage.getItem("user_ID")
    const product =await productModel.create({
        productName,
        description,
        details,
        images,
        price,
        picupLocation,
        catagory,
        owner:user_ID
    })  

    if(product){
        return res.status(201).json({
            success:true,
            messgae:"success",
            data : product
        })
    }
    else{
        return res.status(400).json({
            success:false,
            messgae:"failed to add product"
        })
    }
  };

  module.exports=sellProduct