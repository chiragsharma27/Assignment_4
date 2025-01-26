// Middleware to restrict access to admin
const AdminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.redirect("/login"); // Redirect non-admin users
    }
  };
  
  module.exports = AdminMiddleware;