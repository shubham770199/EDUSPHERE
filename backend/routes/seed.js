const express = require('express');
const router = express.Router();
const c = require('../controllers/seedController');

// Open seed endpoint for easy demo resets (educational project).
router.post('/', c.seed);

module.exports = router;
