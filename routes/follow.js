const express = require("express");

const { isAuth } = require("../middlewears/AuthMiddleware");
const {
  followUser,
  unfollowUser,
} = require("../controllers/follow.controller");

const app = express();

app.post("/follow", isAuth, followUser);
app.post("/unfollow", isAuth, unfollowUser);

module.exports = app;
