const express = require("express");
const env = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const aws = require("aws-sdk");

//routes
const authRoutes = require("./routes/auth");
const themeRoutes = require("./routes/theme");
const videoRoutes = require("./routes/video");
const scriptRoutes = require("./routes/script");
const brandingRoutes = require("./routes/branding");
const templateRoutes = require("./routes/template");
const adminRoutes = require("./routes/admin/admin");
const masterRoutes = require("./routes/master/master");

//environment variable or you can say constants
env.config();

//aws config

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "ap-southeast-1",
});

// mongodb connection

mongoose
  .connect(`${process.env.MONGO_DB_URL}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database connected");
  });

app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "uploads")));
app.use("/api/user", authRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/script", scriptRoutes);
app.use("/api/branding", brandingRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/master", masterRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
