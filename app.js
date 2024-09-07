const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
require('dotenv').config();
const db = require('./models');
const initializePassport = require('./config/passport');
const path = require('path');

const app = express();
initializePassport(passport);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Configuration pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const homeRoutes = require('./routes/home');
const searchRoutes = require('./routes/search');
const pagesRoutes = require('./routes/pages');
const destinationsRoutes = require('./routes/destinations');
const hebergementsRoutes = require('./routes/hebergements');
const blogRoutes = require('./routes/blog');
const hoteRoutes = require('./routes/hote');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const themesRoutes = require('./routes/themes');
const commentsRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');

// Route pour la page d'accueil
app.use('/', homeRoutes);

// Autres routes
app.use('/', searchRoutes);
app.use('/destinations', destinationsRoutes);
app.use('/hebergements', hebergementsRoutes);
app.use('/blog', blogRoutes);
app.use('/hote', hoteRoutes);
app.use(authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/themes', themesRoutes);
app.use('/comments', commentsRoutes);
app.use('/contact', contactRoutes);
app.use('/newsletter', newsletterRoutes);

// Route pour le panneau d'administration
app.use('/admin', require('./middleware/auth').ensureAdminOrHebergeur, adminRoutes);
app.use('/admin/pages', pagesRoutes);

// Routes pour les pages dynamiques
app.use('/', pagesRoutes);

db.sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables updated!');
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error synchronizing database:', err);
});
