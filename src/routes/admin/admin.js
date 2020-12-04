

let nodemailer = require('nodemailer');
let aws = require('aws-sdk');

// configure AWS SDK
aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "ap-southeast-1",
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
});



const express = require("express");
const { createMasterUser, getMasterUser, deleteMasterUser ,editMasterUser} = require("../../controller/admin/admin");
const { requireSignin, adminMiddleware } = require("../../common-middleware");
const {
  validateCreateMasterUser,
  isRequestValidated,
} = require("../../validators/admin");
const upload = require("../../common-middleware/imageUpload");
const router = express.Router();



router.get('/admin', requireSignin, adminMiddleware, (req, res) => {
  console.log("admin")
})


router.post('/createmasteruser', requireSignin, adminMiddleware,upload.single("profileimage"), validateCreateMasterUser, isRequestValidated, createMasterUser)

router.patch("/edituser/:userid",requireSignin, adminMiddleware,editMasterUser)

router.get('/getmasteruser', requireSignin, adminMiddleware, getMasterUser)
router.delete('/deletemasteruser/:userid', requireSignin, adminMiddleware, deleteMasterUser)

module.exports = router;
