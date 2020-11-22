const express = require("express");
const {
  signup,
  signin,
  verify,
  editaccountsettings,
  confirmpwd,
  editPassword,
} = require("../controller/auth");
const { requireSignin } = require("../common-middleware");
const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
  validateEditEmailRequest,
} = require("../validators/auth");
const router = express.Router();

router.post("/register", validateSignupRequest, isRequestValidated, signup);
router.post("/login", validateSigninRequest, isRequestValidated, signin);
router.post("/user/verify", verify);
router.post(
  "/editaccountsettings",
  requireSignin,
  validateEditEmailRequest,
  isRequestValidated,
  editaccountsettings
);
router.post("/confirmpwd", requireSignin, confirmpwd);
router.post("/editpassword", requireSignin, editPassword);

// router.post('/profile', requireSignin, (req, res) => {
//     res.status(200).json({ user: 'profile' })
// });

module.exports = router;
