const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE a Razorpay order for a given appointment
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'accepted') {
      return res.status(400).json({ message: 'Payment is only allowed for accepted appointments' });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This appointment is already paid' });
    }

    const fees = appointment.doctorId.fees || 0;
    const amountInPaise = Math.round(fees * 100); // Razorpay expects amount in paise

    if (amountInPaise <= 0) {
      return res.status(400).json({ message: 'Invalid consultation fee for this doctor' });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${appointment._id}`,
    });

    appointment.razorpayOrderId = order.id;
    await appointment.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      doctorName: appointment.doctorId.userId ? undefined : undefined, // not needed here
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VERIFY payment after checkout completes
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.paymentStatus = 'paid';
    appointment.razorpayPaymentId = razorpay_payment_id;
    await appointment.save();

    res.json({ message: 'Payment verified successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;