const express =require("express");
const path =require("path");
const appLogger =require("morgan");
const log=require("@app").logger(module);
const appRouters =require("@app/routes");
const db=require("./models");
const helmet = require("helmet");
const cors=require("cors");
const expressValidator=require("express-validator");
const compression=require("compression");


const app =express();

app.use(helmet());
app.use(cors());
app.use(expressValidator());
app.use(compression());
app.use(appLogger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if(config.get("idDev")) {
    app.use(express.static(path.join(__dirname, "public"), {maxAge: "10h"}));
}else{
    app.use(express.static(path.join(__dirname, "public")));
}
// add server routes
app.use(appRouters);

log.info(`server is up`);

module.exports = app;
