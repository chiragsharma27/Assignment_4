const { Router } = require("express");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const isAdmin = require("../middleware/AdminMiddleware");
const Blog = require("../models/blogs");
const Category = require("../models/category");
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

const generateRandomSlug = () => crypto.randomBytes(6).toString("hex");

router.get("/blogs", isAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user._id });
    res.render("dashboard", {
      user: req.user,
      pageTitle: "My Blogs",
      viewPath: "blogs/allBlogs.ejs",
      blogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching blogs. Please try again.");
  }
});

router.get("/blogs/add", isAdmin, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("dashboard", {
      user: req.user,
      pageTitle: "Add New Blog",
      viewPath: "blogs/addBlog",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching categories.");
  }
});

router.post("/blogs/add", isAdmin, upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body, category } = req.body;

    const generateUniqueSlug = async () => {
      let slug;
      let isUnique = false;
      while (!isUnique) {
        slug = crypto.randomBytes(6).toString("hex");
        const existingBlog = await Blog.findOne({ slug });
        isUnique = !existingBlog; 
      }
      return slug;
    };

    const slug = await generateUniqueSlug();

    const newBlog = await Blog.create({
      title,
      description: body,
      createdBy: req.user._id,
      category,
      slug,
      thumbnailImage: req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png",
    });

    res.redirect(`/blogs/${newBlog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).send("Error creating the blog post. Please try again.");
  }
});


router.post("/blogs/delete/:id", isAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/admin/blogs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting the blog.");
  }
});


router.get("/blogs/modify/:id", isAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found.");
    }
    res.render("dashboard", {
      user: req.user,
      pageTitle: "Update Blog",
      viewPath: "blogs/updateBlog.ejs",
      blogs: blog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching blog.");
  }
});

router.post("/blogs/modify/:id", isAdmin, upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body, category } = req.body;

    const description = Array.isArray(body) ? body.join(", ") : body; // Convert array to string if necessary

    const updateData = {
      title,
      description,
      category
    };

    if (req.file) {
      updateData.thumbnailImage = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) {
      return res.status(404).send("Blog not found.");
    }

    res.redirect(`/blogs/${blog._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating blog.");
  }
});


router.get("/categories", isAdmin, async (req, res) => {
  try {
    const categories = await Category.find({ createdBy: req.user._id });
    res.render("dashboard", {
      user: req.user,
      pageTitle: "All Categories",
      viewPath: "blogs/allCategories.ejs",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching categories.");
  }
});

router.get("/categories/add", isAdmin, (req, res) => {
  res.render("dashboard", {
    user: req.user,
    pageTitle: "Add New Category",
    viewPath: "blogs/addCategory.ejs",
  });
});

router.post("/categories/add", isAdmin, async (req, res) => {
  try {
    const { categoryName } = req.body;
    await Category.create({ categoryName, createdBy: req.user._id });
    const categories = await Category.find({ createdBy: req.user._id });
    res.render("dashboard", {
      user: req.user,
      pageTitle: "All Categories",
      viewPath: "blogs/allCategories.ejs",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating the category. Please try again.");
  }
});

router.post("/categories/delete/:id", isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    // res.status(200).send("Category deleted successfully.");
    const categories = await Category.find({ createdBy: req.user._id });
    res.render("dashboard", {
      user: req.user,
      pageTitle: "All Categories",
      viewPath: "blogs/allCategories.ejs",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting the category.");
  }
});


module.exports = router;
