import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🏥 MediCare Hospital Management
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Book appointments with trusted doctors, effortlessly
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            A simple platform connecting patients and doctors — manage appointments,
            track your health journey, and get care faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-900 mb-1">Easy Booking</h3>
            <p className="text-sm text-gray-500">Book appointments with available doctors in seconds</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">👨‍⚕️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Verified Doctors</h3>
            <p className="text-sm text-gray-500">Browse specialists across various fields</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900 mb-1">Track Everything</h3>
            <p className="text-sm text-gray-500">Manage your appointments from one dashboard</p>
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-400 py-6">
        Trusted by patients and doctors
      </footer>
    </div>
  );
}

export default Home;