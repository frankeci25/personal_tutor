const express = require('express');
const auth = require('../middleware/auth.js');
const Meeting = require('../models/Meetings.js');
const User = require('../models/Users.js');
const router = express.Router();

// @route   POST api/meetings
// @desc    Create meeting (tutor only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ msg: 'Not authorized' });

  const { studentId, discussion, recommendations, referrals } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ msg: 'Invalid student' });
    }

    const newMeeting = new Meeting({
      student: studentId,
      tutor: req.user.id,
      discussion,
      recommendations,
      referrals
    });

    await newMeeting.save();
    
    // Fetch the complete meeting with populated fields to return
    const populatedMeeting = await Meeting.findById(newMeeting._id)
      .populate('student', 'username email name')
      .populate('tutor', 'username');
      
    res.json(populatedMeeting);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meetings/tutor/:tutorId
// @desc    Get specific tutor's meetings
router.get('/tutor/:tutorId', auth, async (req, res) => {
  try {
    // Check if the requesting user is the tutor or an admin
    if (req.user.role !== 'admin' && req.params.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const meetings = await Meeting.find({ tutor: req.params.tutorId })
      .populate('student', 'username email name') // Include more student fields
      .populate('tutor', 'username')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meetings/tutor
// @desc    Get current tutor's meetings
router.get('/tutor', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ msg: 'Not authorized' });

  try {
    const meetings = await Meeting.find({ tutor: req.user.id })
      .populate('student', 'username email name') // Include username and other fields
      .populate('tutor', 'username')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meetings/student/:studentId
// @desc    Get student's meetings
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Check if the requesting user is the student, their tutor, or an admin
    const isStudent = req.user.role === 'student' && req.params.studentId === req.user.id;
    const isTutor = req.user.role === 'tutor';
    const isAdmin = req.user.role === 'admin';
    
    if (!isStudent && !isAdmin && !isTutor) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // If user is a tutor, make sure they are assigned to the student
    if (isTutor && !isAdmin) {
      const student = await User.findById(req.params.studentId);
      if (!student || !student.tutor || student.tutor.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    }

    const meetings = await Meeting.find({ student: req.params.studentId })
      .populate('student', 'username email name')
      .populate('tutor', 'username')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meetings/admin
// @desc    Get all meetings (admin only)
router.get('/admin', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

  try {
    const meetings = await Meeting.find()
      .populate('student', 'username email name') // Include username field
      .populate('tutor', 'username')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meetings/:id
// @desc    Get meeting by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('student', 'username email name')
      .populate('tutor', 'username');
    
    if (!meeting) {
      return res.status(404).json({ msg: 'Meeting not found' });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isTutor = req.user.role === 'tutor' && meeting.tutor.toString() === req.user.id;
    const isStudent = req.user.role === 'student' && meeting.student._id.toString() === req.user.id;
    
    if (!isAdmin && !isTutor && !isStudent) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    res.json(meeting);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Meeting not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;