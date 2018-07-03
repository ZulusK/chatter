const express =require("express");
const fs= require("fs");

const router = express.Router();

fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        router.use(require(`./${file}`));
    });


module.exports=router;
