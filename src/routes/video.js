const express = require("express");
const {
  createVideo,
  getVideo,
  getMyVideo,
  getVideoInfo,
  editVideo,
  deleteVideo,
  getAllVideo,
} = require("../controller/video");
const { requireSignin } = require("../common-middleware");
//const {} = require("../validators/auth");
const upload = require("../common-middleware/imageUpload");
const videoUpload = require("../common-middleware/videoUpload");
const router = express.Router();

router.get("/getallvideo", getAllVideo);
router.get("/getvideo/:ownerid", getVideo);
router.get("/getmyvideo", requireSignin, getMyVideo);
router.get("/getvideoinfo/:videoid", getVideoInfo);
router.post(
  "/createvideo",
  requireSignin,
  videoUpload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "videoThumbnail",
      maxCount: 1,
    },
  ]),
  createVideo
);
router.patch(
  "/editvideo/:videoid",
  requireSignin,
  videoUpload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "videoThumbnail",
      maxCount: 1,
    },
  ]),
  editVideo
);

router.delete("/delete/:videoid", requireSignin, deleteVideo);

module.exports = router;
