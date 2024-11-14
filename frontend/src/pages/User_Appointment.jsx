import { Link, NavLink } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import magnify from "/src/images/magnifying-glass.png";

const User_Appointment = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-gray-50 text-gray-700">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="w-full shadow-lg bg-gray-50">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Appointment Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental logo" />
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

            {/* Notification Bell */}
            <button
              className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 focus:outline-none"
              aria-label="Notifications"
            >
              <img className="w-6" src={bell} alt="Notifications" />
            </button>
          </div>
        </header>

        <div className="w-[95rem] mx-auto my-4"></div>

        {/* Appointment Content */}
        <div className="flex flex-col items-center mt-5 mx-auto w-full max-w-5xl">
          <h1 className="text-3xl font-semibold text-[#003367] mb-6 text-center">
            Book Your Appointment
          </h1>

          {/* Date Section */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md px-2 py-1 bg-gray-100 shadow-md text-gray-700">
                Today: October 15, 2024
              </div>
            </div>
          </div>

          {/* Appointment Slot Section */}
          <div className="w-full bg-gray-100 border shadow-md p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="text-lg font-medium text-gray-700">October 18, 2024</div>
              <div className="text-lg font-medium text-gray-700">Friday</div>
            </div>

            <div className="border-t my-4 border shadow-md"></div>

            {/* Slot Options */}
            {[
              { time: "8:00 - 10:00 AM", status: "Available Slots" },
              { time: "10:30 - 12:30 NN", status: "Available Slots" },
              { time: "1:00 - 3:00 PM", status: "Available Slots" },
              { time: "3:00 - 5:00 PM", status: "Available Slots" }
            ].map((slot, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-4 mb-4 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="appointmentSlot"
                    className="form-radio text-blue-500"
                    id={`slot-${index}`}
                  />
                  <label
                    htmlFor={`slot-${index}`}
                    className="text-gray-700 font-medium"
                  >
                    {slot.time}
                  </label>
                </div>
                <div className="text-green-600 font-semibold">{slot.status}</div>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-4">
            <NavLink
              to="/upload-requirements"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Next
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Appointment;
