const corn = require("node-cron");
const Blogs = require("../modules/Blogs");

const clearBin = () => {
  corn.schedule(
    "0 0 1 * * *",
    async () => {
      const deleteBlogs = await Blogs.find({ isDeleted: true });
      if (deleteBlogs.length > 0) {
        deleteBlogs.forEach(async (blog) => {
          const diff =
            (blog.deletionDateTime - blog.creationDateTime) /
            (1000 * 60 * 60 * 24);
          if (diff >= 30) {
            try {
              await Blogs.findByIdAndDelete(blog._id);
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};
module.exports = { clearBin };
