const express =require("express");
const utils=require("@utils");
const router = express.Router();
const createError =require('http-errors');
const config=require("@config");
utils.forEachInDirDo(__dirname, file=>{
    router.use("/"+file.replace(/\.js$/,""),require(`./${file}`))
});

// catch 404 and forward to error handler
router.use((req, res, next) =>{
    next(new createError.NotFound());
});

// error handler
router.use((err, req, res) =>{
    res.locals.message = err.message;
    res.locals.error = config.get("isDev")? err : {};
    res.status(err.status || 500);
    res.json({
        message: err.message || "Something going wrong",
        error:{},
        code: err.status || 500
    });
});

module.exports=router;