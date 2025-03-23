const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  discussion: String,
  recommendations: String,
  referrals: String
});

module.exports = mongoose.model('Meeting', meetingSchema);