const Theme = require("../models/theme.model");

exports.getTheme = (req, res) => {
  const ownerId = req.params.ownerid;
  Theme.find({ ownerId: ownerId })
    .then((theme) => {
      res.status(200).json({ success: true, theme });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getMyTheme = (req, res) => {
  Theme.find({ ownerId: req.user._id })
    .sort("-createdAt")
    .then((theme) => {
      res.status(200).json({ success: true, theme });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getThemeInfo = (req, res) => {
  const themeId = req.params.themeid;
  Theme.findById(themeId)
    .then((theme) => {
      res.status(200).json({ success: true, theme });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.createTheme = (req, res) => {
  const { name, systemName, price } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!systemName) {
    return res.status(400).json({ error: "systemName is required" });
  }
  if (!price) {
    return res.status(400).json({ error: "price is required" });
  }
  const imageURL = req.file && req.file.location;
  if (imageURL) {
    let _theme = new Theme({
      name,
      systemName,
      imageURL,
      price,
      ownerId: req.user._id,
    });
    _theme.save();
    Theme.populate(_theme, {
      path: "ownerId",
      select: "-hash_password",
    })
      .then((theme) => {
        res.status(201).json({ success: true, theme });
      })
      .catch((err) => {
        res.status(400).json({ error: "Something went wrong" });
      });
  }
};

exports.editTheme = (req, res) => {
  const themeId = req.params.themeid;
  const { name, systemName, price } = req.body;
  const imageURL = req.file && req.file.location;
  let option = {};
  if (name) {
    option.name = name;
  }
  if (systemName) {
    option.systemName = systemName;
  }
  if (price) {
    option.price = price;
  }
  if (imageURL) {
    option.imageURL = imageURL;
  }
  if (Object.keys(option).length == 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  Theme.findById(themeId).then((theme) => {
    
    if (theme.ownerId == req.user._id) {
      Theme.findByIdAndUpdate(theme._id, { $set: option }, { new: true })
        .then((updated) => {
          res.status(201).json({ success: true, theme: updated });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    } else {
      res.status(400).json({ error: "Not authorized" });
    }
  });
};
