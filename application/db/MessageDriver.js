"use strict";

const AbstractDriver = require("./AbstractDriver");
const MessageModel = require("@models").Message;

class MessageDriver extends AbstractDriver {
    constructor() {
        super(MessageModel)
    }

    async getByUser(author,options) {
        if(options) {
            return this.findPaginated({author},options);
        }else{
            return this.find({author});
        }
    }
    create({text, author}) {
        return super.create({text,author});
    }
    getPublicFields(doc){
        const {text, author,_id:id,createdAt,updatedAt}=doc;
        return {text,author,id,createdAt,updatedAt};
    }
    get publicFieldNames(){
        return ["text,id"];
    }
}

module.exports = new MessageDriver();