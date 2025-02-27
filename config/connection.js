const mongoose = require('mongoose');
var username = encodeURIComponent(process.env.NAME);
var password = encodeURIComponent(process.env.PASS);
let connection = `mongodb+srv://${username}:${password}@cluster0.gpdrrsc.mongodb.net/`;


const connectDB = () => {
    mongoose.connect(connection)
    .then(() => { console.log("connected"); })
    .catch(err => { console.log(err) });
}
module.exports = connectDB;