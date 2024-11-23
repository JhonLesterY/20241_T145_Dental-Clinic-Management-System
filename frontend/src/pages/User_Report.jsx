import { useState } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import UserSideBar from "../components/UserSideBar"; // Fixed typo

// Helper function to format dates
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const User_Report = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    appointments: [
      { id: 1, date: "2024-11-15", time: "8:00 - 10:00 AM", status: "Completed" },
      { id: 2, date: "2024-11-20", time: "1:00 - 3:00 PM", status: "Scheduled" },
      { id: 3, date: "2024-11-25", time: "10:30 - 12:30 NN", status: "Cancelled" },
    ]
  });

  const today = new Date().toLocaleDateString();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* UserSideBar */}
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">Reports</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Search Icon (Magnifying Glass) */}
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M16 10a6 6 0 1112 0 6 6 0 01-12 0z"
                  />
                </svg>
              </div>

              {/* Notifications Button */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>
        <div className="w-[78rem] mx-auto my-4"></div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-6 mx-auto w-full max-w-4xl p-4 bg-white border rounded-lg shadow-lg">
          <div className="flex gap-6 items-center mb-6">
            <img className="w-20 h-20 rounded-full border-4 border-blue-500" src={userIcon} alt="User Icon" />
            <div className="text-gray-700 space-y-2">
              <h2 className="text-2xl font-semibold">{userData.name}</h2>
              <p className="text-gray-500 text-lg">{userData.email}</p>
              <p className="text-gray-500">{userData.phone}</p>
            </div>
          </div>
        </div>

        {/* Appointment History Section */}
        <div className="flex flex-col items-center mt-6 mx-auto w-full max-w-7xl">
          <div className="w-full bg-white border rounded-xl shadow-lg max-w-6xl mx-auto p-6">
            <h3 className="text-xl font-semibold mb-4">Appointment History</h3>
            <div className="space-y-4">
              {userData.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${appointment.status === "Cancelled" ? 'bg-red-100' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-gray-700 font-medium">{appointment.date}</span>
                    <span className="text-gray-500">{appointment.time}</span>
                    <span
                      className={`text-sm font-medium ${appointment.status === 'Completed' ? 'text-green-600' : appointment.status === 'Scheduled' ? 'text-blue-600' : 'text-red-600'}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.status === "Cancelled" && (
                    <span className="text-sm text-red-500">Cancelled</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer or Other Sections */}
        <div className="mt-8 mx-auto text-center text-gray-600">
          <p>For more details, contact our support team or visit the FAQ page.</p>
        </div>
      </div>
    </div>
  );
};

export default User_Report;
