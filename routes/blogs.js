const { Router } = require("express");
const Blog = require("../models/blogs");
const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy", "fullName");
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    return res.render("blogdetails", { user: req.user, blog, createdBy: blog.createdBy });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});



module.exports = router;
