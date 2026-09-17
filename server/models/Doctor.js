const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    default: ''
  },
  experience: {
    type: Number, // years
    default: 0
  },
  qualification: {
    type: String
  },
  hospital: {
    type: String
  },
  fees: {
    type: Number,
    default: 0
  },
  availableDays: {
    type: [String], // e.g. ['Monday', 'Wednesday', 'Friday']
    default: []
  },
  availableTime: {
    type: String // e.g. "10:00 AM - 4:00 PM" — keeping it simple for MVP
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);