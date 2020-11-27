const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const googleOAuth = require("../utils/googleOAuth");
const { OAuth2Client } = require("google-auth-library");

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
      firstName:"",
      lastName:"",
      jobRole:"",
    role:"user" ,
    videoGoal:""
      
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

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        const { _id, email, firstName, lastName, role, jobRole } = user;
        //res.cookie("videoshare-token", token, { expiresIn: "1d" });
        res.status(200).json({
          success: true,
          token: "Bearer " + token,
          user: { _id, firstName, lastName, email, role, jobRole ,videoGoal,profilePicture},
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
        return res.status(401).json({ error: "token expired" });
      }
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
  const { firstName, lastName, email, jobRole } = req.body;
  User.findById(req.user._id).then((user) => {
    if (user.email === email) {
      User.findByIdAndUpdate(
        user._id,
        { $set: { firstName, lastName, jobRole } },
        { new: true }
      )
        .select("-hash_password")
        .then((updated) => {
          res.status(200).json({ user: updated, success: true });
        });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (user) {
          return res
            .status(400)
            .json({ error: "Email already taken, try another!" });
        } else {
          User.findByIdAndUpdate(
            user._id,
            { $set: { firstName, lastName, email, jobRole } },
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
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
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
