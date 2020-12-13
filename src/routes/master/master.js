const express = require("express");
const { inviteUser, getUserByMaster, deleteUser, editLocalUser } = require("../../controller/master/master");
const {
    requireSignin,
    masterUserMiddleware,
} = require("../../common-middleware");

const {
    validateInviteUser,
    isRequestValidated,
} = require("../../validators/master");
//const upload = require("../common-middleware/imageUpload");

const router = express.Router();

router.get("/master", requireSignin, masterUserMiddleware, (req, res) => {
    console.log("master");
});

router.post("/inviteuser",requireSignin,masterUserMiddleware,validateInviteUser,isRequestValidated,inviteUser);

router.patch("/edituser/:userid", requireSignin, masterUserMiddleware, editLocalUser)

router.get('/getuserbymaster', requireSignin, masterUserMiddleware, getUserByMaster)
router.delete('/deleteuser/:userid', requireSignin, masterUserMiddleware, deleteUser)

module.exports = router;
