import { Link } from "react-router-dom";
import Home from "../components/Home";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png"; // Assuming you have a user icon image
import magnify from "/src/images/magnifying-glass.png"; // Importing search icon

const DentistDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Home />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full shadow-md">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Dashboard Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
              <Link
                to="/dentist-dashboard"
                className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition"
              >
                Dashboard
              </Link>
            </div>

            <div className="flex items-center space-x-8 ml-auto">
              {/* Bell Icon */}
              <button className="inline-flex items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full">
                <img className="w-6" src={bell} alt="Notifications" />
              </button>

              {/* Profile Icon */}
              <a href="/dentist-profile" className="inline-flex items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full">
                <img className="w-6" src={userIcon} alt="Profile" />
              </a>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className="w-[95rem] mx-auto my-4"></div>

        {/* Content Section */}
        <div className="w-full max-w-5xl px-4 space-y-8">
          {/* Two Boxes in a Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generate Report Box */}
            <div className="bg-gray-100 border p-6 shadow-md rounded-lg text-center">
              <h2 className="text-xl font-semibold text-[#003367] mb-2">Generate Report</h2>
              <p className="text-gray-600 mb-4">Create detailed reports based on recent data.</p>
              <button className="bg-[#003367] text-white rounded-full px-6 py-2 hover:bg-blue-700 transition transform hover:scale-105 transition-transform duration-200 ease-in-out">
                Generate
              </button>
            </div>

            {/* Accomplishment Report Box */}
            <div className="bg-gray-100 border p-6 shadow-md rounded-lg text-center">
              <h2 className="text-xl font-semibold text-[#003367] mb-2">Accomplishment Report</h2>
              <p className="text-gray-600 mb-4">Review your recent accomplishments and goals.</p>
              <button className="bg-[#003367] text-white rounded-full px-6 py-2 hover:bg-blue-700 transition transform hover:scale-105 transition-transform duration-200 ease-in-out">
                View Report
              </button>
            </div>
          </div>

          {/* Patient History Information Box */}
          <h2 className="text-xl font-semibold text-[#003367] mb-4">Patient History Information</h2>

          {/* Table for Patient Data */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-gray-100 border">
              <thead>
                <tr className="w-full bg-[#003367] text-white">
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Appointment</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Sample Data Row */}
                <tr className="border-t">
                  <td className="py-3 px-4">001</td>
                  <td className="py-3 px-4">Juan Dela Cruz</td>
                  <td className="py-3 px-4">12/11/2024</td>
                  <td className="py-3 px-4 text-green-600">Completed</td>
                </tr>
                <tr className="border-t">
                  <td className="py-3 px-4">002</td>
                  <td className="py-3 px-4">Maria Santos</td>
                  <td className="py-3 px-4">13/11/2024</td>
                  <td className="py-3 px-4 text-yellow-500">Pending</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistDashboard;
