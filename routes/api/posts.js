const { Router } = require('express');
const express = require('express');
const router = express.Router();

// GET API/post
// returns post
// access public
router.get('/', (req, res) => res.send('Post route'));

module.exports = router;
