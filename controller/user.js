var jwt = require('jsonwebtoken');
const User=require('../model/user');
var jwt = require('jsonwebtoken');


const usersignup=async (req, res) => {

    let check = await User.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "email already exist" })
    }
    // cart obeject--------------------------------
    let cart = {}
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });
    await user.save();
    const data = {
        user: { id: user.id }
    }
    const token = jwt.sign(data, 'secret_ecom');          //token generation-
    res.json({ success: true, token });
}
const userLogin= async (req, res,) => {

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        const passCompare = (req.body.password === user.password);
        if (passCompare) {
            const data = {
                user: {
                    id: user.id,
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, error: "wrong password" });
        }
    }
    else {
        res.json({ success: false, error: "wrong email address" });
    }
}
module.exports= {usersignup,userLogin};