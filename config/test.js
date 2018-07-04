module.exports={
    DB: {
        URL: "mongodb://localhost:27017/chatter_app_test",
        AUTH_OPT: {
            user: "chatter_app_test",
            pass: "test_psw",
            reconnectTries:30
        }
    },
    TOKEN_LIFE_ACCESS: 1e3  *2, // 1 second
    TOKEN_LIFE_REFRESH: 1e3 * 3, // 2 second
    isDev:false,
    LOG_LEVEL:"debug"
};

