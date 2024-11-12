import Dashboard from "../components/Dashboard";
import User_Header_Appointment from "../components/User_Header_Appointment";
import User_Pagintation from "../components/User_Pagintation";

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
        <div className="flex flex-col items-center mt-10 mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-[#003367] mb-8 text-center">
            Book Your Appointment
          </h2>

          {/* Date Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md px-2 py-1 bg-gray-200 text-gray-700">
                Today
              </div>
              <div className="text-lg text-gray-800 font-medium">October 15, 2024</div>
            </div>
          </div>

          {/* Appointment Slot Section */}
          <div className="w-full bg-white p-6 rounded-xl shadow-lg max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-medium text-gray-700">October 18, 2024</div>
              <div className="text-lg font-medium text-gray-700">Friday</div>
            </div>

            <div className="border-t my-4"></div>

            {/* Slot Options */}
            {[
              { time: "8:00 - 10:00 AM", status: "Available Slots" },
              { time: "10:30 - 12:30 NN", status: "Available Slots" },
              { time: "1:00 - 3:00 PM", status: "Available Slots" },
              { time: "3:00 - 5:00 PM", status: "Available Slots" },
            ].map((slot, index) => (
              <div key={index} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <input type="radio" name="appointmentSlot" className="form-radio text-blue-500" />
                  <div className="text-gray-700 font-medium">{slot.time}</div>
                </div>
                <div className="text-green-600 font-semibold">{slot.status}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <User_Pagintation />
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Appointment;
