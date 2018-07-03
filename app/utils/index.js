"use strict";
const fs = require("fs");
const _=require("lodash");

function forAllInDirDo (path, callback)  {
    if(!_.isFunction(callback)||!path) return;
    fs.readdirSync(path)
        .filter(function (file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(function (file) {
            callback(file);
        });

}

function buildIndexFile(path,destModule) {
    forAllInDirDo(path,file=>destModule.exports[file.substring(0,file.lastIndexOf(".")||file.length)]=require(`./${file}`));
}

buildIndexFile(__dirname,module);

module.exports={...module.exports,forAllInDirDo,buildIndexFile};

