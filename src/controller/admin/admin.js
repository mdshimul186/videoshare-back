const User = require('../../models/user.model')
const bcrypt = require("bcryptjs");
let nodemailer = require('nodemailer');
let aws = require('aws-sdk');
const Branding = require('../../models/branding.model')
const validator = require('validator')

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



exports.createMasterUser = (req, res) => {
  const { firstName, lastName, email, password, organization, contact, service, inviteCount } = req.body;
  let profilePicture = req.file && req.file.location
  if (!password) {
    return res.status(200).json({ error: "password reuired" })
  }

  //check invite count params wheather it is valid positive integer value
  if (inviteCount) {

    if (Math.sign(inviteCount) === -1) {
      return res.status(400).json({ error: "Invite count should be valid positive integer value" })
    }
    if (Math.sign(inviteCount) === -0) {
      return res.status(400).json({ error: "Invite count should be valid positive integer value" })
    }
    if (Math.sign(inviteCount) === NaN) {
      return res.status(400).json({ error: "Invite count should be valid positive integer value" })
    }
  }



  User.findOne({ email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    //currently there are 4 branding
    const brandingarray = ['branding1', 'branding2', 'branding3', 'branding4']

    //all the permission will be true for master user
    const hash_password = await bcrypt.hash(password, 10);
    const _masterUser = new User({
      email,
      hash_password,
      firstName,
      lastName,
      jobRole: "",
      role: "master",
      videoGoal: "",
      createdBy: req.user._id,
      approval: {
        isApproved: true,
        trxId: ''
      },
      accessType: {
        branding1: true,
        branding2: true,
        branding3: true,
        branding4: true,
        script: true,
        template: true,
        fullAccess: true
      },
      resetPassToken: "",
      organization: organization || "",
      contact: contact || "",
      service: service || "",
      profilePicture: profilePicture || "",
      inviteCount: parseInt(inviteCount) || 0

    });

    _masterUser.save((error, data) => {
      if (error) {
        
        return res.status(400).json({
          error: "Something went wrong",
        });
      }

      if (data) {

        //create 4 branding manually and set the branding id to user
        brandingarray.map(b => {
          let _branding = new Branding({
            brandingName: b,
            ownerId: data._id
          })
          _branding.save()
            .then(br => {
              if (b === 'branding1') {
                data.updateOne({ $set: { "branding.branding1": br._id } })
                  .then((b1) => {
                    return
                  })
              }
              if (b === 'branding2') {
                data.updateOne({ $set: { "branding.branding2": br._id } })
                  .then((b2) => {
                    return
                  })

              }
              if (b === 'branding3') {
                data.updateOne({ $set: { "branding.branding3": br._id } })
                  .then((b3) => {
                    return
                  })
              }
              if (b === 'branding4') {
                data.updateOne({ $set: { "branding.branding4": br._id } })
                  .then((b4) => {
                    return
                  })
              }

            })

        })


        //send email to new master user
        transporter.sendMail({
          from: 'info.videoshare@gmail.com',
          to: data.email,
          subject: 'account created',
          text: ` Master user account created successfully.your email:${data.email}, password:${password}.
                Please login here: ${process.env.CLIENT_URL}/login`,
          // ses: { // optional extra arguments for SendRawEmail
          //Tags: [{
          //   Name: 'tag name',
          //   Value: 'tag value'
          // }]
          //}
        }, (err, info) => {
          
          return res.status(201).json({
            success: true,
            message: "Master user created Successfully..!",
            user: data
          });
        });

      }
    });
  });
}




exports.editMasterUser = async (req, res) => {
  let userId = req.params.userid
  const { firstName, lastName, email, password, service, organization, contact, isSuspended } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }
  if (validator.isEmail(email) === false) {
    return res.status(400).json({ error: "Invalid email" })
  }
  if (password && password.length < 8) {
    return res.status(400).json({ error: "Password should be more then 8 character" })
  }


  //update the options object according to params received
  let option = {}

  if (password) {
    const hash_password = await bcrypt.hash(password, 10);
    option.hash_password = hash_password
  }

  if (firstName) {
    option.firstName = firstName
  }
  if (lastName) {
    option.lastName = lastName
  }
  if (service) {
    option.service = service
  }
  if (organization) {
    option.organization = organization
  }
  if (contact) {
    option.contact = contact
  }
  if (isSuspended === true) {
    option.isSuspended = true
  }
  if (isSuspended === false) {
    option.isSuspended = false
  }


  User.findById(userId)
    .then(user => {
      if (user) {
        if (user.email === email) {
          User.findByIdAndUpdate(user._id, { $set: option }, { new: true })
            .select("-hash_password")
            .then(updated => {

              transporter.sendMail({
                from: 'info.videoshare@gmail.com',
                to: user.email,
                subject: 'account edited successfully',
                text: ` Master user account edited successfully.your email:${email}, password:${password}`,
              }, (err, info) => {
               
                return res.status(200).json({
                  success: true,
                  user: updated
                })
              });



            })
            .catch(err => {
              return res.status(400).json({
                error: "Something went wrong"
              });
            })
        } else {
          return res.status(400).json({ error: "You can't change email" })
        }



      } else {
        return res.status(400).json({ error: "User not found" })
      }
    })



}


exports.getMasterUser = (req, res) => {
  User.find({ role: "master" })
    .select("-hash_password")
    .sort("-createdAt")
    .then(master => {
      return res.status(201).json({
        success: true,
        master
      });
    })
    .catch(err => {
      return res.status(400).json({
        error: "Something went wrong",
      });
    })

}

exports.deleteMasterUser = (req, res) => {
  let userId = req.params.userid
  User.findByIdAndDelete(userId)
    .then(user => {
      return res.status(200).json({
        success: true,
        message: "Deleted succefully"
      });
    })
    .catch(err => {
      return res.status(400).json({
        error: "Something went wrong",
      });
    })
}


exports.getPendingUser = (req, res) => {
  User.find({ "approval.isApproved": false })
    .then(user => {
      return res.status(200).json({
        success: true,
        user
      })

    })
    .catch(err => {
      return res.status(400).json({
        error: "Something went wrong",
      });
    })
}

exports.approveUser = (req, res) => {
  let userId = req.params.userid
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(400).json({ error: "user not found" })
      }

      user.updateOne({ $set: { "approval.isApproved": true } })
        .then(updated => {
          return res.status(200).json({
            success: true,
          })
        })
        .catch(err => {
          return res.status(400).json({
            error: "Something went wrong",
          });
        })
    })
    .catch(err => {
      return res.status(400).json({
        error: "Something went wrong",
      });
    })
}