const Script = require("../models/script.model");
const Summary = require("../models/summary.model");
const Template = require("../models/template.model");

exports.createScript = (req, res) => {
  const { title, description, note, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title can not be empty" });
  }

  let _script = new Script({
    title,
    description: description || "",
    category: "script",
    note: note || "",
    ownerId: req.user._id,
    status
  });
  _script.save()
    // Script.populate(_script, {
    //   path: "ownerId",
    //   select: "-hash_password",
    // })
    .then((script) => {
      res.status(201).json({ success: true, script });
    })
    .catch((err) => {
     
      res.status(400).json({ error: "something went wrong" });
    });
};

exports.editScript=(req,res)=>{
  let scriptId = req.params.scriptid
  const { title, description, note, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title can not be empty" });
  }
  let data = {
    title,
    description: description || "",
    note: note || "",
    status
  };

  Script.findByIdAndUpdate(scriptId,{$set:data},{new:true})
  .then((script) => {
    res.status(201).json({ success: true, script });
  })
  .catch((err) => {
    
    res.status(400).json({ error: "something went wrong" });
  });
}

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
  const { title, description, options } = req.body;
  const scriptId = req.params.scriptid;
  let _summary = new Summary({
    title,
    description,
    options: options,
    scriptId,
  });
  _summary
    .save()
    .then((summary) => {
      options.map(op => {
        summary.updateOne({ $push: { options: op } })
          .then(op2 => {

          })
      })


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





exports.createSummary = (req, res) => {
  const { title, description, options, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" })
  }
  let _script = new Script({
    title,
    description: description || "",
    category: "summary",
    note: "",
    ownerId: req.user._id,
    status: status || 'saved'
  });

  _script.save()
    .then(script => {
      let _summary = new Summary({
        title,
        description: description || '',
        scriptId: script._id,

      });

      _summary
        .save()
        .then((summary) => {

          options.map(op => {
            summary.updateOne({ $push: { options: op } })
              .then(op2 => {

              })
          })

          Script.findByIdAndUpdate(
            script._id,
            { $push: { summary: summary._id } },
            { new: true }
          )
            .populate("ownerId", "-hash_password")
            .populate("summary")
            .populate("template")
            .then((updated) => {
              res.status(200).json({ success: true, script: updated });
            })
            .catch((err) => {
              res.status(400).json({ error: "Something went wrong" });
            });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    })
}







exports.deleteSummary = (req, res) => {
  let scriptId = req.params.scriptid;
  let summaryId = req.params.summaryid;
  Summary.findByIdAndDelete(summaryId)
    .then((deleted) => {
      Script.findByIdAndDelete(scriptId,)
        .then((script) => {
          res.status(200).json({ success: true });
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
  const { title, description, options } = req.body;
  const scriptId = req.params.scriptid;

  let _template = new Template({
    title,
    description,
    options: options,
    scriptId,

  });
  _template
    .save()
    .then((template) => {

      options.map(op => {
        template.updateOne({ $push: { options: op } })
          .then(op2 => {

          })
      })

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





exports.createTemplate = (req, res) => {
  const { title, description, options, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" })
  }
  let _script = new Script({
    title,
    description: description || "",
    category: "template",
    note: "",
    ownerId: req.user._id,
    status: status || ''
  });

  _script.save()
    .then(script => {
      let _template = new Template({
        title,
        description: description || '',
        scriptId: script._id,

      });

      _template
        .save()
        .then((template) => {
          options.map(op => {
            template.updateOne({ $push: { options: op } })
              .then(op2 => {

              })
          })

          Script.findByIdAndUpdate(
            script._id,
            { $push: { template: template._id } },
            { new: true }
          )
            .populate("ownerId", "-hash_password")
            .populate("summary")
            .populate("template")
            .then((updated) => {
              res.status(200).json({ success: true, script: updated });
            })
            .catch((err) => {
              res.status(400).json({ error: "Something went wrong" });
            });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    })
}





exports.editTemplate = (req, res) => {
  let scriptId = req.params.scriptid;
  let templateId = req.params.templateid;

  const { title, description, options, status } = req.body;

  if (!scriptId && !templateId) {
    return res.status(400).json({ error: "all params are required" })
  }
  if (!title) {
    return res.status(400).json({ error: "title is required" })
  }
  if (!options) {
    return res.status(400).json({ error: "options are required" })
  }

  let templatedata = {
    title,
    description: description || "",

  }

  Template.findByIdAndUpdate(templateId, { $set: { title, options: [] } })
    .then(template => {
      options.map(op => {
        template.updateOne({ $push: { options: op } })
          .then(op2 => {

          })
      })
      Script.findByIdAndUpdate(
        scriptId,
        { $set: { template: template._id, title,status:status||'saved' } },
        { new: true }
      )
        .populate("ownerId", "-hash_password")
        .populate("summary")
        .populate("template")
        .then((updated) => {
          res.status(200).json({ success: true, script: updated });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });


    })
}




exports.editSummary = (req, res) => {
  let scriptId = req.params.scriptid;
  let summaryId = req.params.summaryid;

  const { title, description, options, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" })
  }
  if(!scriptId || !summaryId){
    return res.status(400).json({ error: "script and summary id are required" })
  }
  let data ={
    title,
    description: description || "",
    ownerId: req.user._id,
    status: status || 'saved'
  };


  Summary.findByIdAndUpdate(summaryId, { $set: { title, options: [] } })
    .then(summary => {
      options.map(op => {
        summary.updateOne({ $push: { options: op } })
          .then(op2 => {

          })
      })
      Script.findByIdAndUpdate(
        scriptId,
        { $set: { summary: summary._id, title,status:status||'saved' } },
        { new: true }
      )
        .populate("ownerId", "-hash_password")
        .populate("summary")
        .populate("template")
        .then((updated) => {
          res.status(200).json({ success: true, script: updated });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });


    })
}






exports.deleteTemplate = (req, res) => {
  let scriptId = req.params.scriptid;
  let templateId = req.params.templateid;
  Template.findByIdAndDelete(templateId)
    .then((deleted) => {
      Script.findByIdAndDelete(scriptId)
        .then((script) => {
          res.status(200).json({ success: true });
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


exports.createDefaultTemplate = (req, res) => {
  const { title, description, options } = req.body;

  let _template = new Template({
    title,
    description,
    type: "default"
  });
  _template
    .save()
    .then((template) => {

      options.map((op, index) => {
        Template.findByIdAndUpdate(template._id, { $push: { options: op }, $set: { type: "default" } }, { new: true })
          .then(op2 => {

            if (index === (options.length - 1)) {
              return res.status(200).json({ success: true, template: op2 });
            }
          })
      })


      // Template.findById(template._id)
      // .then(templatenew=>{

      // })



    })
    .catch((err) => {
      
      res.status(400).json({ error: "Something went wrong" });
    });
}

exports.getAllDefaultTemplate = (req, res) => {
  Template.find({ type: "default" })
    .then(template => {
      res.status(200).json({ success: true, template });

    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
}

exports.deleteDefaultTemplate = (req, res) => {
  let templateId = req.params.templateid
  Template.findById(templateId)
    .then(template => {
      if (template.type === 'default') {
        Template.findByIdAndDelete(templateId)
          .then(template => {
            res.status(200).json({ success: true, message: "template deleted successfully" })
          })
          .catch((err) => {
            res.status(400).json({ error: "Something went wrong" });
          });
      } else {
        res.status(400).json({ error: "This not a default template" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });

}