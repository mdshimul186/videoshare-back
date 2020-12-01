const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Branding = require('./branding.model')

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      max: 20,
      default:""
    },
    lastName: {
      type: String,
      trim: true,
      max: 20,
       default:""
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      trim: true,
      default: "",
    },
    hash_password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin","master"],
      default: "user",
    },
    jobRole: {
      type: String,
      default: "",
    },
    videoGoal: {
      type: String,
      default: "",
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approval:{
      isApproved:{type:Boolean,default:false},
      trxId:{type:String,default:""}
    },
    accessType:{
      branding1:{type:Boolean,default:false},
      branding2:{type:Boolean,default:false},
      branding3:{type:Boolean,default:false},
      branding4:{type:Boolean,default:false},
      script:{type:Boolean,default:false},
      template:{type:Boolean,default:false},
      fullAccess:{type:Boolean,default:false}
    },
    resetPassToken:{
      type: String,
      default: "",
    },
    branding:{
      branding1:{type: mongoose.Schema.Types.ObjectId,ref: "Branding",default:new Branding({brandingName:"branding1"})},
      branding2:{type: mongoose.Schema.Types.ObjectId,ref: "Branding",default:new Branding({brandingName:"branding2"})},
      branding3:{type: mongoose.Schema.Types.ObjectId,ref: "Branding",default:new Branding({brandingName:"branding3"})},
      branding4:{type: mongoose.Schema.Types.ObjectId,ref: "Branding",default:new Branding({brandingName:"branding4"})},
    }
  },
  { timestamps: true }
);

// userSchema.virtual('password')
// .set(function(password){
//     this.hash_password = bcrypt.hashSync(password, 10);
// });

// userSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

userSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.hash_password);
  },
};

module.exports = mongoose.model("User", userSchema);
