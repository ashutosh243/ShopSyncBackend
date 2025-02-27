require('dotenv').config();
const express = require('express');
const cors = require('cors');
// config--
const connectDB = require('./config/connection')
const cloudinary_config = require('./config/cloudinary');
// controller
const { addproduct, removeproduct, allproduct, newcollection, popularinwomen, addtocart, removetocart, getcart, uploadImage } = require('./controller/product');
const { usersignup, userLogin } = require('./controller/user');
// middleware
const fetchUser = require('./middleware/user');
const upload = require('./middleware/upload');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 8000;



// configuring cloudnary 
cloudinary_config();


// creating connection to database
connectDB();

// mounting the path
app.use('/images', express.static('upload/images'));




// creating upload end points
app.post("/upload", upload.single('product'), uploadImage);






// product related--------------------
// adding products api
app.post('/addproduct', addproduct);
// removing product api
app.post('/removeproduct', removeproduct);
// getting all product api
app.get('/allproduct', allproduct);
// creating end point for new collection 
app.get('/newcollection', newcollection);
// endpoint popular in women
app.get('/popularinwomen', popularinwomen);
// )creating end point for add to cart 
app.post('/addtocart', fetchUser, addtocart);
// end point to remove from cart
app.post('/removetocart', fetchUser, removetocart);
// creating end point to get the cart data
app.post('/getcart', fetchUser, getcart);



// user related---------
// creation endpoint for registration 
app.post('/signup', usersignup);
// end point for login
app.post('/login', userLogin);

// listening the server-----------
app.listen(port, (error) => {
    if (!error) {
        console.log("server Running " + port);
    }
    else {
        console.log(arr);
    }
});
