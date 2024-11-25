import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react"; // Add this
import Dashboard from "../components/Dashboard";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import magnify from "/src/images/magnifying-glass.png";

const Appointment_Confirmation = () => {
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    fetchAppointment();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchAppointment();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchAppointment = async () => {
    try {
      // Add this console log to verify the token
      const token = sessionStorage.getItem('token');
      console.log('Current token:', token);
  
      const response = await fetch('http://localhost:5000/appointments/latest', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to fetch appointment');
      
      const data = await response.json();
      console.log('Fetched appointment data:', data); // Add this debug log
      setAppointment(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full shadow-lg">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Appointment Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
              <Link
                to="/appointment"
                className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition"
              >
                Appointment
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex items-center bg-white border rounded-xl px-3 py-1">
              <img className="w-5" src={magnify} alt="Search icon" />
              <input
                type="text"
                placeholder="Search"
                className="ml-2 p-1 outline-none w-full"
                aria-label="Search for appointments"
              />
            </div>
              
            {/* Bell Icon */}
            <div className="flex items-center">
              <button className="bg-gray-100 border-0 p-3 rounded-full hover:bg-gray-200">
                <img className="w-6" src={bell} alt="notifications" />
              </button>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className='border w-[95rem] mx-auto'></div>

       {/* Content Section */}
<div className="w-full max-w-4xl mt-6 px-4">
  <div className="bg-gray-50 border shadow-lg p-8 shadow-lg rounded-3xl text-gray-800 max-w-4xl mx-auto">
    <h1 className="text-2xl font-semibold text-[#003367] mb-4 text-center">
      Appointment Confirmation
    </h1>
    
    {isLoading ? (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    ) : appointment ? (
      <>
        <h2 className="text-lg font-medium text-gray-700 mb-2">
          Hi, {appointment.patientName}!
        </h2>

        {/* Appointment Status Badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
            Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="bg-white p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Appointment Details:</h3>
          <p className="text-sm text-gray-600">Appointment ID: {appointment.appointmentId}</p>
          <p className="text-sm text-gray-600">Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">Time: {appointment.appointmentTime}</p>
        </div>

        {/* Status-specific messages */}
        {appointment.status === 'confirmed' ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <p className="text-sm text-green-700">
              Your appointment has been confirmed! Please arrive 10 minutes early.
            </p>
          </div>
        ) : appointment.status === 'declined' ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-700">
              Your appointment has been declined. Please schedule a new appointment or contact us for assistance.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-700">
              Your appointment is pending confirmation. We will notify you once it's confirmed.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-3">
          If you need to make any changes, feel free to reach out to our support or adjust your schedule accordingly.
        </p>
        <p className="text-sm text-gray-600 mb-5">
          If you have any questions or need further assistance, please don't hesitate to contact us.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <NavLink
            to="/view-appointment"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2 font-medium text-center transition duration-200 transform hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            View
          </NavLink>
          <NavLink
            to="/appointment"
            className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-medium text-center transition duration-200 transform hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            Cancel
          </NavLink>
        </div>
      </>
    ) : (
      <div className="text-center py-8 text-gray-500">
        No appointment found
      </div>
    )}
  </div>

  {/* Pagination Section */}
  <div className="flex justify-between w-full mt-10 max-w-4xl">
    <NavLink
      to="/appointment"
      className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
    >
      Back
    </NavLink>
  </div>
</div>
      </div>
    </div>
  );
};

export default Appointment_Confirmation;
