const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor'],
      required: [true, 'Please specify a role'],
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    specialization: {
      type: String,
      trim: true,
      // Only for doctors
    },
    licenseNumber: {
      type: String,
      trim: true,
      // Only for doctors
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    awards: [
      {
        title: { type: String },
        organization: { type: String },
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      news: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Automatically set profile image if not present
  if (!this.profileImage || this.profileImage === '') {
    if (this.role === 'doctor') {
      // Professional portrait for doctors
      this.profileImage = `https://i.pravatar.cc/150?u=${this._id}`;
    } else {
      // Clean letter-based avatar for patients
      this.profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3182CE&color=fff&bold=true`;
    }
  }

  next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

