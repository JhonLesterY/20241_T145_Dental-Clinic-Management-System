import Dashboard from "../components/Dashboard";
import User_Header_Appointment from "../components/User_Header_Appointment";
import { NavLink } from "react-router-dom";

const User_Appointment = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2">
        {/* Header */}
        <User_Header_Appointment />

        {/* Appointment Content */}
        <div className="flex flex-col items-center mt-5 mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-[#003367] mb-6 text-center">
            Book Your Appointment
          </h2>

          {/* Date Section */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md px-2 py-1 bg-white-gray shadow-md text-gray-700">
                Today October 15, 2024
            </div>
          </div>
          </div>

          {/* Appointment Slot Section */}
          <div className="w-full bg-white-gray border shadow-md p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
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
              { time: "3:00 - 5:00 PM", status: "Available Slots" },
            ].map((slot, index) => (
              <div key={index} className="flex justify-between items-center py-4 mb-4 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <input type="radio" name="appointmentSlot" className="form-radio text-blue-500" />
                  <div className="text-gray-700 font-medium">{slot.time}</div>
                </div>
                <div className="text-green-600 font-semibold">{slot.status}</div>
              </div>
            ))}
          </div>


          {/* Pagination Section */}
          <div className="flex justify-between w-full mt-10 max-w-4xl">
            <NavLink
              to="/dashboard"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Back
            </NavLink>
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
