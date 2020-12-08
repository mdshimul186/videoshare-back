const { check, validationResult } = require("express-validator");

exports.validateSignupRequest = [
  check("email").isEmail().withMessage("Valid Email is required"),
  check("password")
      .exists()
            .withMessage('Password should not be empty, minimum eight characters, at least one letter, one number and one special character')
           
            .isLength({ min: 8 })
            .withMessage('Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.At least one number')
           
            .matches( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
            .withMessage('Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.At least one number')
];

exports.validateSigninRequest = [
  check("email").isEmail().withMessage("Valid Email is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character long"),
];

exports.validateEditEmailRequest = [
  check("email").isEmail().withMessage("Valid Email is required"),
];
exports.validatePassword = [
  check("newpassword")
  .exists()
        .withMessage('Password should not be empty, minimum eight characters, at least one letter, one number and one special character')
       
        .isLength({ min: 8 })
        .withMessage('Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.At least one number')
       
        .matches( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
        .withMessage('Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.At least one number')
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};
