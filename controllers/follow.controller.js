const Joi = require("joi");
const Follow = require("../modules/Follow");
const User = require("../modules/User");

const followUser = async (req, res) => {
  const currentUserId = req.locals.userId;
  const { followingUserId } = req.body;

  const isValid = Joi.object({
    followingUserId: Joi.string().required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "invalid input",
    });
  }
  //verify the userId
  let followingUserData;
  try {
    followingUserData = await User.findById(followingUserId);

    if (!followingUserId) {
      return res.status(400).send({
        status: 400,
        message: "User dosen't exists",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to  fetch user data",
    });
  }

  //check if the current user already follows
  try {
    const followObj = await Follow.findOne({ currentUserId, followingUserId });
    if (followObj) {
      return res.status(400).send({
        status: 400,
        message: "User already follows",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to  fetch follow Object",
    });
  }
  const followObj = new Follow({
    currentUserId,
    followingUserId,
    creationDateTime: Date.now(),
  });

  try {
    await followObj.save();
    return res.status(201).send({
      status: 201,
      message: "Follow Successfull",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to add follow obj",
    });
  }
};

const unfollowUser = async (req, res) => {
  const currentUserId = req.locals.userId;
  const { followingUserId } = req.body;

  const isValid = Joi.object({
    followingUserId: Joi.string().required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "invalid input",
    });
  }
  //check if the current user already follows
  try {
    const followObj = await Follow.findOne({ currentUserId, followingUserId });
    if (!followObj) {
      return res.status(400).send({
        status: 400,
        message: "You dont follow this",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to  fetch follow Object",
    });
  }

  try {
    await Follow.findOneAndDelete({ currentUserId, followingUserId });
    return res.status(200).send({
      status: 200,
      message: "unfollowed sucessful",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to  unfollow user",
    });
  }
};

module.exports = { followUser, unfollowUser };
