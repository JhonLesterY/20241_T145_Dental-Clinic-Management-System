import { Link } from 'react-router-dom';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const User_Header_Appointment = () => {
  return (
    <>
      <header className="w-full shadow-lg bg-gray-50">
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
            />
          </div>

          {/* Notification Bell */}
          <button className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 focus:outline-none">
            <img className="w-6" src={bell} alt="Notifications" />
          </button>
        </div>
      </header>

      {/* Divider */}
      <div className=" w-[95rem] mx-auto my-4"></div>
    </>
  );
};

export default User_Header_Appointment;
