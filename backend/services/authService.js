const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const registerUser = async (userData) => {
  const { name, email, password, role, phone, dateOfBirth, specialization, licenseNumber } = userData;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    dateOfBirth,
    ...(role === 'doctor' && { specialization, licenseNumber }),
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

const loginUser = async (email, password) => {
  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

const getUserWithPassword = async (userId) => {
  return await User.findById(userId).select('+password');
};

module.exports = {
  registerUser,
  loginUser,
  getUserWithPassword,
};

