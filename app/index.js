const fs= require("fs");

fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        module.exports[file.substring(0,file.lastIndexOf(".")||file.length)]=require(`./${file}`);
    });

