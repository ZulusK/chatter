"use strict";

const AbstractDriver = require("./AbstractDriver");
const MessageModel = require("@models").Message;

class MessageDriver extends AbstractDriver {
    constructor() {
        super(MessageModel)
    }

    async getByCredentials(email, password) {
        const user = await this.findOne({email});
        if (user && await user.comparePassword(password)) {
            return user;
        }
        return null;
    }

    async getByUser(authorId,options) {
        if(options) {
            return this.findPaginated({authorId},options);
        }else{
            return this.find({authorId});
        }
    }

    create({text, authorId}) {
        return super.create({text,authorId});
    }

}

module.exports = new MessageDriver();