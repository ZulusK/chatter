const mongoose=require("mongoose");
const validator=require("validator");

const UserSchema=mongoose.Schema({
    username:{
        type:String,
        unique:true,
        validate
    },

},{timestamp:true})';'
