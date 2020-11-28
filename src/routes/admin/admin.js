

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
//const {} = require("../controller/admin/admin");
const { requireSignin,adminMiddleware } = require("../../common-middleware");
//const {
//  validateSignupRequest,
//  isRequestValidated,
//  validateSigninRequest,
//  validateEditEmailRequest,
//} = require("../validators/auth");
//const upload = require("../common-middleware/imageUpload");
const router = express.Router();



router.get('/admin',requireSignin,adminMiddleware,(req,res)=>{
    console.log("admin")
})



router.post("/sendemail",requireSignin,(req,res)=>{
 // var mailOptions = {
 //   from: 'videoshare.info@gmail.com',
  //  to: '186mdshimul@gmail.com.com',
  //  text: 'This is some text',
 //   html: '<b>This is some HTML</b>',
 // };



  //nodeMailerTransporter.sendMail(mailOptions, (error, info) => {
   // if (error) {
   //   console.log(error);
   //   res.status(error.responseCode).send(error.response);
  //  } else {
   //   console.log('Message sent: ' + info.response);
   //   res.status(200).send(info);
   // }
 // });

 transporter.sendMail({
  from: 'info.videoshare@gmail.com',
  to: 'shimul186@gmail.com',
  subject: 'Message',
  text: 'I hope this message gets sent!!',
 // ses: { // optional extra arguments for SendRawEmail
      //Tags: [{
       //   Name: 'tag name',
       //   Value: 'tag value'
     // }]
  //}
}, (err, info) => {
  console.log(info);
  console.log(err);
});



 
})

// router.post('/profile', requireSignin, (req, res) => {
//     res.status(200).json({ user: 'profile' })
// });

module.exports = router;
