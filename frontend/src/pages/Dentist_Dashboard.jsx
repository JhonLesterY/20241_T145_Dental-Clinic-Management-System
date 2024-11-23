import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import DentistSideBar from "../components/DentistSidebar";

const DentistDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} /> {/* Use UserSideBar for the dentist */}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">Dentist Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
              <Link to="/dentist-profile" className="p-2 rounded-full hover:bg-gray-100 transition">
                <img className="w-6 h-6" src={userIcon} alt="Profile" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-6">
          <div className="space-y-4 mt-8 mx-auto w-full max-w-9xl px-8">

          {/* Report Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 ">
            {/* Generate Report Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#003367] mb-4">Generate Report</h3>
              <p className="text-gray-600 mb-4">
                Generate reports on your patients' treatments, appointments, and progress.
              </p>
              <Link to="/generate-report" className="text-blue-500 hover:underline ">
                Generate Report
              </Link>
            </div>

            {/* Accomplish Report Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#003367] mb-4">Accomplish Report</h3>
              <p className="text-gray-600 mb-4">
                Accomplish and track the progress of completed reports for patients and treatments.
              </p>
              <Link to="/accomplish-report" className="text-blue-500 hover:underline">
                Accomplish Report
              </Link>
            </div>
          </div>

          {/* Patient History Section */}
          <h3 className="text-xl font-semibold text-[#003367] mb-6">Patient History Information</h3>

          <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Patient ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Appointment</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {[{ id: 'P001', name: 'John Doe', appointment: '2024-11-25', status: 'Completed' },
                  { id: 'P002', name: 'Jane Smith', appointment: '2024-11-26', status: 'Pending' },
                  { id: 'P003', name: 'Michael Johnson', appointment: '2024-11-27', status: 'Completed' }].map((patient, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.appointment}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DentistDashboard;
