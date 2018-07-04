module.exports={
    DB: {
        URL: "mongodb://localhost:27017/chatter_app_test",
        AUTH_OPT: {
            user: "chatter_app_test",
            pass: "test_psw",
            reconnectTries:30
        }
    },
    isDev:false,
    LOG_LEVEL:"debug"
};

