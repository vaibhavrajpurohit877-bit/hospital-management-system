const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');

// BOOK an appointment (patient only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    // find the logged-in patient's Patient record
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date,
      time
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET logged-in patient's appointments
router.get('/patient', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET logged-in doctor's appointments
router.get('/doctor', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE appointment status (doctor only — accept/reject/complete)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;