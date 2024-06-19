require('dotenv').config();
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const cors= require('cors');
var jwt = require('jsonwebtoken');
const path= require('path');
const cloudinary = require('cloudinary');
const app=express();
app.use(express.json());    
app.use(cors());                                  //note here cors
app.use(express.urlencoded({extended:false}));

const port = process.env.PORT||8000;
const BASE_URL=process.env.BASE_URL;


// configuring cloudnary --
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});



// creating connection to database---------------
var username = encodeURIComponent(process.env.NAME);
var password = encodeURIComponent(process.env.PASS);
let connection=`mongodb+srv://${username}:${password}@cluster0.gpdrrsc.mongodb.net/`;
mongoose.connect(connection).then(()=>{console.log("connected");}).catch(err=>{console.log(err)});

// image storage engine------------------------------------------------------
const upload=multer({storage:multer.diskStorage({
   
    destination: function(req,file,cb){
        return cb(null,"./upload/images")
    },
    filename: function(req,file,cb){
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})});
// Api creation---------------------------------------------------------------------
app.get('/', (req,res)=>{
    res.send("express running");
});

// mounting the path-----------------------------------------------------------
app.use('/images',express.static('upload/images'));

// creating upload end points--------------------------------------------------
app.post("/upload",upload.single('product'),async(req,res)=>{
    console.log("upload");
    try{
        const result = await cloudinary.uploader.upload(req.file.path ,{asset_folder:'Ecommerce'});
           res.json({
            success:1,
            image_url: result.url                    
           });
           fs.unlink(req.file.path,(err)=>{
            if(err){console.log(err)}
            else console.log("deleted successfully");
           });
    }
    catch(e)
    {
         console.log(e);
    }
});
// schema of product-----------------------------------------------------------               
const product=mongoose.model("product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true
    }

});

// adding products api---------------------------------------------------
app.post('/addproduct',async(req,res)=>{
    let id;
    let products=await product.find({});
    if(products.length>0){
        let last_product_array=products.slice(-1);            //note here slice method 
        let last_product=last_product_array[0];
        id=last_product.id+1;
    }
    else
    {
        id=1;
    }
    const collection= new product({
            id:id,                                     
            name:req.body.name,
            image:req.body.image,                              //note here req.body.name
            category:req.body.category,
            new_price:req.body.new_price,
            old_price:req.body.old_price,
    });
    await collection.save();
    res.json({
        success: true,
        name:req.body.name
    });

});
// removing product api------------
    app.post('/removeproduct',async(req,res)=>{

        await product.findOneAndDelete({id:req.body.id}); 
        res.json({
            success:true,
            name:req.body.name,
        });

    });
// getting all product api-------------------------------
app.get('/allproduct',async(req,res)=>{

    let products=await product.find({}); 
    res.send(products);
});



// schema crreation for user --------------------------------
const User =mongoose.model('User',{
    name:{
      type:String,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
      type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
});
// creation endpoint for registration --------------------------
app.post('/signup',async (req,res)=>{

    let check=await User.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"email already exist"})
    }
    // cart obeject--------------------------------
    let cart={}
    for(let i=0;i<300;i++){
        cart[i]=0;
    }
    const user=new User({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    });
    await user.save();
    const data={
        user:{id:user.id}                       
    }
    const token=jwt.sign(data,'secret_ecom');          //token generation-
    res.json({success:true,token});
});
// end point for login-------------------------------------
app.post('/login',async(req, res,)=>{
      
    let user=await User.findOne({email:req.body.email});
    if(user){
        const passCompare=(req.body.password===user.password);
        if(passCompare){
            const data={
                user:{
                    id:user.id,
                }
            }
            const token=jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else
        {
            res.json({success:false,error:"wrong password"});
        }
    }
    else{
        res.json({success:false,error:"wrong email address"});
    }
});
// creating end point for new collection ----------------
app.get('/newcollection',async(req,res)=>{
    let products=await product.find({});
    let newcollection=products.slice(1).slice(-8);
    res.send(newcollection);
})
// endpoint popular in women------------------------------
app.get('/popularinwomen',async(req,res)=>{

    let products=await product.find({category:'women'});
    let popular_in_women=products.slice(0,4);
    res.send(popular_in_women);
})
// creating middleware to fetch user ---------------------------------
const fetchUser = async(req, res,next)=>{

    const token =req.header('auth-token');
    if(!token)
    {
        res.status(401).send({errors:"please authenticate using valid token"});
    }
    else 
    {
        try{
          const data=jwt.verify(token,'secret_ecom');
          req.user = data.user;                                  //data object addtion
          next();
        }
        catch(err){
        
            res.status(401).send({errors:"please authenticate using valid -token"});
        }
    }
}
// )creating end point for add to cart --
app.post('/addtocart',fetchUser,async(req,res)=>{
 
    let userData =await User.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await User.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
});
// end point to remove from cart ---
app.post('/removetocart',fetchUser,async(req,res)=>{
   
    let userData =await User.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await User.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed");

});
// creating end point to get the cart data--\
app.post('/getcart',fetchUser,async(req,res)=>{
     
    let userData = await User.findOne({_id:req.user.id});
    res.json(userData.cartData);
});
// listening the server-----------
app.listen(port,(error)=>{
    if(!error){
        console.log("server Running "+port);
    }
    else
    {
        console.log(arr);
    }
});
