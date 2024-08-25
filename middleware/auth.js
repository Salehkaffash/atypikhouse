module.exports = {
  // Middleware pour vérifier si l'utilisateur est authentifié
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
  },

  // Middleware pour vérifier si l'utilisateur est un admin ou un hébergeur
  ensureAdminOrHebergeur: function (req, res, next) {
    if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'hebergeur')) {
      return next();
    }
    req.flash('error_msg', 'You do not have permission to view that resource');
    res.redirect('/login');
  },

  // Middleware pour vérifier si l'utilisateur est un admin
  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'You do not have permission to view that resource');
    res.redirect('/login');
  }
};
