import { NavLink, Link } from "react-router-dom";
import Dashboard from "../components/Home";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import magnify from "/src/images/magnifying-glass.png";

const DentistDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full shadow-md">
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

            {/* Search Box */}
            <div className='flex bg-white gap-1 border rounded-xl justify-self-center px-3 py-0.5'>
              <div className='my-auto'>
                  <img className='w-5' src={magnify} alt="" />
              </div>
              <input type="text" placeholder='Search' className=' p-0.5 outline-none'/>
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
          <div className="bg-white p-8 shadow-2xl rounded-3xl text-gray-800 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-[#003367] mb-4 text-center">
              Appointment Confirmation
            </h1>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Hi, Juan Dela Cruz!</h2>
            <p className="text-sm text-gray-600 mb-3">
              Thank you for scheduling your appointment with us. Below, you’ll find a confirmation of your appointment details. If you need to make any changes, feel free to reach out to our support or adjust your schedule accordingly.
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Please arrive at least 10 minutes early to complete any necessary paperwork. We look forward to seeing you soon and ensuring you receive the best care.
            </p>
            <p className="text-sm text-gray-600 mb-5">
              If you have any questions or need further assistance, please don’t hesitate to contact us.
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

export default DentistDashboard;
