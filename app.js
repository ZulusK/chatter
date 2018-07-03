const express = require("express");
const path = require("path");
const appLogger = require("morgan");
const log = require("@app").logger(module);
const appRouters = require("@routes");
const helmet = require("helmet");
const cors = require("cors");
const expressValidator = require("express-validator");
const compression = require("compression");
const config = require("@config");
const db = require("@db");
const app = express();
const mongoose=require("mongoose");
const bluebird=require("bluebird");

// configure and connect to DB
log.debug(`Try to connect as ${config.get("DB_URL")}`);
mongoose.Promise = bluebird;
mongoose.connect(config.get("DB_URL"))
    .then(() => {
        log.info("Connected to MongoDB");
    })
    .catch((err) => {
        log.error("MongoDB connection error." + err);
    });

app.use(helmet());
app.use(cors());
app.use(expressValidator());
app.use(compression());
app.use(appLogger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// if (config.get("isDev")) {
//     app.use(express.static(path.join(__dirname, "public"), {maxAge: "10h"}));
// } else {
//     app.use(express.static(path.join(__dirname, "public")));
// }

// add server routes
app.use(appRouters);

log.info(`server is up`);

module.exports = app;