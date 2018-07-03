const router=require("express").Router();
const { body, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const UserDriver=require("@db").UserDriver;
const config=require("@config");
const rules = config.get("validationRules");
const log=require("@utils").logger(module);
const passport=require("passport");

router.post("/signup",[
    body('username')
        .isAlphanumeric()
        .withMessage('username must contain only letters and numbers')
        .custom(async v=>{
            if(await UserDriver.contains({username:v})){
                throw new Error("this username is already in use");
            }
        }),
    body("password")
        .isLength({min:1})
        .withMessage(`password must be at least ${rules.password.length.min} symbols, and less than ${rules.password.length.max}`)
        .matches(rules.password.regExp)
        .withMessage("password must contain at least 1 uppercase letter, 1 digit and 1 special symbol (!,#,$,%,&,?)")
],(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }
    const args = matchedData(req);
    UserDriver.create(args)
        .then(user=>{
            return res.json(user.generateJWT())
        })
        .catch(error=>{
            next(error)
        })
});

router.post("/signin",passport.authenticate(['basic'],{ session: false }),(req,res)=>{
    return res.json(req.user.generateJWT())
});

module.exports=router;