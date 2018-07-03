const bcrypt = require("bcrypt");

function generateURL() {
    const url = process.env.DB_URL || "";
    const login = process.env.DB_LOGIN;
    const password = process.env.DB_PASSWORD;
    return url.replace("<login>", login).replace("<psw>", password);
}

module.exports = {
    DB_URL: generateURL(),
    isDev: false,
    LOG_LEVEL: "info",

    TOKEN_SALT_LENGTH: 20,
    TOKEN_SECRET_SALT_LENGTH:5,
    TOKEN_SALT_ACCESS: bcrypt.genSaltSync(this.TOKEN_SALT_LENGTH),
    TOKEN_SALT_REFRESH: bcrypt.genSaltSync(this.TOKEN_SALT_LENGTH),
    TOKEN_LIFE_ACCESS: 1e3 * 60 * 60, // 1 minute
    TOKEN_LIFE_REFRESH: 1e3 * 60 * 60 * 24, // 1 day
    TOKEN_GENERATOR_ALGORITHM: "HS256",

    validationRules: {
        message: {
            length: {
                max: 200
            }
        },
        password: {
            length: {
                min: 8,
                max: 16
            },
            regExp: /^(?=.*\d.*)(?=.*[a-z].*)(?=.*[A-Z].*)(?=.*[!#$%&?]*.*).{8,16}$/
        }
    }
};