const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth.js');
const User = require('../models/Users.js');
const router = express.Router();

// @route   POST api/users
// @desc    Create user (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

  const { username, password, role, name, tutorId } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, password, role, name });
    if (role === 'student') user.tutor = tutorId;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if(req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});


// @route   GET api/users/tutors
// @desc    Get all tutors (admin only)
router.get('/tutors', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    res.json(tutors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get students for current tutor
router.get('/students', auth, async (req, res) => {
  try {
    if(req.user.role !== 'tutor') return res.status(403).json({ msg: 'Not authorized' });
    
    const students = await User.find({ 
      role: 'student',
      tutor: req.user.id 
    }).select('-password');
    
    res.json(students);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/tutor/:tutorId/students', async (req, res) => {
  try {
    const students = await User.find({ tutor: req.params.tutorId });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/meetings/tutor/:tutorId', async (req, res) => {
  try {
    const meetings = await Meeting.find({ tutor: req.params.tutorId })
      .populate('student', 'username');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;