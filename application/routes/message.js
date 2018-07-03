const router = require("express").Router();
const {check, body,validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');
const MessageDriver = require("@db").MessageDriver;
const config = require("@config");
const rules = config.get("validationRules");
const log = require("@utils").logger(module);
const passport = require("passport");



router.route("/messages")
    .post(passport.authenticate(['bearer-access'], {session: false}), [
        body('text')
            .isLength(rules.message.length)
            .withMessage(`text must be less, that ${rules.message.length} symbols`)
    ], (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.mapped()});
        }
        const args = matchedData(req);
        args.author = req.user.username;
        MessageDriver.create(args)
            .then(message => {
                return res.json(MessageDriver.getPublicFields(message));
            })
            .catch(error => {
                next(error)
            })
    })
    .get(async (req, res, next) => {
        MessageDriver.find(req.query)
            .then(results=>{
                res.json(results.map(x=>MessageDriver.getPublicFields(x)))
            })
            .catch(error=>{
                next(error)
        })
    });

module.exports = router;