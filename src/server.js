const express = require("express");
const env = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

//routes
const authRoutes = require("./routes/auth");
const themeRoutes = require("./routes/theme");
const videoRoutes = require("./routes/video");
const scriptRoutes = require("./routes/script");
const brandingRoutes = require("./routes/branding");
const templateRoutes = require("./routes/template");

//environment variable or you can say constants
env.config();

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

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
