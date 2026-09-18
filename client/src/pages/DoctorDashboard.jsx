import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  if (!name) return 'P';
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

function DoctorAppointmentCard({ appointment, onStatusUpdate, updatingId }) {
  const patient = appointment.patientId;
  const patientName = patient?.userId?.name || 'Unknown Patient';
  const isUpdating = updatingId === appointment._id;
  const borderColor = statusBorder[appointment.status] || 'border-l-gray-300';

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 border-l-4 ${borderColor} p-5 flex flex-col hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {getInitials(patientName)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 leading-tight">{patientName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {patient?.age != null ? `${patient.age} yrs` : '—'} · {patient?.gender || '—'}
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-1.5 flex-1 border-t border-gray-100 pt-3">
        <p className="flex justify-between">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium text-gray-800">{patient?.phone || '—'}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="text-gray-400">📅</span> {formatDate(appointment.date)}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="text-gray-400">🕐</span> {appointment.time}
        </p>
      </div>

      {appointment.status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onStatusUpdate(appointment._id, 'accepted')}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Accept'}
          </button>
          <button
            onClick={() => onStatusUpdate(appointment._id, 'rejected')}
            disabled={isUpdating}
            className="flex-1 border border-red-300 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {appointment.status === 'accepted' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onStatusUpdate(appointment._id, 'completed')}
            disabled={isUpdating}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Mark Completed'}
          </button>
        </div>
      )}
    </div>
  );
}

function AppointmentSection({ title, appointments, emptyMessage, onStatusUpdate, updatingId, accentColor }) {
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
            <DoctorAppointmentCard
              key={appointment._id}
              appointment={appointment}
              onStatusUpdate={onStatusUpdate}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setUpdatingId(id);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/appointments/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const pending = appointments.filter((a) => a.status === 'pending');
  const accepted = appointments.filter((a) => a.status === 'accepted');
  const completed = appointments.filter((a) => a.status === 'completed');
  const rejected = appointments.filter((a) => a.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl px-6 py-6 mb-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome, Dr. {user?.name}</h1>
              <p className="text-teal-100 mt-1">Doctor Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium border border-white/40 text-white hover:bg-white/10 transition-colors self-start sm:self-auto"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && (
          <>
            <AppointmentSection
              title="Pending Requests"
              appointments={pending}
              emptyMessage="No pending requests"
              onStatusUpdate={handleStatusUpdate}
              updatingId={updatingId}
              accentColor="bg-yellow-100 text-yellow-700"
            />
            <AppointmentSection
              title="Upcoming (Accepted)"
              appointments={accepted}
              emptyMessage="No accepted appointments"
              onStatusUpdate={handleStatusUpdate}
              updatingId={updatingId}
              accentColor="bg-blue-100 text-blue-700"
            />
            <AppointmentSection
              title="Completed"
              appointments={completed}
              emptyMessage="No completed appointments"
              onStatusUpdate={handleStatusUpdate}
              updatingId={updatingId}
              accentColor="bg-green-100 text-green-700"
            />
            <AppointmentSection
              title="Rejected"
              appointments={rejected}
              emptyMessage="No rejected appointments"
              onStatusUpdate={handleStatusUpdate}
              updatingId={updatingId}
              accentColor="bg-red-100 text-red-700"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
