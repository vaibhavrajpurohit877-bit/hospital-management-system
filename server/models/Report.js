const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  prediction: {
    type: String,
    enum: ['PNEUMONIA', 'NORMAL'],
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  imageName: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);