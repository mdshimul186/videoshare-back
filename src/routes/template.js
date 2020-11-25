const express = require("express");
const { getTemplate } = require("../controller/template");
const { requireSignin } = require("../common-middleware");

const router = express.Router();

router.get("/gettemplate", getTemplate);

module.exports = router;
