const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

// GET patient profile (own profile)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE patient profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { age, gender, phone, address, medicalHistory } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      { age, gender, phone, address, medicalHistory },
      { new: true }
    ).populate('userId', 'name email role');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;