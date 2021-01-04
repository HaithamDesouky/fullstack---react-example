const { Router } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.middleware');
const Profile = require('../../models/Profile.model');
const User = require('../../models/User.model');
const { check, validationResult } = require('express-validator');
const request = require('request');
require('dotenv').config();

// GET API/profile/me
// returns current users profile
// access private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }

    res.json(profile);
  } catch (err) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @POST API/profile
// @Create or update user profile
// @access Profile

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile object

    const profileField = {};

    profileField.user = req.user.id;
    if (company) profileField.company = company;
    if (website) profileField.website = website;
    if (location) profileField.location = location;
    if (bio) profileField.bio = bio;
    if (status) profileField.status = status;
    if (githubusername) profileField.githubusername = githubusername;
    if (skills) {
      profileField.skills = skills.split(',').map(skill => skill.trim());
    }

    //Build social object
    profileField.social = {};
    if (youtube) profileField.social.youtube = youtube;
    if (twitter) profileField.social.twitter = twitter;
    if (facebook) profileField.social.facebook = facebook;
    if (linkedin) profileField.social.linkedin = linkedin;
    if (instagram) profileField.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileField },
          { new: true }
        );

        return res.json(profile);
      }

      //create
      profile = new Profile(profileField);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }

    res.send('hi');
  }
);

// @GET API/profile
// @Get all profiles
// @access Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.error);
    res.status(500).send('Server Error');
  }
});

// @GET API/user/:user_id
// @Get single profile
// @access Public

router.get('/user/:id', async (req, res) => {
  try {
    console.log(req.params);

    const profile = await Profile.findOne({
      user: req.params.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.error);
    if (err.kind == 'ObjectId') {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }
    res.status(500).send('Server Error');
  }
});

// @Delete API/profile
// @Delete profile
// @access Private post

router.delete('/', auth, async (req, res) => {
  try {
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.error);
    res.status(500).send('Server Error');
  }
});

// @Put API/profile/experience
// @Put add profile experience
// @access Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(err.error);
      res.status(500).send('Server Error');
    }
  }
);

// @DELETE API/profile/experience
// @DELETE delete profile experience
// @access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map(item => item._id === req.params.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    // console.log(profile.experience);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.error);
    res.status(500).send('Server Error');
  }
});

// @Put API/profile/education
// @Put add profile education
// @access Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty(),
      check('fieldOfStudy', 'Field of study is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    };

    // console.log(newEdu);

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      console.log(profile);
      await profile.save();
      res.json(profile);
    } catch (error) {
      res.status(500).send('Server Error');
      console.error(error);
    }
  }
);

// @DELETE API/profile/education
// @DELETE delete profile education
// @access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map(item => item._id === req.params.id)
      .indexOf(req.params.exp_id);
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile.education);
  } catch (err) {
    console.error(err.error);
    res.status(500).send('Server Error');
  }
});

// @GET API/profile/github/:username
// @GET Get github username
// @access Public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GIT_CLIENT_ID}&client_secret=${process.env.GIT_CLIENT_SECRET}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
