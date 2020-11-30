const User = require('../../models/user.model')
const bcrypt = require("bcryptjs");
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



exports.createMasterUser=(req,res)=>{
    const { firstName, lastName, email, password } = req.body;
console.log(password)
    if(!password){
        return res.status(200).json({error:"password reuired"})
    }
    

    User.findOne({ email}).exec(async (error, user) => {
        if (user)
          return res.status(400).json({
            error: "User already registered",
          });
    
        const hash_password = await bcrypt.hash(password, 10);
        const _masterUser = new User({
          email,
          hash_password,
          firstName,
          lastName,
          jobRole: "",
          role: "master",
          videoGoal: "",
          createdBy:req.user._id,
          approval:{
            isApproved:true,
            trxId:''
          },
          accessType:{
            branding1:true,
            branding2:true,
            branding3:true,
            branding4:true,
            script:true,
            template:true,
            fullAccess:true
          },
          resetPassToken:""  
    
        });
    
        _masterUser.save((error, data) => {
          if (error) {
            console.log(error);
            return res.status(400).json({
              error: "Something went wrong",
            });
          }
    
          if (data) {

            transporter.sendMail({
                from: 'info.videoshare@gmail.com',
                to: data.email,
                subject: 'account created',
                text:` Master user account created successfully.your email:${data.email}, password:${password}`,
               // ses: { // optional extra arguments for SendRawEmail
                    //Tags: [{
                     //   Name: 'tag name',
                     //   Value: 'tag value'
                   // }]
                //}
              }, (err, info) => {
                console.log(info);
                console.log(err);
                return res.status(201).json({
                    success: true,
                    message: "Master user created Successfully..!",
                    user:data
                  });
              });

          }
        });
      });
}


exports.getMasterUser=(req,res)=>{
    User.find({role:"master"})
    .select("-hash_password")
    .sort("-createdAt")
    .then(master=>{
        return res.status(201).json({
            success: true,
            master
          });
    })
    .catch(err=>{
        return res.status(400).json({
            error: "Something went wrong",
          });
    })

}

exports.deleteMasterUser=(req,res)=>{
    let userId = req.params.userid
    User.findByIdAndDelete(userId)
    .then(user=>{
        return res.status(201).json({
            success: true,
            message:"Deleted succefully"
          });
    })
    .catch(err=>{
        return res.status(400).json({
            error: "Something went wrong",
          });
    })
}