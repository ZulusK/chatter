const express =require("express");
const utils=require("@utils");
const router = express.Router();

utils.forEachInDirDo(__dirname, file=>router.use(require(`./${file}`)));

module.exports=router;