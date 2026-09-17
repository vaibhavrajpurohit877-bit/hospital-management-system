const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  medicalHistory: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);