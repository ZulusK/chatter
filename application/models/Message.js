"use strict";
const mongoose=require("mongoose");

const MessageSchema=mongoose.Schema({
    author:{
        type: String,
        required:true,
    },
    text:{
        type:String,
        required:true
    }
},{timestamps:true});

MessageSchema.plugin(require("mongoose-paginate"));
MessageSchema.index({author:1});

module.exports=mongoose.model("Message",MessageSchema);