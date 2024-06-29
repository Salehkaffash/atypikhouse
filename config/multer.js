const multer = require('multer');
const path = require('path');

// Définir le stockage pour les fichiers uploadés
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Répertoire où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nomme le fichier avec un timestamp
  }
});

// Initialiser multer avec le stockage défini
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille de fichier à 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Types de fichiers acceptés
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

module.exports = upload;
