const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: "User already registered",
      });

    const { email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      email,
      hash_password,
    });

    _user.save((error, data) => {
      if (error) {
        console.log(error);
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (data) {
        return res.status(201).json({
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
      if (user.authenticate(req.body.password)) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        const { _id, email, firstName, lastName, role } = user;
        //res.cookie("videoshare-token", token, { expiresIn: "1d" });
        res.status(200).json({
          token,
          user: { _id, firstName, lastName, email, role },
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};

exports.verify = (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(user._id)
      .select("-hash_password")
      .then((user) => {
        return res.status(200).json({ success: true, user });
      });
  } else {
    return res.status(400).json({ message: "Authorization required" });
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
  User.findOne({ email: req.body.email }).then((user) => {
    bcrypt.compare(req.body.password, user.hash_password, (err, result) => {
      if (result) {
        res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ error: "invalid password" });
      }
    });
  });
};

exports.editPassword = (req, res) => {
  const { currentpassword, newpassword, confirmpassword } = req.body;
  if (!currentpassword) {
    return res.status(400).json({ error: "please provide current password" });
  }
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
  });
};
