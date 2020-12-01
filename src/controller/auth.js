const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");
const googleOAuth = require("../utils/googleOAuth");
const { OAuth2Client } = require("google-auth-library");
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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    const { email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      email,
      hash_password,
      firstName: "",
      lastName: "",
      jobRole: "",
      role: "master",
      videoGoal: "",
      approval: {
        isApproved: true,
        trxId: ''
      },
      accessType: {
        branding1: false,
        branding2: false,
        branding3: false,
        branding4: false,
        script: false,
        template: false,
        fullAccess: false
      },
      resetPassToken:"",

    });

    _user.save((error, data) => {
      if (error) {
        console.log(error);
        return res.status(400).json({
          error: "Something went wrong",
        });
      }

      if (data) {
        return res.status(201).json({
          success: true,
          message: "User created Successfully..!",
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error) return res.status(400).json({ error });
    
    if (user) {
      bcrypt.compare(req.body.password, user.hash_password, (err, result) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "something went wrong, try again" });
        }
        if (!result) {
          return res.status(400).json({ error: "invalid credentials" });
        }

        if (user.approval.isApproved === false) return res.status(400).json({ error:"Your account is not approved yet" });

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        const {  _id, firstName, lastName, email, role, jobRole, videoGoal, profilePicture ,createdBy,approval,accessType,resetPassToken } = user;
        //res.cookie("videoshare-token", token, { expiresIn: "1d" });
        res.status(200).json({
          success: true,
          token: "Bearer " + token,
          user: { _id, firstName, lastName, email, role, jobRole, videoGoal, profilePicture ,createdBy,approval,accessType,resetPassToken},
        });
      });
    } else {
      return res.status(400).json({ error: "Something went wrong" });
    }
  });
};

exports.verify = (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
      if (err) {
        return res.status(401).json({ error: "token expired or invalid" });
      }

      //if (user.approval.isApproved === false) return res.status(400).json({ error:"Your account is not approved yet" });
      User.findById(user._id)
        .select("-hash_password")
        .then((user) => {
          return res.status(200).json({ success: true, user });
        });
    });
  } else {
    return res.status(401).json({ error: "Authorization required" });
  }
};

exports.editaccountsettings = (req, res) => {
  const { firstName, lastName, email, jobRole, videoGoal } = req.body;
  let option = {}

  if (firstName !== undefined) {
    option.firstName = firstName
  }

  if (lastName !== undefined) {
    option.lastName = lastName
  }

  if (email) {
    option.email = email
  }

  if (jobRole !== undefined) {
    option.jobRole = jobRole
  }

  if (videoGoal !== undefined) {
    option.videoGoal = videoGoal
  }



  if (Object.keys(option).length == 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }


  User.findById(req.user._id).then((user) => {
    if (email && (user.email === email)) {
      User.findByIdAndUpdate(
        user._id,
        { $set: option },
        { new: true }
      )
        .select("-hash_password")
        .then((updated) => {
          res.status(200).json({ user: updated, success: true });
        });
    } else {
      User.findOne({ email: email }).then((user2) => {
        if (user2) {
          return res
            .status(400)
            .json({ error: "Email already taken, try another!" });
        } else {
          User.findByIdAndUpdate(
            user._id,
            { $set: option },
            { new: true }
          )
            .select("-hash_password")
            .then((updated) => {
              res.status(200).json({ user: updated, success: true });
            });
        }
      });
    }
  });
};

exports.confirmpwd = (req, res) => {
  User.findById(req.user._id).then((user) => {
    if (user.hash_password) {
      bcrypt.compare(req.body.password, user.hash_password, (err, result) => {
        if (result) {
          res.status(200).json({ success: true });
        } else {
          return res.status(400).json({ error: "invalid password" });
        }
      });
    } else {
      return res.status(400).json({ error: "invalid password" });
    }
  });
};

exports.editPassword = (req, res) => {
  const { currentpassword, newpassword, confirmpassword } = req.body;

  if (!newpassword) {
    return res.status(400).json({ error: "please provide new password" });
  } else if (newpassword.length < 6) {
    return res
      .status(400)
      .json({ error: "password should not be less then six letter" });
  }

  if (!confirmpassword) {
    return res.status(400).json({ error: "please provide confirm password" });
  } else if (newpassword !== confirmpassword) {
    return res.status(400).json({ error: "confirm password did not matched" });
  }

  User.findById(req.user._id).then((user) => {
    if (user.hash_password === "") {
      return bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newpassword, salt, (err, hash) => {
          User.findByIdAndUpdate(
            user._id,
            { $set: { hash_password: hash } },
            { new: true }
          ).then((newuser) => {
            res.status(200).json({
              success: true,
              message: "password changed successfully",
            });
          });
        });
      });
    } else {
      if (!currentpassword) {
        return res
          .status(400)
          .json({ error: "please provide current password" });
      }

      bcrypt.compare(currentpassword, user.hash_password, (err, result) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "something went wrong, try again" });
        }
        if (!result) {
          return res.status(400).json({ error: "Password invalid" });
        }

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newpassword, salt, (err, hash) => {
            User.findByIdAndUpdate(
              user._id,
              { $set: { hash_password: hash } },
              { new: true }
            ).then((newuser) => {
              res.status(200).json({ message: "password changed successfuly" });
            });
          });
        });
      });
    }
  });
};

exports.editprofileimage = (req, res) => {
  let update = { profilePicture: req.file.location };
  if (update) {
    User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: update.profilePicture } },
      { new: true }
    )
      .then((user) => {
        return res.status(200).json({
          success: true,
          newImageLink: user.profilePicture,
          message: "Image updated successfully",
        });
      })
      .catch((err) => {
        res.status(400).json({ error: "Something went wrong" });
      });
  }
};

exports.googleAuth = (req, res) => {
  client
    .verifyIdToken({
      idToken: req.body.tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then((response) => {
      if (response.payload.email_verified) {
        User.findOne({ email: response.payload.email }).then((user) => {
          if (user.approval.isApproved === false) return res.status(400).json({ error:"Your account is not approved yet" });
          if (user) {
            const token = jwt.sign({ _id: user._id,role:user.role }, process.env.JWT_SECRET, {
              expiresIn: "1d",
            });
            const { _id, email, firstName, lastName, role, jobRole } = user;
            //res.cookie("videoshare-token", token, { expiresIn: "1d" });
            res.status(200).json({
              success: true,
              token: "Bearer " + token,
              user: { _id, firstName, lastName, email, role, jobRole },
            });
          } else {
            const email = response.payload.email;

            const _user = new User({
              email,
            });

            _user.save((error, data) => {
              if (error) {
                console.log(error);
                return res.status(400).json({
                  error: "Something went wrong",
                });
              }

              if (data) {
                const token = jwt.sign(
                  { _id: data._id },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: "1d",
                  }
                );
                const { _id, email, firstName, lastName, role, jobRole } = data;
                //res.cookie("videoshare-token", token, { expiresIn: "1d" });
                res.status(200).json({
                  token: "Bearer " + token,
                  user: { _id, firstName, lastName, email, role, jobRole },
                });
              }
            });
          }
        });
      }
    });
};


exports.forgotPassword=(req,res)=>{
  const {email} = req.body
  User.findOne({email})
  .then(user=>{
    if(!user){
      return res.status(404).json({error:"No user found with this email"})
    }
    jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET_RESET_PASSWORD, {expiresIn: "20m"},(err,token)=>{
      if(err){
        return res.status(400).json({error:"something went wrong"})
      }
      User.findByIdAndUpdate(user._id,{$set:{resetPassToken:token}})
      .then(usernext=>{
        transporter.sendMail({
          from: 'info.videoshare@gmail.com',
          to: usernext.email,
          subject: 'Reset Password',
          html:` <p>Click this <a href="${process.env.CLIENT_URL}/resetpassword?token=${token}">Link</a> and follow the instruction. Token validity 20 minute</p>`,
        }, (err, info) => {
          console.log(info);
          //console.log(err);
          if(err){
            return res.status(400).json({error:"something went wrong"})
          }
          return res.status(200).json({
              success: true,
              message: "email send succesfully",
            });
        });
      })
    });

    

  })
}
