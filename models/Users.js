// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['tutor', 'admin', 'student'], required: true },
//   name: String,
//   tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// });

// module.exports = mongoose.model('User', userSchema);
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'tutor', 'student'] }
});

module.exports = mongoose.model('User', userSchema); 