const express = require("express");
const {
  getTheme,
  getMyTheme,
  getThemeInfo,
  createTheme,
  editTheme,
} = require("../controller/theme");
const { requireSignin } = require("../common-middleware");
//const {} = require("../validators/auth");
const upload = require("../common-middleware/imageUpload");
const router = express.Router();

router.get("/getthemes/:ownerid", getTheme);
router.get("/getmytheme", requireSignin, getMyTheme);
router.get("/getthemeinfo/:themeid", getThemeInfo);
router.post(
  "/createtheme",
  requireSignin,
  upload.single("themeImage"),
  createTheme
);
router.patch(
  "/edittheme/:themeid",
  requireSignin,
  upload.single("themeImage"),
  editTheme
);

module.exports = router;
