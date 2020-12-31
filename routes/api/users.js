const { Router } = require('express');
const express = require('express');
const router = express.Router();

// GET API/USERS
// returns users
// access public
router.get('/', (req, res) => res.send('User route'));

module.exports = router;
