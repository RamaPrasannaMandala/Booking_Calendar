const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-calendar', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const email = 'puppyy2709@gmail.com';
    const user = await User.findOne({ email }).select('+password');
    
    if (user) {
      console.log('✅ User found:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        hasPassword: !!user.password
      });
      
      // Test password comparison
      const testPassword = '#Prasanna3';
      const isPasswordValid = await user.comparePassword(testPassword);
      console.log('🔐 Password test result:', isPasswordValid);
      
    } else {
      console.log('❌ User not found with email:', email);
      
      // List all users in database
      const allUsers = await User.find({}).select('name email');
      console.log('📋 All users in database:', allUsers);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUser();
