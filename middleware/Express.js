const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

const isHebergeurOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'hebergeur')) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

// Utilisation du middleware pour protéger les routes admin
app.use('/admin', isHebergeurOrAdmin, adminRoutes);
