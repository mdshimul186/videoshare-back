const Template = require("../models/template.model");

exports.getTemplate = (req, res) => {
  Template.find()
    .populate("scriptId")
    .then((template) => {
      res.status(200).json({ success: true, template });
    })
    .catch((err) => {
      res.status(400).json({ error: "something went wrong" });
    });
};
