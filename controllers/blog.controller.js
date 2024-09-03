const Joi = require("joi");
const Blogs = require("../modules/Blogs");
const Follow = require("../modules/Follow");

const createBlog = async (req, res) => {
  const isValid = Joi.object({
    title: Joi.string().required(),
    textBody: Joi.string().min(30).required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "invalid input",
    });
  }
  const { title, textBody } = req.body;
  const blogObj = new Blogs({
    title,
    textBody,
    creationDateTime: new Date(),
    username: req.locals.username,
    userId: req.locals.userId,
  });
  try {
    await blogObj.save();
    return res.status(201).send({
      status: 201,
      message: "Blog created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to create a Blog",
    });
  }
};

const getUserBlogs = async (req, res) => {
  const userId = req.locals.userId;
  const page = Number(req.query.page) || 1;
  const LIMIT = 10;
  let blogData;

  try {
    blogData = await Blogs.find({ userId, isDeleted: false })
      .sort({ creationDateTime: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to create a Blog",
    });
  }
  return res.status(200).send({
    status: 200,
    message: "Fetched Blog successfully",
    data: blogData,
  });
};

const deleteBlog = async (req, res) => {
  const userId = req.locals.userId;
  const blogid = req.params.blogid;
  let blogData;
  try {
    blogData = await Blogs.findById(blogid);
    if (!blogData) {
      return res.status(400).send({
        status: 400,
        message: "Blog doesn't exists",
      });
    }
    if (blogData && blogData.userId != userId) {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized to delete a blog",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Blog doesn't exists",
    });
  }
  try {
    // await Blogs.findByIdAndDelete(blogid);
    const blogObj = {
      isDeleted: true,
      deletionDateTime: Date.now(),
    };
    await Blogs.findByIdAndUpdate(blogid, blogObj);

    return res.status(200).send({
      status: 200,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "failed to delete Blog",
    });
  }
};

const editBlog = async (req, res) => {
  const isValid = Joi.object({
    blogid: Joi.string().required(),
    title: Joi.string().required(),
    textBody: Joi.string().min(30).required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "invalid input",
    });
  }
  const { blogid, title, textBody } = req.body;
  const userId = req.locals.userId;
  let blogData;

  try {
    blogData = await Blogs.findById(blogid);
    if (!blogData) {
      return res.status(400).send({
        status: 400,
        message: "Blog doesn't exists",
      });
    }
    if (blogData && blogData.userId != userId) {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized to delete a blog",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Blog doesn't exists",
    });
  }

  const creationDateTime = blogData.creationDateTime;
  const currtime = Date.now();
  const diff = (currtime - creationDateTime) / (1000 * 60);

  if (diff > 30) {
    return res.status(400).send({
      status: 400,
      message: "Not allowed to edit blog after 30 min",
    });
  }
  try {
    await Blogs.findByIdAndUpdate(blogid, { title, textBody });
    return res.status(200).send({
      status: 200,
      message: "Blog updated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to update blog",
    });
  }
};

const getHomepageBlogs = async (req, res) => {
  const currentUserId = req.locals.userId;

  let followingList;
  try {
    followingList = await Follow.find({ currentUserId });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch following user list",
      data: error,
    });
  }

  let followingUserIds = [];
  followingList.forEach((followObj) => {
    followingUserIds.push(followObj.followingUserId);
  });

  try {
    console.log(followingUserIds);
    const homepageBlogs = await Blogs.find({
      userId: { $in: followingUserIds },
      isDeleted: false,
    }).sort({ creationDateTime: -1 });

    return res.status(200).send({
      status: 200,
      message: "fetched homepage blogs",
      data: homepageBlogs,
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch homepage blogs",
    });
  }
};

module.exports = {
  createBlog,
  getUserBlogs,
  deleteBlog,
  editBlog,
  getHomepageBlogs,
};
