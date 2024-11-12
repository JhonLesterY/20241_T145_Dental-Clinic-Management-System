import { NavLink } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Pagintation_Appointment_Confirmation from "../components/Pagintation_Appointment_Confirmation";
import User_Header_Appointment from "../components/User_Header_Appointment";

const Appointment_Confirmation = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <User_Header_Appointment />

        {/* Content Section */}
        <div className="w-full max-w-3xl mt-6 p-4">
          <div className="bg-white p-6 shadow-lg rounded-xl text-gray-800">
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
              <NavLink to="/view-appointment" className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2 font-medium text-center transition duration-200">
                View
              </NavLink>
              <NavLink to="/appointment" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-medium text-center transition duration-200">
                Cancel
              </NavLink>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagintation_Appointment_Confirmation />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment_Confirmation;
