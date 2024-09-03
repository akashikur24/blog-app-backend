const express = require("express");
require("dotenv").config();
const cors = require("cors");

const db = require("./config/db");
const userRoutes = require("./routes/user");

const blogRoutes = require("./routes/blog");
const followRoutes = require("./routes/follow");
const { clearBin } = require("./utils/cron");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const PORT = process.env.PORT;
app.use(express.json());

app.use("/user", userRoutes);

app.use("/blog", blogRoutes);

app.use("/follow", followRoutes);

app.listen(PORT, () => {
  console.log("server is connected to :", PORT);
  clearBin();
});
