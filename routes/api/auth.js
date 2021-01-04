const { Router } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.middleware');
const UserModel = require('../../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

// GET API/auth
// sees if the user is authorised
// access public
router.get('/', auth, async (req, res) => {
  try {
    // console.log(req.user.id );
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// POST API/auth
//authenticate user and log in
// access public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //see if user exists
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({
          errors: [
            {
              message:
                'Your email and password combination is wrong. There may be no user with this email.'
            }
          ]
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({
          errors: [{ message: 'Your email and password combination is wrong.' }]
        });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 36000 },
        (error, token) => {
          if (error) throw err;
          console.log(token);
          res.json({ token });
          // return jsonwebtoken
        }
      );

      //no need for this as using  jwt
      //res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
