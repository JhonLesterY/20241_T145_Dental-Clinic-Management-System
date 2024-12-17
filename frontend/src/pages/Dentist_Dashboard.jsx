import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import DentistSideBar from "../components/DentistSidebar";
import DentistHeader from "../components/DentistHeader";
import { useDentistTheme } from '../context/DentistThemeContext';

const DentistDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useDentistTheme();

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
      <DentistHeader title="Dentist Dashboard" />

        <div className="p-6">
          <div className="space-y-4 mt-8 mx-auto w-full max-w-9xl px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'} mb-4`}>Generate Report</h3>
                <p className={`text-gray-600 ${isDarkMode ? 'text-white' : 'text-gray-600'} mb-4`}>
                  Generate reports on your patients' treatments, appointments, and progress.
                </p>
                <Link to="/generate-report" className={`text-blue-500 hover:underline ${isDarkMode ? 'text-white' : 'text-blue-500'}`}>
                  Generate Report
                </Link>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'} mb-4`}>Accomplish Report</h3>
                <p className={`text-gray-600 ${isDarkMode ? 'text-white' : 'text-gray-600'} mb-4`}>
                  Accomplish and track the progress of completed reports for patients and treatments.
                </p>
                <Link to="/accomplish-report" className={`text-blue-500 hover:underline ${isDarkMode ? 'text-white' : 'text-blue-500'}`}>
                  Accomplish Report
                </Link>
              </div>
            </div>

            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'} mb-6`}>Patient History Information</h3>

            <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <table className="w-full table-auto">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Patient ID</th>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Name</th>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Appointment</th>
                    <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[{ id: 'P001', name: 'John Doe', appointment: '2024-11-25', status: 'Completed' },
                    { id: 'P002', name: 'Jane Smith', appointment: '2024-11-26', status: 'Pending' },
                    { id: 'P003', name: 'Michael Johnson', appointment: '2024-11-27', status: 'Completed' }].map((patient, index) => (
                    <tr key={index} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{patient.id}</td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{patient.name}</td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{patient.appointment}</td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{patient.status}</td>
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
