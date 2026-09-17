const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');

// GET all doctors (public list, for patients to browse)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET own doctor profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE own doctor profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { specialization, experience, qualification, hospital, fees, availableDays, availableTime } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      { specialization, experience, qualification, hospital, fees, availableDays, availableTime },
      { new: true }
    ).populate('userId', 'name email role');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;