const { Router } = require('express');
const express = require('express');
const router = express.Router();

// GET API/auth
// returns auth
// access public
router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;
