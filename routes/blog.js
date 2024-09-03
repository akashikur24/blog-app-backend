const express = require("express");
const { isAuth } = require("../middlewears/AuthMiddleware");
const {
  createBlog,
  getUserBlogs,
  deleteBlog,
  editBlog,
  getHomepageBlogs,
} = require("../controllers/blog.controller");

const app = express();

app.post("/create-blog", isAuth, createBlog);

app.get("/get-user-Blog", isAuth, getUserBlogs);

app.delete("/delete-blog/:blogid", isAuth, deleteBlog);

app.put("/edit-blog", isAuth, editBlog);

app.get("/homepage-blog",isAuth, getHomepageBlogs);

module.exports = app;
