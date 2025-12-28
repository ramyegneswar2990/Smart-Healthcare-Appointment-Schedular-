const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor' })
    .select('name email specialization licenseNumber bio skills awards location profileImage rating experienceYears')
    .sort({ name: 1 });

  res.json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc    Get single doctor
// @route   GET /api/users/doctors/:id
// @access  Public
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findOne({
    _id: req.params.id,
    role: 'doctor',
  }).select('name email specialization licenseNumber bio skills awards location profileImage');

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  res.json({
    success: true,
    data: doctor,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const fieldsToUpdate = [
    'name',
    'phone',
    'specialization',
    'bio',
    'skills',
    'awards',
    'location',
    'profileImage',
    'notificationPreferences',
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: updatedUser,
  });
});

module.exports = {
  getDoctors,
  getDoctor,
  updateProfile,
};

