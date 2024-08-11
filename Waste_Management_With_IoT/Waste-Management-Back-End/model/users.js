const connectToDatabase = require('./index');
const mongoose = require('mongoose');

// Establish the database connection
connectToDatabase();

// Validation function for email
const emailValidator = {
  validator: (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  },
  message: 'Invalid email format',
};

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensures uniqueness
    validate: emailValidator,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  batch: {
    type: String,
    required: [true, 'Batch is required'],
  },
  status: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'user',
  },
}, { versionKey: false, collection: 'users' });

// User Model
const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
