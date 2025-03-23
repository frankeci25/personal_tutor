const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/Users');  
const config = require('./config/config');

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect(config. MONGODB_URI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    console.log('✅ MongoDB Connected');
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    return false;
  }
};

// Main seed function
const seedUsers = async () => {
  try {
    // Admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: await bcrypt.hash('adminpass', 10),
        role: 'admin'
      });
      await admin.save();
      console.log('👑 Admin user created');
    } else {
      console.log('👑 Admin user already exists');
    }

    // Tutor user
    const tutorExists = await User.findOne({ username: 'tutor1' });
    if (!tutorExists) {
      const tutor = new User({
        username: 'tutor1',
        password: await bcrypt.hash('passone', 10),
        role: 'tutor'
      });
      await tutor.save();
      console.log('🎓 Tutor user created');
    } else {
      console.log('🎓 Tutor user already exists');
    }

    // Add to seedUsers function
  const studentExists = await User.findOne({ username: 'student1' });
  if (!studentExists) {
    const tutor = await User.findOne({ username: 'tutor1' });
    const student = new User({
      username: 'student1',
      password: await bcrypt.hash('studentpass', 10),
      role: 'student',
      tutor: tutor._id
    });
    await student.save();
    console.log('🎒 Student user created');
  }

    console.log('🚀 Seeding completed successfully');
    return true;
  } catch (err) {
    console.error('🔥 Seeding error:', err);
    throw err;
  }
};

// Run as standalone script
if (require.main === module) {
  (async () => {
    const connected = await connectDB();
    if (!connected) process.exit(1);
    
    try {
      await seedUsers();
    } catch (err) {
      process.exit(1);
    } finally {
      await mongoose.disconnect();
    }
  })();
}

module.exports = {
  connectDB,
  seedUsers
};