require('dotenv').config();
const cloudinary = require('cloudinary');

const cloudinary_config=()=>{
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });
}
module.exports= cloudinary_config;