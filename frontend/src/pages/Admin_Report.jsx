import { useState } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import AdminSideBar from "../components/AdminSideBar"; // Assuming you have an AdminSideBar component

const Admin_Report = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const params = new URLSearchParams({
        period: reportType,
        year: year.toString(),
        ...(reportType === 'monthly' && { month: month.toString() })
      });

      const response = await fetch(`http://localhost:5000/admin/reports/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

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

        {/* Main Report Content */}
        <div className="p-6">
          <div className="mb-6 bg-white rounded-lg shadow-md p-4 ">
            <h2 className="text-xl font-semibold mb-4 text-black">Generate Report</h2>
            <div className="flex gap-4 mb-4 text-black">
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border rounded p-2 bg-white"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border rounded p-2 bg-white"
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
                  className="border rounded p-2 bg-white"
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
            </div>
          </div>

          {report && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Report Summary</h3>
              <div className="grid grid-cols-2 gap-4 mb-6 text-black">
                <div>
                  <p>Total Appointments: {report.summary.totalAppointments}</p>
                  <p>Completed: {report.summary.completedAppointments}</p>
                  <p>Cancelled: {report.summary.cancelledAppointments}</p>
                  <p>Pending: {report.summary.pendingAppointments}</p>
                  <p>Completion Rate: {report.summary.completionRate}</p>
                </div>
              </div>

              <h4 className="font-semibold mb-2 text-black">Appointments Detail</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dentist
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.appointments.map((appointment, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.dentistName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
    </div>
  );
};

export default Admin_Report;
