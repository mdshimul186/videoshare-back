

const express = require("express");
const {
  signup,
  signin,
  verify,
  editaccountsettings,
  confirmpwd,
  editPassword,
  editprofileimage,
  googleAuth,
  forgotPassword
} = require("../controller/auth");
const { requireSignin } = require("../common-middleware");
const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
  validateEditEmailRequest,
} = require("../validators/auth");
const upload = require("../common-middleware/imageUpload");
const router = express.Router();

router.post("/register", validateSignupRequest, isRequestValidated, signup);
router.post("/login", validateSigninRequest, isRequestValidated, signin);
router.post("/verify", verify);
router.patch(
  "/editaccountsettings",
  requireSignin,
  validateEditEmailRequest,
  isRequestValidated,
  editaccountsettings
);
router.post("/confirmpwd", requireSignin, confirmpwd);
router.patch("/editpassword", requireSignin, editPassword);
router.put(
  "/editprofileimage",
  requireSignin,
  upload.single("profileimage"),
  editprofileimage
);

router.post("/auth/google", googleAuth);
router.post("/forgotpassword",validateEditEmailRequest,isRequestValidated,forgotPassword)



// router.post('/profile', requireSignin, (req, res) => {
//     res.status(200).json({ user: 'profile' })
// });

module.exports = router;
