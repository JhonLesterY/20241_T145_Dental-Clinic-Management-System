import { useState, useEffect } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import DentistSideBar from "../components/DentistSidebar";
import { useDentistTheme } from '../context/DentistThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const Dentist_AddConsultation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useDentistTheme();
  const [appointments, setAppointments] = useState([]);
  const [inventoryMedicines, setInventoryMedicines] = useState([]);
  const [formData, setFormData] = useState({
    appointmentId: "",
    patientName: "",
    consultationDate: "",
    consultationDetails: "",
    toothNumber: "", // Replace contactNumber with toothNumber
    prescription: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from sessionStorage (backend token)
        const token = sessionStorage.getItem('token');
        
        // Debug: Log the token and decode it
        if (token) {
          const decodedToken = jwtDecode(token);
          console.log('Decoded Backend Token:', decodedToken);
          console.log('Dentist ID from Token:', decodedToken.id);
        }

        const [appointmentsResponse, inventoryResponse] = await Promise.all([
          axios.get('http://localhost:5000/appointments/confirmed', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get('http://localhost:5000/inventory')
        ]);
        
        console.log('Fetched Appointments:', appointmentsResponse.data);
        
        // Add a check if no appointments
        if (appointmentsResponse.data.length === 0) {
          console.warn('No confirmed appointments found');
        }
        
        setAppointments(appointmentsResponse.data);
        setInventoryMedicines(inventoryResponse.data.filter(item => item.quantity > 0));
      } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error.message);
      }
    };

    // Fetch data when component mounts
    fetchData();
  }, []);

  const handleAppointmentSelect = (event) => {
    const selectedAppointment = appointments.find(
      app => app.appointmentId === event.target.value
    );
    if (selectedAppointment) {
      setFormData(prev => ({
        ...prev, 
        appointmentId: selectedAppointment.appointmentId,
        patientName: selectedAppointment.patientName,
        toothNumber: "", // Initialize tooth number as empty
        consultationDate: selectedAppointment.appointmentDate || new Date().toISOString().split('T')[0]
      }));
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const addMedicinePrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescription: [...prev.prescription, { medicineId: '', quantity: 1 }]
    }));
  };

  const updateMedicinePrescription = (index, field, value) => {
    const newPrescription = [...formData.prescription];
    
    if (field === 'medicineId') {
      // Find the selected medicine
      const selectedMedicine = inventoryMedicines.find(med => med._id === value);
      
      newPrescription[index] = {
        medicineId: value,
        medicineName: selectedMedicine ? selectedMedicine.itemName : '',
        quantity: newPrescription[index].quantity || 1
      };
    } else {
      newPrescription[index][field] = value;
    }
    
    setFormData(prevData => ({
      ...prevData,
      prescription: newPrescription
    }));
  };

  const removeMedicinePrescription = (index) => {
    const newPrescription = formData.prescription.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, prescription: newPrescription }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare form data for submission
      const formattedFormData = {
        appointmentId: formData.appointmentId,
        consultationDate: formData.consultationDate 
          ? new Date(formData.consultationDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        consultationDetails: formData.consultationDetails,
        toothNumber: formData.toothNumber,
        prescription: formData.prescription
      };

      const response = await axios.post("http://localhost:5000/consultations", formattedFormData);
      console.log("Consultation Added:", response.data);
      
      // Reset form with default values
      setFormData({
        appointmentId: "",
        patientName: "",
        consultationDate: new Date().toISOString().split('T')[0],
        consultationDetails: "",
        toothNumber: "",
        prescription: []
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit consultation");
      console.error("Consultation submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className={`${isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Add Consultation</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className={`pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <svg
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16 10a6 6 0 1112 0 6 6 0 01-12 0z" />
                </svg>
              </div>

              <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}>
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>

        <div className="w-[78rem] mx-auto my-4"></div>

        <div className="p-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Appointment ID</label>
                <select
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleAppointmentSelect}
                  className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                  required
                >
                  <option value="">Select Appointment</option>
                  {appointments.map(app => (
                    <option key={app.appointmentId} value={app.appointmentId}>
                      {app.appointmentId} - {app.patientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className={`mt-1 w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                  placeholder="Patient Name"
                  readOnly
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Tooth Number</label>
                <input
                  type="text"
                  name="toothNumber"
                  value={formData.toothNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Tooth Number"
                  className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Consultation Date</label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  className={`mt-1 w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Consultation Details</label>
                <textarea
                  name="consultationDetails"
                  value={formData.consultationDetails}
                  onChange={handleInputChange}
                  className={`mt-1 w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                  placeholder="Enter Details"
                  rows="4"
                  required
                ></textarea>
              </div>

                {/* Medicine Prescription Section */}
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                    Medicine Prescription
                  </h3>
                  <button 
                    type="button"
                    onClick={addMedicinePrescription}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                  >
                    Add Medicine
                  </button>
                </div>

                {formData.prescription.map((prescItem, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                    <select
                      value={prescItem.medicineId}
                      onChange={(e) => updateMedicinePrescription(index, 'medicineId', e.target.value)}
                      className={`border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                      required
                    >
                      <option value="">Select Medicine</option>
                      {inventoryMedicines.map(medicine => (
                        <option key={medicine._id} value={medicine._id}>
                          {medicine.itemName} (Stock: {medicine.quantity})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={prescItem.quantity}
                      onChange={(e) => updateMedicinePrescription(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      max={inventoryMedicines.find(m => m._id === prescItem.medicineId)?.quantity || 1}
                      className={`border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                      placeholder="Quantity"
                      required
                    />

                    <button 
                      type="button"
                      onClick={() => removeMedicinePrescription(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out"
                >
                  {loading ? "Submitting..." : "Add Consultation"}
                </button>
              </div>
            </form>

            {error && <div className="mt-4 text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_AddConsultation;
