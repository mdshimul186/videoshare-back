const Branding = require("../models/branding.model");
const User = require("../models/user.model");

exports.createBranding = (req, res) => {
  let firstLogoURL = req.files.firstLogo && req.files.firstLogo[0].location;
  let secondLogoURL = req.files.secondLogo && req.files.secondLogo[0].location;
  let thirdLogoURL = req.files.secondLogo && req.files.thirdLogo[0].location;
  const {
    brandingName,
    textNameBackgroundHEX,
    textNameBackgroundRGB,
    textRoleBackgroundHEX,
    textRoleBackgroundRGB,
    textNameHEX,
    textNameRGB,
    textRoleHEX,
    textRoleRGB,
    firstBackgroundHEX,
    firstBackgroundRGB,
    secondBackgroundHEX,
    secondBackgroundRGB,
    fontName,
  } = req.body;

  if (!brandingName) {
    return res.status(400).json({ error: "branding name is required" });
  }

  /*
  if (!secondLogoURL) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!logoName) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!firstHEX) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!firstRGB) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!secondHEX) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!secondRGB) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!textNameHEX) {
    return res.status(400).json({ error: "all fields are required" });
  }

  if (!textNameRGB) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!textRoleHEX) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!textRoleRGB) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!firstBackgroundHEX) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!firstBackgroundRGB) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!secondBackgroundHEX) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!secondBackgroundRGB) {
    return res.status(400).json({ error: "all fields are required" });
  }
  if (!fontName) {
    return res.status(400).json({ error: "all fields are required" });
  }

  */

  let _branding = new Branding({
    brandingName,
    textNameBackgroundHEX: textNameBackgroundHEX || '',
    textNameBackgroundRGB: textNameBackgroundRGB || '',
    textRoleBackgroundHEX: textRoleBackgroundHEX || '',
    textRoleBackgroundRGB: textRoleBackgroundRGB || '',
    textNameHEX: textNameHEX || "",
    textNameRGB: textNameRGB || "",
    textRoleHEX: textRoleHEX || '',
    textRoleRGB: textRoleRGB || "",
    firstBackgroundHEX: firstBackgroundHEX || '',
    firstBackgroundRGB: firstBackgroundRGB || '',
    secondBackgroundHEX: secondBackgroundHEX || '',
    secondBackgroundRGB: secondBackgroundRGB || '',
    fontName: fontName || '',
    firstLogoURL: firstLogoURL || '',
    secondLogoURL: secondLogoURL || '',
    thirdLogoURL:thirdLogoURL||"",
    ownerId: req.user._id,
  });
  _branding.save();
  Branding.populate(_branding, {
    path: "ownerId",
    select: "-hash_password",
  })
    .then((branding) => {
      res.status(201).json({ success: true, branding });
    })
    .catch((err) => {
      res.status(400).json({ error: "something went wrong" });
    });
};

exports.getBranding = (req, res) => {
  const ownerId = req.params.ownerid;
  Branding.find({ ownerId: ownerId })
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .then((branding) => {
      res.status(200).json({ success: true, branding });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getMyBranding = (req, res) => {
  Branding.find({ ownerId: req.user._id })
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .then((branding) => {
      res.status(200).json({ success: true, branding });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getBrandingInfo = (req, res) => {
  const brandingId = req.params.brandingid;



  User.findById(req.user._id)
    .then(user => {

      if ((user.branding.branding1 == brandingId) && (user.accessType.branding1 === false)) {
        return res.status(400).json({ error: "you are not allowed to use branding 1" })
      }
      if ((user.branding.branding2 == brandingId) && (user.accessType.branding2 === false)) {
        return res.status(400).json({ error: "you are not allowed to use branding 2" })
      }
      if ((user.branding.branding3 == brandingId) && (user.accessType.branding3 === false)) {
        return res.status(400).json({ error: "you are not allowed to use branding 3" })
      }
      if ((user.branding.branding4 == brandingId) && (user.accessType.branding4 === false)) {
        return res.status(400).json({ error: "you are not allowed to use branding 4" })
      }

      Branding.findById(brandingId)
        .populate("ownerId", "-hash_password")
        .then((branding) => {
          res.status(200).json({ success: true, branding });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });


    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });












};

exports.editBranding = (req, res) => {
  const brandingId = req.params.brandingid;
  let firstLogoURL = req.files.firstLogo && req.files.firstLogo[0].location;
  let secondLogoURL = req.files.secondLogo && req.files.secondLogo[0].location;
  let thirdLogoURL = req.files.thirdLogo && req.files.thirdLogo[0].location;
  const {
    brandingName,
    textNameBackgroundHEX,
    textNameBackgroundRGB,
    textRoleBackgroundHEX,
    textRoleBackgroundRGB,
    textNameHEX,
    textNameRGB,
    textRoleHEX,
    textRoleRGB,
    firstBackgroundHEX,
    firstBackgroundRGB,
    secondBackgroundHEX,
    secondBackgroundRGB,
    fontName,
  } = req.body;


  console.log("from: "+ brandingName)

  let option = {};

  if (brandingName) {
    option.brandingName = brandingName;
  }
  if (textNameBackgroundHEX) {
    option.textNameBackgroundHEX = textNameBackgroundHEX;
  }
  if (textNameBackgroundRGB) {
    option.textNameBackgroundRGB = textNameBackgroundRGB;
  }
  if (textRoleBackgroundHEX) {
    option.textRoleBackgroundHEX = textRoleBackgroundHEX;
  }
  if (textRoleBackgroundRGB) {
    option.textRoleBackgroundRGB = textRoleBackgroundRGB;
  }
  if (textNameHEX) {
    option.textNameHEX = textNameHEX;
  }
  if (textNameRGB) {
    option.textNameRGB = textNameRGB;
  }
  if (textRoleHEX) {
    option.textRoleHEX = textRoleHEX;
  }
  if (textRoleRGB) {
    option.textRoleRGB = textRoleRGB;
  }
  if (firstBackgroundHEX) {
    option.firstBackgroundHEX = firstBackgroundHEX;
  }
  if (firstBackgroundRGB) {
    option.firstBackgroundRGB = firstBackgroundRGB;
  }
  if (secondBackgroundHEX) {
    option.secondBackgroundHEX = secondBackgroundHEX;
  }
  if (secondBackgroundRGB) {
    option.secondBackgroundRGB = secondBackgroundRGB;
  }
  if (fontName) {
    option.fontName = fontName;
  }

  if (firstLogoURL) {
    option.firstLogoURL = firstLogoURL;
  }
  if (secondLogoURL) {
    option.secondLogoURL = secondLogoURL;
  }
  if (thirdLogoURL) {
    option.thirdLogoURL = thirdLogoURL;
  }



  if (Object.keys(option).length == 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }


  User.findById(req.user._id)
    .then(user => {

      if ((user.branding.branding1 == brandingId) && (user.accessType.branding1 === false)) {
        return res.status(400).json({ error: "you are not allowed to edit branding 1" })
      }
      if ((user.branding.branding2 == brandingId) && (user.accessType.branding2 === false)) {
        return res.status(400).json({ error: "you are not allowed to edit branding 2" })
      }
      if ((user.branding.branding3 == brandingId) && (user.accessType.branding3 === false)) {
        return res.status(400).json({ error: "you are not allowed to edit branding 3" })
      }
      if ((user.branding.branding4 == brandingId) && (user.accessType.branding4 === false)) {
        return res.status(400).json({ error: "you are not allowed to edit branding 4" })
      }

      Branding.findById(brandingId).then((branding) => {
        if (branding.ownerId == req.user._id) {
          Branding.findByIdAndUpdate(branding._id, { $set: option }, { new: true })
            .populate("ownerId", "-hash_password")
            .then((updated) => {
              res.status(201).json({ success: true, branding: updated });
            })
            .catch((err) => {
              // console.log(err)
              res.status(400).json({ error: "Something went wrong" });
            });
        } else {
          res.status(400).json({ error: "Not authorized" });
        }
      })
        .catch((err) => {
          // console.log(err)
          res.status(400).json({ error: "Something went wrong" });
        });


    })
    .catch((err) => {
      // console.log(err)
      res.status(400).json({ error: "Something went wrong" });
    });



};

exports.deleteBeanding = (req, res) => {
  const brandingId = req.params.brandingid;

  Branding.findById(brandingId)
    .then((branding) => {
      //console.log(video.ownerId == req.user._id);
      if (branding.ownerId == req.user._id) {
        Branding.findByIdAndDelete(branding._id)
          .then((updated) => {
            res.status(201).json({
              success: true,
              message: "Branding successfully deleted",
            });
          })
          .catch((err) => {
            res.status(400).json({ error: "Something went wrong" });
          });
      } else {
        res.status(400).json({ error: "Not authorized" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};
