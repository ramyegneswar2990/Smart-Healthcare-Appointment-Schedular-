const express = require('express');
const { getDoctors, getDoctor, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctor);
router.put('/profile', protect, updateProfile);

module.exports = router;

