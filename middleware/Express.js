const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

// Utilisation du middleware pour protéger les routes admin
app.use('/admin', isAdmin, adminRoutes);
