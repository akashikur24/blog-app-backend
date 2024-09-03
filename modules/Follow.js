const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
  // A follow B -> A will be following userId, and B will be follower userId
  currentUserId: {
    type: String,
    require: true,
    ref: "users",
  },
  followingUserId: {
    type: String,
    require: true,
    ref: "users",
  },
  creationDateTime: {
    type: Date,
    require: true,
  },
});
module.exports = mongoose.model("follows", FollowSchema);
