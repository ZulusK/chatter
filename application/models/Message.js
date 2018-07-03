"use strict";
const mongoose=require("mongoose");

const MessageSchema=mongoose.Schema({
    authorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    text:{
        type:String,
        required:true
    }
},{timestamps:true});

MessageSchema.plugin(require("mongoose-paginate"));
MessageSchema.index({authorId:1});



module.exports=mongoose.model("Message",MessageSchema);