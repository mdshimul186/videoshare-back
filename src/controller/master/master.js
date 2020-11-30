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



exports.inviteUser=(req,res)=>{
    const { firstName, lastName, email, password ,jobRole,branding,script,template,fullAccess,trxId} = req.body;

    if(!password){
        return res.status(200).json({error:"password required"})
    }
    if(fullAccess === undefined){
        return res.status(200).json({error:"fullAccess required"})
    }

    let accessType ={
        branding1:false,
        branding2:false,
        branding3:false,
        branding4:false,
        script:false,
        template:false,
        fullAccess:false
    }

    if(fullAccess === true){
        accessType.branding1=true
        accessType.branding2=true
        accessType.branding3=true
        accessType.branding4=true
        accessType.script=true
        accessType.template=true
        accessType.fullAccess=true
    }

    if(fullAccess === false){
        if( branding === 'branding1'){
            accessType.branding1=true
        }else if(branding === 'branding2'){
            accessType.branding2=true
        }else if(branding === 'branding3'){
            accessType.branding3=true
        }else if(branding === 'branding4'){
            accessType.branding4=true
        }
       

        if(script === true){
            accessType.script=true
        }
   
        if(template === true ){
            accessType.template=true
        }
       
    }
    

    User.findOne({ email}).exec(async (error, user) => {
        if (user)
          return res.status(400).json({
            error: "User already registered",
          });
    
        const hash_password = await bcrypt.hash(password, 10);
        const _localUser = new User({
          email,
          hash_password,
          firstName,
          lastName,
          jobRole,
          role: "user",
          videoGoal: "",
          createdBy:req.user._id,
          approval:{
            isApproved:false,
            trxId
          },
          accessType,
          resetPassToken:""
    
        });

        //res.json({_localUser})

      //  console.log(_localUser);
    
        _localUser.save((error, data) => {
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
                subject: 'account invitation',
                text:` Your are invited. Your email:${data.email}, password:${password}`,
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
                    message: "user invited Successfully..!",
                    user:data
                  });
              });

          }
        }); 
      });

     
}


exports.getUserByMaster=(req,res)=>{
    User.find({createdBy:req.user._id})
    .select("-hash_password")
    .sort("-createdAt")
    .then(user=>{
        return res.status(201).json({
            success: true,
            user
          });
    })
    .catch(err=>{
        return res.status(400).json({
            error: "Something went wrong",
          });
    })

}

exports.deleteUser=(req,res)=>{
    let userId = req.params.userid
    User.findById(userId)
    .then(user=>{
      if(!user){
        return res.status(404).json({
          error: "User not found",
        });
      }


      if(user.createdBy != req.user._id){
        return res.status(404).json({
          error: "Permission denied",
        });
      }

      User.findByIdAndDelete(userId)
      .then(deleted=>{
          return res.status(200).json({
              success: true,
              message:"Deleted succefully"
            });
      })
      .catch(err=>{
          return res.status(400).json({
              error: "Something went wrong",
            });
      })

    })
   
}





