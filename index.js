const express = require('express');
const cors = require('cors');
const config = require('./config/config.js');
const auth = require('./routes/auth.js');
const users = require('./routes/users.js');
const meetings = require('./routes/meetings.js');
const { connectDB, seedUsers } = require('./seed.js');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

    // Routes
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/meetings', meetings);
// Database initialization
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    const isConnected = await connectDB();
    if (!isConnected) throw new Error('Database connection failed');
    
    // Seed initial users
    await seedUsers();
    
    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
    
  } catch (err) {
    console.error('Server initialization failed:', err.message);
    process.exit(1);
  }
};

initializeServer();


