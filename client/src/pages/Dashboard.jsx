import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusBorder = {
  pending: 'border-l-yellow-400',
  accepted: 'border-l-blue-500',
  completed: 'border-l-green-500',
  rejected: 'border-l-red-400',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
}

function getInitials(name) {
  if (!name) return 'DR';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function AppointmentCard({ appointment, onPay, payingId }) {
  const doctor = appointment.doctorId;
  const doctorName = doctor?.userId?.name || 'Unknown Doctor';
  const specialization = doctor?.specialization || '—';
  const borderColor = statusBorder[appointment.status] || 'border-l-gray-300';
  const isPaying = payingId === appointment._id;
  const showPayButton = appointment.status === 'accepted' && appointment.paymentStatus !== 'paid';

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 border-l-4 ${borderColor} p-5 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {getInitials(doctorName)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 leading-tight">Dr. {doctorName}</h3>
            <p className="text-xs text-blue-600 font-medium mt-0.5">{specialization}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1.5">
          <span className="text-gray-400">📅</span> {formatDate(appointment.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-gray-400">🕐</span> {appointment.time}
        </span>
      </div>

      {appointment.status === 'accepted' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {appointment.paymentStatus === 'paid' ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
              ✓ Paid
              {doctor?.fees != null && <span className="text-green-600">(₹{doctor.fees})</span>}
            </span>
          ) : (
            <button
              onClick={() => onPay(appointment)}
              disabled={isPaying}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isPaying ? 'Processing...' : `Pay Now ₹${doctor?.fees ?? 0}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentSection({ title, appointments, emptyMessage, accentColor, onPay, payingId }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accentColor}`}>
          {appointments.length}
        </span>
      </div>
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-lg px-4 py-6 text-center">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onPay={onPay}
              payingId={payingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handlePay = async (appointment) => {
    setPaymentError('');
    setPaymentSuccess('');
    const token = localStorage.getItem('token');

    setPayingId(appointment._id);
    try {
      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        { appointmentId: appointment._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'MediCare',
        description: `Consultation with Dr. ${appointment.doctorId?.userId?.name || ''}`,
        handler: async function (response) {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId: appointment._id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentSuccess('Payment successful!');
            fetchAppointments();
          } catch (err) {
            setPaymentError(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingId(null);
          },
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Failed to start payment. Please try again.');
      setPayingId(null);
    }
  };

  const upcoming = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'accepted'
  );
  const completed = appointments.filter((a) => a.status === 'completed');
  const cancelled = appointments.filter((a) => a.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl px-6 py-6 mb-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome, {user?.name}</h1>
              <p className="text-blue-100 mt-1 capitalize">{user?.role} Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/doctors"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Find Doctors
              </Link>

              <Link
                to="/ai-diagnosis"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
               AI Diagnosis
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {paymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="text-lg">✓</span> {paymentSuccess}
          </div>
        )}

        {paymentError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {paymentError}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <AppointmentSection
              title="Upcoming Appointments"
              appointments={upcoming}
              emptyMessage="No upcoming appointments"
              accentColor="bg-blue-100 text-blue-700"
              onPay={handlePay}
              payingId={payingId}
            />
            <AppointmentSection
              title="Completed Appointments"
              appointments={completed}
              emptyMessage="No completed appointments"
              accentColor="bg-green-100 text-green-700"
              onPay={handlePay}
              payingId={payingId}
            />
            <AppointmentSection
              title="Cancelled Appointments"
              appointments={cancelled}
              emptyMessage="No cancelled appointments"
              accentColor="bg-red-100 text-red-700"
              onPay={handlePay}
              payingId={payingId}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;