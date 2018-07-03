function generateURL(){
    const url=process.env.DB_URL||"";
    const login=process.env.DB_LOGIN;
    const password=process.env.DB_PASSWORD;
    return url.replace("<login>",login).replace("<psw>",password);
}

module.exports={
    DB_URL:generateURL(),
    isDev:false,
    LOG_LEVEL:"debug"
};