const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchController');

router.get('/search', searchController.searchHebergement);

module.exports = router;
