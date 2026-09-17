import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // hide navbar on login/register pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register')  {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={user?.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'} className="text-xl font-bold text-blue-600">
          MediCare
        </Link>

        <div className="flex items-center gap-4">
          {user?.role === 'patient' && (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <Link to="/doctors" className="text-gray-700 hover:text-blue-600">Find Doctors</Link>
            </>
          )}
          {user?.role === 'doctor' && (
            <Link to="/doctor-dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;