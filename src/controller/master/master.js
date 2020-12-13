const User = require('../../models/user.model')
const Branding = require('../../models/branding.model')
const bcrypt = require("bcryptjs");
let nodemailer = require('nodemailer');
let aws = require('aws-sdk');
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



exports.inviteUser = (req, res) => {
  const { firstName, lastName, email, password, jobRole, branding, script, template, fullAccess, trxId } = req.body;

  if (!password) {
    return res.status(200).json({ error: "password required" })
  }
  if (fullAccess === undefined) {
    return res.status(200).json({ error: "fullAccess required" })
  }

  let accessType = {
    branding1: false,
    branding2: false,
    branding3: false,
    branding4: false,
    script: false,
    template: false,
    fullAccess: false
  }


  //if full access is true, all the acess will be true

  if (fullAccess === true) {
    accessType.branding1 = true
    accessType.branding2 = true
    accessType.branding3 = true
    accessType.branding4 = true
    accessType.script = true
    accessType.template = true
    accessType.fullAccess = true
  }

  //if full access is false, update the accessType object according to individual access value received from user
  if (fullAccess === false) {
    if (branding === 'branding1') {
      accessType.branding1 = true
    } else if (branding === 'branding2') {
      accessType.branding2 = true
    } else if (branding === 'branding3') {
      accessType.branding3 = true
    } else if (branding === 'branding4') {
      accessType.branding4 = true
    }


    if (script === true) {
      accessType.script = true
    }

    if (template === true) {
      accessType.template = true
    }

  }

  //currently there are 4 branding 
  const brandingarray = ['branding1', 'branding2', 'branding3', 'branding4']


  User.findOne({ email }).exec(async (error, user) => {
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
      createdBy: req.user._id,
      approval: {
        isApproved: true,
        trxId
      },
      accessType,
      resetPassToken: ""

    });


    User.findById(req.user._id)
      .then(master => {
        if (master.inviteCount <= 0) {
          return res.status(400).json({ error: "You have no invites left" })
        }

        _localUser.save((error, data) => {
          if (error) {
            console.log(error);
            return res.status(400).json({
              error: "Something went wrong",
            });
          }

          if (data) {

            //after saving new user create 4 branding,save and set the branding objectid to new user
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

            //send mail to newly invited user
            transporter.sendMail({
              from: 'info.videoshare@gmail.com',
              to: data.email,
              subject: 'account invitation',
              text: ` Your are invited. Your email:${data.email}, password:${password}. Please login here: ${process.env.CLIENT_URL}/login`,
              // ses: { // optional extra arguments for SendRawEmail
              //Tags: [{
              //   Name: 'tag name',
              //   Value: 'tag value'
              // }]
              //}
            }, (err, info) => {
              console.log(info);
              console.log(err);

              //decrease invite count value b 1 from master user
              User.findByIdAndUpdate(master._id, { $inc: { "inviteCount": -1 } }, { new: true })
                .select("-hash_password")
                .then(master2 => {

                  return res.status(201).json({
                    success: true,
                    message: "user invited Successfully..!",
                    user: data,
                    master2
                  });
                })
            });
          }
        });
      })
  });


}


exports.getUserByMaster = (req, res) => {
  User.find({ createdBy: req.user._id })
    .select("-hash_password")
    .sort("-createdAt")
    .then(user => {
      return res.status(201).json({
        success: true,
        user
      });
    })
    .catch(err => {
      return res.status(400).json({
        error: "Something went wrong",
      });
    })
}

exports.deleteUser = (req, res) => {
  let userId = req.params.userid
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }


      if (user.createdBy != req.user._id) {
        return res.status(404).json({
          error: "Permission denied",
        });
      }

      User.findByIdAndDelete(userId)
        .then(deleted => {
          User.findByIdAndUpdate(req.user._id, { $inc: { "inviteCount": 1 } }, { new: true })
            .select("-hash_password")
            .then(master2 => {

              return res.status(200).json({
                success: true,
                message: "Deleted succefully",
                user: master2,

              });
            })
        })
        .catch(err => {
          return res.status(400).json({
            error: "Something went wrong",
          });
        })

    })

}



exports.editLocalUser = async (req, res) => {
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


//update option obj dynamically by user input
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
        if (user.createdBy != req.user._id) {
          return res.status(404).json({
            error: "Permission denied",
          });
        }


        if (user.email === email) {
          User.findByIdAndUpdate(user._id, { $set: option }, { new: true })
            .select("-hash_password")
            .then(updated => {

              transporter.sendMail({
                from: 'info.videoshare@gmail.com',
                to: user.email,
                subject: 'account edited successfully',
                text: ` Local user account edited successfully.your email:${email}, password:${password}`,
              }, (err, info) => {
                console.log(info);
                console.log(err);
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





