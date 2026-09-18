import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function DoctorList() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor`);
        setDoctors(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const openBookingModal = (doctor) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/doctors' } });
      return;
    }

    setSelectedDoctor(doctor);
    setDate('');
    setTime('');
    setBookingError('');
    setSuccessMessage('');
  };

  const closeBookingModal = () => {
    setSelectedDoctor(null);
    setDate('');
    setTime('');
    setBookingError('');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!date || !time) {
      setBookingError('Please select both date and time.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setBookingError('You must be logged in to book an appointment.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointments`,
        { doctorId: selectedDoctor._id, date, time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Appointment booked successfully!');
      closeBookingModal();
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Doctors</h1>
          <p className="mt-2 text-gray-600">Browse our specialists and book an appointment</p>
        </div>

        {!isLoggedIn && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
            Please{' '}
            <Link to="/login" state={{ from: '/doctors' }} className="font-medium underline hover:text-amber-900">
              log in
            </Link>{' '}
            as a patient to book an appointment.
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="text-lg">✓</span> {successMessage}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
            <p className="text-gray-400 mt-2">Please check back later.</p>
          </div>
        )}

        {!loading && !error && doctors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-gray-100 flex flex-col overflow-hidden"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {getInitials(doctor.userId?.name)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                        Dr. {doctor.userId?.name || 'Unknown'}
                      </h2>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {doctor.specialization || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Experience</span>
                      <span className="font-medium text-gray-800">
                        {doctor.experience} {doctor.experience === 1 ? 'year' : 'years'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Qualification</span>
                      <span className="font-medium text-gray-800">{doctor.qualification || '—'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Hospital</span>
                      <span className="font-medium text-gray-800">{doctor.hospital || '—'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Fees</span>
                      <span className="font-semibold text-green-700">₹{doctor.fees ?? 0}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Timing</span>
                      <span className="font-medium text-gray-800">{doctor.availableTime || '—'}</span>
                    </p>
                  </div>

                  {doctor.availableDays?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Available Days</p>
                      <div className="flex flex-wrap gap-1.5">
                        {doctor.availableDays.map((day) => (
                          <span
                            key={day}
                            className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => openBookingModal(doctor)}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {getInitials(selectedDoctor.userId?.name)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Dr. {selectedDoctor.userId?.name}
                  </h2>
                  <p className="text-sm text-blue-100">{selectedDoctor.specialization}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {bookingError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {bookingError}
                </p>
              )}

              <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  id="appointment-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  id="appointment-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorList;
