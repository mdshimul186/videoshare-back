const Video = require("../models/video.model");

const aws = require("aws-sdk");

const s3 = new aws.S3();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "ap-southeast-1",
});

exports.createVideo = (req, res) => {
  //console.log(req.files.video[0], req.files.videoThumbnail[0]);
  let fileURL = req.files.video && req.files.video[0].location;
  let placeholderImageURL = req.files.videoThumbnail && req.files.videoThumbnail[0].location;
  let { title, description, length, isEffectsApplied ,videoLocalPath} = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  console.log(fileURL,placeholderImageURL)

  let _video = new Video({
    title,
    description: description || "",
    length:length || "",
    isEffectsApplied: isEffectsApplied || false,
    fileURL:fileURL || "",
    placeholderImageURL:placeholderImageURL || "",
    ownerId: req.user._id,
    videoLocalPath:videoLocalPath || ""
  });
  _video.save();
  Video.populate(_video, {
    path: "ownerId",
    select: "-hash_password",
  })
    .then((video) => {
      res.status(201).json({ success: true, video });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: "something went wrong" });
    });
};

exports.getVideo = (req, res) => {
  const ownerId = req.params.ownerid;
  Video.find({ ownerId: ownerId })
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .then((video) => {
      res.status(200).json({ success: true, video });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getMyVideo = (req, res) => {
  Video.find({ ownerId: req.user._id })
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .then((video) => {
      res.status(200).json({ success: true, video });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getVideoInfo = (req, res) => {
  const videoId = req.params.videoid;
  Video.findById(videoId)
    .populate("ownerId", "-hash_password")
    .then((video) => {
      res.status(200).json({ success: true, video });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.editVideo = (req, res) => {
  const videoId = req.params.videoid;
  const { title, description, length, isEffectsApplied ,videoLocalPath} = req.body;

  let fileURL = req.files.video && req.files.video[0].location;
  let placeholderImageURL = req.files.videoThumbnail && req.files.videoThumbnail[0].location;
  
  let option = {};
  if (title) {
    option.title = title;
  }
  if (description) {
    option.description = description;
  }
  if (length) {
    option.length = length;
  }
  if (placeholderImageURL) {
    option.placeholderImageURL = placeholderImageURL;
  }
  if (fileURL) {
    option.fileURL = fileURL;
  }
  if (videoLocalPath) {
    option.videoLocalPath = videoLocalPath;
  }
  if (isEffectsApplied === false) {
    option.isEffectsApplied = false;
  }
  if (isEffectsApplied) {
    option.isEffectsApplied = true;
  }


  if (Object.keys(option).length == 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  Video.findById(videoId).then((video) => {
    //console.log(video.ownerId == req.user._id);
    if (video.ownerId == req.user._id) {
      Video.findByIdAndUpdate(video._id, { $set: option }, { new: true })
        .populate("ownerId", "-hash_password")
        .then((updated) => {
          res.status(201).json({ success: true, video: updated });
        })
        .catch((err) => {
          res.status(400).json({ error: "Something went wrong" });
        });
    } else {
      res.status(400).json({ error: "Not authorized" });
    }
  });
};

exports.deleteVideo = (req, res) => {
  const videoId = req.params.videoid;

  Video.findById(videoId)
    .then((video) => {
      if (video.ownerId == req.user._id) {
        var params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: video.fileURL.split(".com/")[1],
        };

        s3.deleteObject(params, function (err, data) {
          if (err) {
            console.log(err, err.stack);
            return res.status(400).json({ error: "Something went wrong" });
          }
          // an error occurred
          console.log(data);
          Video.findByIdAndDelete(video._id)
            .then((updated) => {
              res
                .status(201)
                .json({ success: true, message: "Video successfully deleted" });
            })
            .catch((err) => {
              res.status(400).json({ error: "Something went wrong" });
            });
        });
      } else {
        res.status(400).json({ error: "Not authorized" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};

exports.getAllVideo = (req, res) => {
  Video.find()
    .sort("-createdAt")
    .populate("ownerId", "-hash_password")
    .then((video) => {
      res.status(200).json({ success: true, video });
    })
    .catch((err) => {
      res.status(400).json({ error: "Something went wrong" });
    });
};
