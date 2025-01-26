const { Router } = require("express");
const User = require("../models/user");
const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (err) {
    return res.render("signin", {
      error: "Invalid email or password",
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, isAdmin } = req.body;
    const role = isAdmin ? "admin" : "user"; 
    await User.create({ fullName, email, password, role });
    return res.redirect("/");
  } catch (error) {
    // console.error(err);
    return res.status(500).send("Error during signup.");
  }
});

router.get("/signout", (req, res) => {
  return res.clearCookie("token").redirect("/user/signin");
});

module.exports = router;