const mongoose= require('mongoose');

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

module.exports=User;
