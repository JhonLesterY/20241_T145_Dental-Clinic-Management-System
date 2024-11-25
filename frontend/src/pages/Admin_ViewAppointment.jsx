import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import Logo from "/src/images/Dental_logo.png";
import { FaCheck, FaTimes } from 'react-icons/fa'; // For confirm/decline icons

const Admin_ViewAppointment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {

    
    try {
      const response = await fetch('http://localhost:5000/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      console.log('Fetched appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setUpdateStatus({ loading: true, error: null });
      
      console.log('Updating status for appointment:', appointmentId); // Debug log
      
      const response = await fetch(`http://localhost:5000/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment status');
      }
  
      const updatedAppointment = await response.json();
      console.log('Updated appointment:', updatedAppointment); // Debug log
  
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.appointmentId === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
  
      alert(`Appointment ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update appointment status');
    } finally {
      setUpdateStatus({ loading: false, error: null });
    }
  };

  const confirmStatusUpdate = (appointmentId, newStatus) => {
    const action = newStatus === 'confirmed' ? 'confirm' : 'decline';
    if (window.confirm(`Are you sure you want to ${action} this appointment?`)) {
      handleStatusUpdate(appointmentId, newStatus);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">
                View Appointments
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.appointmentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'declined' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => confirmStatusUpdate(appointment.appointmentId, 'confirmed')}
                            disabled={updateStatus.loading}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <FaCheck className="mr-2" />
                            Accept
                          </button>

                          <button
                            onClick={() => confirmStatusUpdate(appointment.appointmentId, 'declined')}
                            disabled={updateStatus.loading}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <FaTimes className="mr-2" />
                            Decline
                          </button>
                        </div>
                      )}
                      {appointment.status !== 'pending' && (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No appointments found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin_ViewAppointment;