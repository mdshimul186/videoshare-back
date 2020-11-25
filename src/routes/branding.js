const express = require("express");
const {
  createBranding,
  getBranding,
  getMyBranding,
  getBrandingInfo,
  editBranding,
  deleteBeanding,
} = require("../controller/branding");
const { requireSignin } = require("../common-middleware");
//const {} = require("../validators/auth");
const upload = require("../common-middleware/imageUpload");
const router = express.Router();

router.get("/getbranding/:ownerid", getBranding);
router.get("/getmybranding", requireSignin, getMyBranding);
router.get("/getbrandinginfo/:brandingid", getBrandingInfo);
router.post(
  "/createbranding",
  requireSignin,
  upload.fields([
    {
      name: "firstLogo",
      maxCount: 1,
    },
    {
      name: "secondLogo",
      maxCount: 1,
    },
  ]),
  createBranding
);
router.patch(
  "/editbranding/:brandingid",
  requireSignin,
  upload.fields([
    {
      name: "firstLogo",
      maxCount: 1,
    },
    {
      name: "secondLogo",
      maxCount: 1,
    },
  ]),
  editBranding
);

router.delete("/deletebranding/:brandingid", requireSignin, deleteBeanding);

module.exports = router;
