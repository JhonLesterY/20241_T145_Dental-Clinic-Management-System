import { useState } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import DentistSideBar from "../components/DentistSidebar";

const Dentist_Report = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
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

              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <img className="w-6 h-6" src={bell} alt="Notifications" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-[78rem] mx-auto my-4"></div>

        {/* Main Dashboard Content */}
        <div className="p-6">
          {/* Appointments Summary Section */}
          <h3 className="text-xl font-semibold text-[#003367] mb-6">Appointments Summary</h3>

          <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Appointment ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Patient Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {[{ id: 'A001', name: 'John Doe', date: '2024-11-25', status: 'Completed' },
                  { id: 'A002', name: 'Jane Smith', date: '2024-11-26', status: 'Pending' },
                  { id: 'A003', name: 'Michael Johnson', date: '2024-11-27', status: 'Completed' }].map((appointment, index) => (
                  <tr key={appointment.id} className="border-t">
                    <td className="py-3 px-4 text-sm text-gray-600">{appointment.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{appointment.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{appointment.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_Report;
