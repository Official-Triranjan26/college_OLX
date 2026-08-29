const generateToken = require("../config/generateToken"); 
const UserModel = require("../models/userModel"); 
const {LocalStorage}=require("node-localstorage")
 
const authSignin = async (req,res) => { 
  localStorage = new LocalStorage('./local')
  const {email,password}=req.body; 
 
  if(!email || !password){ 
    return res.status(400).json({ 
      success:false, 
      message:"credentials not provideded !!" 
    }) 
  } 
 
  const user = await UserModel.findOne({email:email}); 
  // console.log(user);
  
  if(user && (await user.matchPassword(password))){ 
    console.log(user) 
    localStorage.setItem("user_name", user.name)
    localStorage.setItem("user_ID", user._id)
    console.log(localStorage.getItem("user_ID",user._id))
    return res.json({ 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      isAdmin: user.isAdmin, 
      pic: user.pic, 
      token: generateToken(user._id), 
    }); 
  } 
  else{ 
     res.status(400).json({ 
      success:false, 
      message:"invalid credentials !!" 
    }) 
  } 
}; 
 
const authSignup = async (req, res) => { 
  localStorage = new LocalStorage('./local')
  const { name, email, password} = req.body; 
  if (!name  || !email  || !password) { 
    return res.status(400).json({ 
      success: false, 
      message: "credentials are needed !", 
    }); 
  } 
 
  const user = await UserModel.findOne({ email }); 
  if (user) { 
    return res.status(400).json({ 
      success: false, 
      message: "user with credential exists", 
    }); 
  } 
  const newUser = await UserModel.create({ 
    name, 
    email, 
    password, 
  }); 
  localStorage.setItem("user_name",newUser.name)
  localStorage.setItem("user_ID", newUser._id)
  console.log(newUser); 
  if (newUser) { 
    res.status(201).json({ 
        id:newUser._id, 
        name:newUser.name, 
        email:newUser.email, 
        password:newUser.password, 
        pic:newUser.pic, 
        token:generateToken(newUser._id) 
      }) 
    }
  else{ 
    return res.status(400).json({ 
        success:false, 
        message:"Failed to craeate user !" 
    }) 
  } 
}; 

const getUserByID = async(req,res)=>{
  try {
    const userId=req.params.id;
    const user =await UserModel.findOne({_id:userId})
    console.log(userId,user)
    return res.status(200).json(user)
    
  } catch (error) {
    return res.status(400).json({ 
      success:false, 
      message:error.message 
    })  
  }
}

const updateWishlist =async(req,res)=>{
  try {
    localStorage = new LocalStorage('./local')
    const userId =localStorage.getItem("user_ID")
    const productId = req.params.productId;
    console.log(userId,productId);

    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if(user.wishlist.find((element) => element == productId)){
      console.log("hello")
      return res.status(404).json({ error: 'Item already in wishlist' });
    }
    user.wishlist.push(productId);
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
 
// const getAllUser = async (req,res)=> { 
//   const keyword = req.query.search 
//     ? { 
//         $or: [ 
//           { name: { $regex: req.query.search, $options: "i" } }, 
//           { email: { $regex: req.query.search, $options: "i" } }, 
//         ], 
//       } 
//     : {}; 
//     const users = await UserModel.find(keyword).find({ _id: { $ne: req.user._id } }); 
//     res.send(users); 
//   // }); 
// } 
module.exports = { authSignin , authSignup , getUserByID ,updateWishlist };