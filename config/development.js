module.exports={
    db:{
        "username": process.env.DB_LOGIN,
        "password": process.env.DB_PASSWORD||null,
        "database": process.env.DB,
    },
    idDev:true
};