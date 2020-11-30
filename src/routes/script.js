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
  createDefaultTemplate,
  getAllDefaultTemplate,
  deleteDefaultTemplate
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

router.post('/createdefaulttemplate',requireSignin,createDefaultTemplate)
router.get('/getalldefaulttemplate',requireSignin,getAllDefaultTemplate)
router.delete('/deletedefaulttemplate/:templateid',requireSignin,deleteDefaultTemplate)

module.exports = router;
