const express = require("express");
const {
  createScript,
  getScript,
  getMyScript,
  getScriptInfo,
  addSummary,
  addTemplate,
  deleteSummary,
  deleteTemplate,
  deleteScript,
} = require("../controller/script");
const { requireSignin } = require("../common-middleware");

const router = express.Router();

// router.get("/getallvideo", getAllVideo);
router.get("/getscript/:ownerid", getScript);
router.get("/getmyscript", requireSignin, getMyScript);
router.get("/getscriptinfo/:scriptid", getScriptInfo);
router.post("/createscript", requireSignin, createScript);
router.put("/addsummary/:scriptid", requireSignin, addSummary);
router.put("/addtemplate/:scriptid", requireSignin, addTemplate);
router.patch(
  "/deletesummary/:scriptid/:summaryid",
  requireSignin,
  deleteSummary
);
router.patch(
  "/deletetemplate/:scriptid/:templateid",
  requireSignin,
  deleteTemplate
);

router.delete("/delete/:scriptid", requireSignin, deleteScript);

module.exports = router;
