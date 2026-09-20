const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

// SAVE a new AI diagnosis report for the logged-in patient
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { prediction, confidence, imageName } = req.body;

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const report = await Report.create({
      patientId: patient._id,
      prediction,
      confidence,
      imageName
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reports for the logged-in patient
router.get('/', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const reports = await Report.find({ patientId: patient._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;