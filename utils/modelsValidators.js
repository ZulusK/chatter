const validator = require("validator");


const config = require("@config");

const rules = config.get("validationRules");

module.exports = {
    password: {
            validator: function (v, cb) {
                if (!validator.isLength(v, rules.password.length)) {
                    return cb(false, `password must be at least ${rules.password.length.min} symbols, and less than ${rules.password.length.max}`);
                } else if (!rules.password.regExp.test(v)) {
                    return cb(false, `password must contain at least 1 uppercase letter, 1 digit and 1 special symbol (!,#,$,%,&,?)`);
                } else {
                    return cb(true);
                }
            }
        },
    message: {
        text: {
            validator: function (v, cb) {
                if (!validator.isLength(v, rules.message.length)) {
                    return cb(false, `text must be less, that ${rules.message.length} symbols`)
                } else {
                    cb(true);
                }
            }
        }
    }
};