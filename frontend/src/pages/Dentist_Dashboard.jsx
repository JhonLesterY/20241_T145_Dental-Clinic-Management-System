import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import DentistSideBar from "../components/DentistSidebar";
import DentistHeader from "../components/DentistHeader";
import { useDentistTheme } from '../context/DentistThemeContext';
import LoadingOverlay from "../components/LoadingOverlay";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaCalendarCheck, FaUserInjured, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DentistDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useDentistTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [dentistData, setDentistData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    appointmentStats: {
      today: 0,
      thisWeek: 0,
      completed: 0,
      pending: 0
    },
    patientStats: {
      totalPatients: 0,
      newPatients: 0,
      returningPatients: 0
    },
    treatmentStats: {
      orthodontics: 0,
      cleaning: 0,
      extraction: 0,
      fillings: 0,
      rootCanal: 0,
      other: 0
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dentist profile data
    const fetchDentistProfile = async () => {
      try {
        const dentistId = sessionStorage.getItem('dentist_id');
        const token = sessionStorage.getItem('token');

        if (!token || !dentistId) {
          console.error("No token or dentist ID found");
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dentist profile data:', data);
        setDentistData(data);
        
        // Store data in session storage for other components
        sessionStorage.setItem('fullname', data.fullname || data.name || 'Dentist');
        sessionStorage.setItem('email', data.email || '');
        if (data.profilePicture) {
          sessionStorage.setItem('profilePicture', data.profilePicture);
        }

        // Fetch appointments data for the dentist
        await fetchAppointmentData(dentistId, token);
      } catch (error) {
        console.error("Error fetching dentist profile:", error);
      } finally {
        // Simulate loading data completion
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    fetchDentistProfile();
  }, [navigate]);

  const fetchAppointmentData = async (dentistId, token) => {
    try {
      // Fetch appointments for this dentist
      const appointmentsResponse = await fetch(`http://localhost:5000/dentists/${dentistId}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const appointmentsData = await appointmentsResponse.json();
      
      // For demo purposes, we'll calculate some stats from the appointments
      // In a real app, you might have dedicated API endpoints for these stats
      
      // Mock data - in a real app, you'd process the actual appointment data
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      // Prepare dashboard data
      const stats = {
        upcomingAppointments: appointmentsData.slice(0, 5) || [], // Most recent 5 appointments
        appointmentStats: {
          today: Math.floor(Math.random() * 5), // Random number for demo
          thisWeek: Math.floor(Math.random() * 15 + 5),
          completed: Math.floor(Math.random() * 30 + 20),
          pending: Math.floor(Math.random() * 10 + 5)
        },
        patientStats: {
          totalPatients: Math.floor(Math.random() * 50 + 30),
          newPatients: Math.floor(Math.random() * 10 + 5),
          returningPatients: Math.floor(Math.random() * 40 + 25)
        },
        treatmentStats: {
          orthodontics: Math.floor(Math.random() * 15 + 5),
          cleaning: Math.floor(Math.random() * 25 + 15),
          extraction: Math.floor(Math.random() * 10 + 5),
          fillings: Math.floor(Math.random() * 20 + 10),
          rootCanal: Math.floor(Math.random() * 8 + 2),
          other: Math.floor(Math.random() * 5 + 3)
        }
      };
      
      setDashboardData(stats);
    } catch (error) {
      console.error("Error fetching appointment data:", error);
    }
  };

  // Chart data for patient distribution
  const patientChartData = {
    labels: ['New Patients', 'Returning Patients'],
    datasets: [
      {
        data: [dashboardData.patientStats.newPatients, dashboardData.patientStats.returningPatients],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for treatments
  const treatmentChartData = {
    labels: ['Orthodontics', 'Cleaning', 'Extraction', 'Fillings', 'Root Canal', 'Other'],
    datasets: [
      {
        label: 'Number of Treatments',
        data: [
          dashboardData.treatmentStats.orthodontics,
          dashboardData.treatmentStats.cleaning,
          dashboardData.treatmentStats.extraction,
          dashboardData.treatmentStats.fillings,
          dashboardData.treatmentStats.rootCanal,
          dashboardData.treatmentStats.other,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#ffffff' : '#333333',
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#ffffff' : '#333333',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#ffffff' : '#333333',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  };

  // Function to format date from API response
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'} relative`}>
        <DentistHeader title="Dentist Dashboard" />
        
        <div className="flex-1 relative">
          {isLoading ? (
            <LoadingOverlay 
              message="Loading Dashboard..." 
              isDarkMode={isDarkMode} 
              isTransparent={true}
              fullScreen={false}
            />
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-6 mx-auto w-full max-w-9xl px-4 md:px-8">
                {dentistData && (
                  <div className="mb-6">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>
                      Welcome, {dentistData.fullname || dentistData.name || 'Dentist'}
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Here's an overview of your appointments and patients
                    </p>
                  </div>
                )}
                
                {/* Statistics Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition`}>
                    <div className={`${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-full mr-4`}>
                      <FaCalendarCheck className={`text-xl ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Today's Appointments</p>
                      <h3 className="text-2xl font-bold">{dashboardData.appointmentStats.today}</h3>
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition`}>
                    <div className={`${isDarkMode ? 'bg-green-900' : 'bg-green-100'} p-3 rounded-full mr-4`}>
                      <FaUserInjured className={`text-xl ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Patients</p>
                      <h3 className="text-2xl font-bold">{dashboardData.patientStats.totalPatients}</h3>
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition`}>
                    <div className={`${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} p-3 rounded-full mr-4`}>
                      <FaClipboardList className={`text-xl ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Completed Appointments</p>
                      <h3 className="text-2xl font-bold">{dashboardData.appointmentStats.completed}</h3>
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition`}>
                    <div className={`${isDarkMode ? 'bg-amber-900' : 'bg-amber-100'} p-3 rounded-full mr-4`}>
                      <FaExclamationTriangle className={`text-xl ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Pending Appointments</p>
                      <h3 className="text-2xl font-bold">{dashboardData.appointmentStats.pending}</h3>
                    </div>
                  </div>
                </div>
                
                {/* Charts & Data Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Patient Distribution Chart */}
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Patient Distribution</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <Pie data={patientChartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: isDarkMode ? '#ffffff' : '#333333'
                            }
                          }
                        }
                      }} />
                    </div>
                  </div>
                  
                  {/* Treatment Types Chart */}
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Treatment Types</h3>
                    <div className="h-[300px]">
                      <Bar data={treatmentChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Appointments Table */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Upcoming Appointments</h3>
                    <Link to="/dentist-viewAppointments" className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                      View All
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <tr>
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Patient Name</th>
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Date</th>
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Time</th>
                          <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                          dashboardData.upcomingAppointments.map((appointment, index) => (
                            <tr key={appointment.appointmentId || index} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{appointment.patientName || 'Unknown Patient'}</td>
                              <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(appointment.appointmentDate)}</td>
                              <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{appointment.appointmentTime || 'N/A'}</td>
                              <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  appointment.status === 'confirmed' 
                                    ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                    : isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {appointment.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className={`py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No upcoming appointments
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'} mb-4`}>Generate Report</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      Generate reports on your patients' treatments, appointments, and progress.
                    </p>
                    <Link to="/generate-report" className={`text-blue-500 hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                      Generate Report
                    </Link>
                  </div>

                  <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'} mb-4`}>Add Consultation</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      Record new consultation details for your patients.
                    </p>
                    <Link to="/dentist-addConsultation" className={`text-blue-500 hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                      Add Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DentistDashboard;
