const cloudinary = require('cloudinary');
const product= require('../model/product');
const path= require('path');
const User=require('../model/user');


const addproduct = async (req, res) => {
    let id;
    let products = await product.find({});
    if (products.length > 0) {
        let last_product_array = products.slice(-1);            //note here slice method 
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const collection = new product({
        id: id,
        name: req.body.name,
        image: req.body.image,                              //note here req.body.name
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    await collection.save();
    res.json({
        success: true,
        name: req.body.name
    });

}
const removeproduct = async (req, res) => {

    await product.findOneAndDelete({ id: req.body.id });
    res.json({
        success: true,
        name: req.body.name,
    });

}
const allproduct = async (req, res) => {

    let products = await product.find({});
    res.send(products);
}
const newcollection = async (req, res) => {
    let products = await product.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
}
const popularinwomen = async (req, res) => {

    let products = await product.find({ category: 'women' });
    let popular_in_women = products.slice(0, 4);
    res.send(popular_in_women);
}
const addtocart = async (req, res) => {

    let userData = await User.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");
}
const removetocart = async (req, res) => {

    let userData = await User.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed");

};
const getcart = async (req, res) => {

    let userData = await User.findOne({ _id: req.user.id });
    res.json(userData.cartData);
};
const uploadImage = async (req, res) => {
    console.log("upload");
    try{
        const result = await cloudinary.uploader.upload(req.file.path, { asset_folder: 'Ecommerce' });
        res.json({
            success: 1,
            image_url: result.url
        });
        fs.unlink(req.file.path, (err) => {
            if (err) { console.log(err) }
            else console.log("deleted successfully");
        });
    }
    catch (e) {
        console.log(e);
    }
}
module.exports = { addproduct, removeproduct, allproduct, newcollection, popularinwomen, addtocart, removetocart, getcart, uploadImage };