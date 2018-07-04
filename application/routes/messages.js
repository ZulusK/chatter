const router = require("express").Router();
const {body, validationResult} = require('express-validator/check');
const {matchedData} = require('express-validator/filter');
const MessageDriver = require("@db").MessageDriver;
const config = require("@config");
const rules = config.get("validationRules");
// const log = require("@utils").logger(module);
const passport = require("passport");
const _ = require("lodash");
const ObjectId = require("mongoose").Types.ObjectId;

router.route("/")
    .post(passport.authenticate(['bearer-access', 'basic'], {session: false}), [
        body('text')
            .exists()
            .withMessage('text is required')
            .isLength(rules.message.length)
            .withMessage(`text must be less, that ${rules.message.length} symbols`)

    ], (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.mapped()});
        }
        const args = matchedData(req);
        args.author = req.user.id;
        MessageDriver.create(args)
            .then(message => {
                return res.json(MessageDriver.getPublicFields(message));
            })
            .catch(error => {
                next(error)
            })
    })
    .get(async (req, res, next) => {
        const {page, limit} = req.query;
        const pagination = {
            page: Math.max(page || 1, 1),
            limit: Math.max(Math.min(limit || config.get("STANDARD_PAGINATION"), config.get("MAX_PAGINATION")), config.get("STANDARD_PAGINATION"))
        };


        const query = {};
        if (ObjectId.isValid(req.query._id)) {
            query._id = new ObjectId(req.query._id);
        }
        if (ObjectId.isValid(req.query.author)) {
            query.author = new ObjectId(req.query.author);
        }
        console.log(query);
        MessageDriver.findPaginated(query, pagination)
            .then(result => {
                return res.json({
                    total: result.total,
                    page: result.page,
                    docs: result.docs.map(x => MessageDriver.getPublicFields(x)),
                    limit: result.limit
                })
            })
            .catch(error => {
                next(error)
            })
    });

module.exports = router;