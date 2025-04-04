import { useState, useEffect } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import AdminSideBar from "../components/AdminSideBar"; // Assuming you have an AdminSideBar component
import { generatePDF } from '../services/pdfService';
import { useTheme } from '../context/ThemeContext';

const Admin_Report = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login again.');
    }
  }, []);

  const generateReport = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const params = new URLSearchParams({
        period: reportType,
        year: Math.floor(year).toString(),
        ...(reportType === 'monthly' ? { month: Math.floor(month).toString() } : {})
      });

      sessionStorage.setItem('token', token);
      const response = await fetch(`http://localhost:5000/admin/reports/complete?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const pdf = generatePDF(report);
    pdf.download(`dental-clinic-report-${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {isLoading ? (
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
          {/* Blurred overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Generating Report...</h2>
            </div>
          </div>
          
          {/* Placeholder header */}
          <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
                <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Reports</h1>
              </div>
            </div>
          </header>
          
          {/* Placeholder main content */}
          <div className="flex-1 p-6"></div>
        </div>
      ) : (
        /* Main Content */
        <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
          {/* Header */}
          <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
                <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Reports</h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className={`pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <svg
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
                  <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}>
                    <img className="w-6 h-6" src={bell} alt="Notifications" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="w-[78rem] mx-auto my-4"></div>

          {/* Main Report Content */}
          <div className="p-6">
            <div className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Generate Report</h2>
              <div className={`flex gap-4 mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={`border rounded p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
                <select 
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className={`border rounded p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
                    .map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))
                  }
                </select>
                {reportType === 'monthly' && (
                  <select 
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className={`border rounded p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1)
                      .map(month => (
                        <option key={month} value={month}>
                          {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))
                    }
                  </select>
                )}
                <button 
                  onClick={generateReport}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Generate Report
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={!report}
                  className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Download PDF Report
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            {report && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-4 text-black">Report Summary</h3>
                <div className="grid grid-cols-3 gap-4 mb-6 text-black">
                  {/* Appointments Summary */}
                  <div>
                    <h4 className="font-semibold">Appointments</h4>
                    <p>Total: {report.summary.totalAppointments}</p>
                    <p>Completed: {report.summary.completedAppointments}</p>
                    <p>Cancelled: {report.summary.cancelledAppointments}</p>
                    <p>Pending: {report.summary.pendingAppointments}</p>
                    <p>Completion Rate: {report.summary.completionRate}</p>
                  </div>
                  
                  {/* Patient Stats */}
                  <div>
                    <h4 className="font-semibold">Patients</h4>
                    <p>Total Patients: {report.patientStats?.totalPatients}</p>
                    <p>New Patients: {report.patientStats?.newPatients}</p>
                    <p>Growth Rate: {report.patientStats?.patientGrowthRate}</p>
                  </div>
                  
                  {/* Inventory Stats */}
                  <div>
                    <h4 className="font-semibold">Inventory</h4>
                    <p>Total Items: {report.inventoryStats?.totalItems}</p>
                    <p>Low Stock Items: {report.inventoryStats?.lowStockItems}</p>
                    <p>Total Value: ${report.inventoryStats?.totalValue}</p>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-2 text-black">Appointments Detail</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Date
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Patient
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Dentist
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                      {report.appointments.map((appointment, index) => (
                        <tr key={index} className={`${isDarkMode ? index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {new Date(appointment.date).toLocaleDateString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {appointment.patientName}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {appointment.dentistName}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {appointment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin_Report;
