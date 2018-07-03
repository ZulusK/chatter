"use strict";
const mongoose=require("mongoose");
const utils=require("@utils");
const bcrypt=require("bcrypt");
const log=require("@app").logger(module);

const UserSchema=mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    jwtSecrets: {
        access: String,
        refresh:String
    }
},{timestamp:true});

UserSchema.plugin(require("mongoose-paginate"));
UserSchema.index({username:1});


// generate new token's secrets and save them
UserSchema.methods.regenerateJWTSalts = async function (){
    const salts= await Promise.all([
        bcrypt.genSalt(config.get("TOKEN_SALT_LENGTH")),
        bcrypt.genSalt(config.get("TOKEN_SALT_LENGTH"))
    ]);
    this.jwtSecrets = {
        access: salts[0],
        refresh: salts[1]
    };
    return this.save();
};

UserSchema.methods.generateAccessToken = function () {
    const payload= {
        id: this._id,
        salt: this.jwtSecrets.access
    };
    return TokenGenerator.generate("access", payload);
};

UserSchema.methods.generateRefreshToken = function () {
    const payload= {
        id: this._id,
        salt: this.jwtSecrets.refresh
    };
    return TokenGenerator.generate("refresh", payload);
};

UserSchema.methods.jwt = function () {
    const currTime = new Date().getTime();
    return {
        accessToken: {
            token: this.generateAccessToken(),
            expiredIn: currTime + Number(config.get("TOKEN_LIFE_ACCESS"))
        },
        refreshToken: {
            token: this.generateRefreshToken(),
            expiredIn: currTime + Number(config.get("TOKEN_LIFE_REFRESH"))
        }
    };
};
UserSchema.methods.comparePassword = function (plainPasswordCandidate){
    return bcrypt.compare(plainPasswordCandidate, this.password);
};
UserSchema.pre('save',async function (next) {
    const user=this;
    if (!this.isModified("password") && !this.isNew) {
        return next();
    }
    try {
        const salts = await Promise.all([
            bcrypt.genSalt(config.get("TOKEN_SECRET_SALT_LENGTH")), // access secret salt
            bcrypt.genSalt(config.get("TOKEN_SECRET_SALT_LENGTH")), // refresh secret salt
            bcrypt.genSalt(config.get("TOKEN_SALT_LENGTH")) // password salt
        ]);
        user.jwtSecrets = {
            access: salts[0],
            refresh: salts[1]
        };
        user.password = await bcrypt.hash(user.password, salts[2]);
    } catch (err) {
        log.error(err);
        next(err);
    }
});

module.exports=mongoose.model("User",UserSchema);