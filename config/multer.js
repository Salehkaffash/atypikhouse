// config/multer.js
const multer = require('multer');
const path = require('path');

// Configuration du stockage pour les fichiers uploadés
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Génère un nom de fichier unique basé sur la date actuelle
  }
});

// Configuration de multer pour gérer les fichiers image uniquement
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille à 10MB par fichier
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images Only!')); // Erreur si le fichier n'est pas une image
    }
  }
});

module.exports = upload;
