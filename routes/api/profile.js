const { Router } = require('express');
const express = require('express');
const router = express.Router();

// GET API/profile
// returns profile
// access public
router.get('/', (req, res) => res.send('profile route'));

module.exports = router;