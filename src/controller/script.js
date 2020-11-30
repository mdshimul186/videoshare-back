const Script = require("../models/script.model");
const Summary = require("../models/summary.model");
const Template = require("../models/template.model");

exports.createScript = (req, res) => {
  const { title, description, category, note } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title can not be empty" });
  }
  if (!category) {
    return res.status(400).json({ error: "category can not be empty" });
  }
  let _script = new Script({
    title,
    description: description || "",
    category,
    note: note || "",
    ownerId: req.user._id,
  });
  _script.save();
  Script.populate(_script, {
    path: "ownerId",
    select: "-hash_password",
  })
    .then((script) => {
      res.status(201).json({ success: true, script });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: "something went wrong" });
    });
};

exports.getScript = (req, res) => {
  const ownerId = req.params.ownerid;
  Script.find({ ownerId: ownerId })
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .populate("summary")
    .populate("template")
    .then((script) => {
      res.status(200).json({ success: true, script });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getMyScript = (req, res) => {
  Script.find({ ownerId: req.user._id })
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .populate("summary")
    .populate("template")
    .then((script) => {
      res.status(200).json({ success: true, script });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getScriptInfo = (req, res) => {
  const scriptId = req.params.scriptid;
  Script.findById(scriptId)
    .populate("ownerId", "-hash_password")
    .populate("summary")
    .populate("template")
    .then((script) => {
      res.status(200).json({ success: true, script });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.addSummary = (req, res) => {
  const { title,description, optionTitle, optionPosition, optionValue } = req.body;
  const scriptId = req.params.scriptid;
  let _summary = new Summary({
    title,
    description,
    options: {
      title: optionTitle,
      position: optionPosition,
      value: optionValue,
    },
    scriptId,
  });
  _summary
    .save()
    .then((summary) => {
      Script.findByIdAndUpdate(
        scriptId,
        { $push: { summary: summary._id } },
        { new: true }
      )
        .populate("ownerId", "-hash_password")
        .populate("summary")
        .populate("template")
        .then((script) => {
          res.status(200).json({ success: true, script });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.deleteSummary = (req, res) => {
  let scriptId = req.params.scriptid;
  let summaryId = req.params.summaryid;
  Summary.findByIdAndDelete(summaryId)
    .then((deleted) => {
      Script.findByIdAndUpdate(
        scriptId,
        { $pull: { summary: summaryId } },
        { new: true }
      )
        .then((script) => {
          res.status(200).json({ success: true, script });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.addTemplate = (req, res) => {
  const { title,description, optionTitle, optionPosition, optionValue } = req.body;
  const scriptId = req.params.scriptid;
  let _template = new Template({
    title,
    description,
    options: {
      title: optionTitle,
      position: optionPosition,
      value: optionValue,
    },
    scriptId,

  });
  _template
    .save()
    .then((template) => {
      Script.findByIdAndUpdate(
        scriptId,
        { $push: { template: template._id } },
        { new: true }
      )
        .populate("ownerId", "-hash_password")
        .populate("summary")
        .populate("template")
        .then((script) => {
          res.status(200).json({ success: true, script });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.deleteTemplate = (req, res) => {
  let scriptId = req.params.scriptid;
  let templateId = req.params.templateid;
  Template.findByIdAndDelete(templateId)
    .then((deleted) => {
      Script.findByIdAndUpdate(
        scriptId,
        { $pull: { template: templateId } },
        { new: true }
      )
        .then((script) => {
          res.status(200).json({ success: true, script });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.deleteScript = (req, res) => {
  const scriptId = req.params.scriptid;

  Script.findById(scriptId)
    .then((script) => {
      //console.log(video.ownerId == req.user._id);
      if (script.ownerId == req.user._id) {
        Script.findByIdAndDelete(script._id)
          .then((updated) => {
            res
              .status(201)
              .json({ success: true, message: "Script successfully deleted" });
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


exports.createDefaultTemplate=(req,res)=>{
  const { title,description, optionTitle, optionPosition, optionValue } = req.body;
  let _template = new Template({
    title,
    description:description || '',
    options: {
      title: optionTitle,
      position: optionPosition,
      value: optionValue,
    },
    type:"default"
    
  });
  _template
    .save()
    .then((template) => {
      /*
      Script.findByIdAndUpdate(
        scriptId,
        { $push: { template: template._id } },
        { new: true }
      )
        .populate("ownerId", "-hash_password")
        .populate("summary")
        .populate("template")
        .then((script) => {
          res.status(200).json({ success: true, script });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
        */
       res.status(200).json({ success: true, template });


    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: "Something went wrong" });
    });
}

exports.getAllDefaultTemplate=(req,res)=>{
  Template.find({type:"default"})
  .then(template=>{
    res.status(200).json({ success: true, template });

  })
  .catch((err) => {
    res.status(400).json({ error: "Something went wrong" });
  });
}

exports.deleteDefaultTemplate=(req,res)=>{
  let templateId = req.params.templateid
  Template.findByIdAndDelete(templateId)
  .then(template=>{
    res.status(200).json({success:true,message:"template deleted successfully"})
  })
  .catch((err) => {
    res.status(400).json({ error: "Something went wrong" });
  });
}