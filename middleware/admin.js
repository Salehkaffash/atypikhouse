// middleware/admin.js
module.exports.ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    } else {
      res.redirect('/login');
    }
  };
  
  