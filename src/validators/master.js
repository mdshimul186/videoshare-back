const { check, validationResult } = require("express-validator");

exports.validateInviteUser = [
    check('firstName')
        .notEmpty()
        .withMessage('firstName is required'),
    check('lastName')
        .notEmpty()
        .withMessage('lastName is required'),
    check('email')
        .trim()
        .isEmail()
        .withMessage('Valid Email is required'),
    check('jobRole')
        .notEmpty()
        .withMessage('Jobrole is required'),
    check('trxId')
        .notEmpty()
        .withMessage('trxId is required'),
    check('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 character long'),
    check('confirmPassword')
        .trim()
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom(async (confirmPassword, { req }) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Confirm Passwords must be same')
            }
        })

];

//exports.validateSigninRequest = [
//  check("email").isEmail().withMessage("Valid Email is required"),
//  check("password")
//    .isLength({ min: 6 })
//    .withMessage("Password must be at least 6 character long"),
//];

///exports.validateEditEmailRequest = [
//  check("email").isEmail().withMessage("Valid Email is required"),
//];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};
