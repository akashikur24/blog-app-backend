const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../modules/User");
const jwt = require("jsonwebtoken");
const Follow = require("../modules/Follow");
const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);

//post register user
const registerUser = async (req, res) => {
  // Data validation
  const isValid = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid Input",
    });
  }
  try {
    const userExists = await User.find({
      $or: [{ email: req.body.email, username: req.body.username }],
    }); //or is query for the data
    if (userExists.length != 0) {
      return res.status(400).send({
        status: 400,
        message: "Username/Email already exists",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Error while checking username and email exists",
      data: error,
    });
  }
  const hashPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

  const userObj = new User({
    name: req.body.name,
    username: req.body.username,
    password: hashPassword,
    email: req.body.email,
  });
  try {
    await userObj.save();
    return res.status(201).send({
      status: 201,
      message: "user registered successfully",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Error while saving user to DB",
      data: err,
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const inValid = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  if (inValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid username / Password",
      data: isValid.error,
    });
  }
  let userData;
  try {
    userData = await User.findOne({ username });
    if (!userData) {
      return res.status(400).send({
        status: 400,
        message: "No user found please register",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Error while fetching user data",
      data: err,
    });
  }

  const isPasswordSame = await bcrypt.compare(password, userData.password);
  if (!isPasswordSame) {
    return res.status(400).send({
      status: 400,
      message: "Incorrect password",
    });
  }
  const payload = {
    username: userData.username,
    name: userData.name,
    email: userData.email,
    userId: userData._id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return res.status(200).send({
    status: 200,
    message: "User Logged in successfully",
    data: token,
  });
};

const getAllUsers = async (req, res) => {
  const userId = req.locals.userId;

  let userData;
  try {
    userData = await User.find({ _id: { $ne: userId } });
    if (!userData) {
      return res.status(400).send({
        status: 400,
        message: "Failed to fetch all the users",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch all the users",
    });
  }
  let followingList;
  try {
    followingList = await Follow.find({ currentUserId: userId });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch all the following users",
    });
  }

  let usersList = [];

  let followingMap = new Map();

  followingList.forEach((user) => {
    followingMap.set(user.followingUserId, true);
  });

  userData.forEach((user) => {
    if (followingMap.get(user._id.toString())) {
      let userObj = {
        name: user.name,
        username: user.username,
        email: user.email,
        _id: user._id,
        follow: true,
      };
      usersList.push(userObj);
    } else {
      let userObj = {
        name: user.name,
        username: user.username,
        email: user.email,
        _id: user._id,
        follow: false,
      };
      usersList.push(userObj);
    }
  });

  return res.status(200).send({
    status: 200,
    message: "All users fetched successfully",
    data: usersList,
  });
};

module.exports = { registerUser, loginUser, getAllUsers };
