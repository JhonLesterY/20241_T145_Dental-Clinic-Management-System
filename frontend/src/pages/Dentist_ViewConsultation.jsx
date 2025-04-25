import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import DentistSideBar from "../components/DentistSidebar";
import DentistHeader from "../components/DentistHeader";
import { useDentistTheme } from '../context/DentistThemeContext';
import LoadingOverlay from "../components/LoadingOverlay";

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

const Dentist_ViewConsultation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useDentistTheme();
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString();
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [usedItemsModal, setUsedItemsModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedUsedItems, setSelectedUsedItems] = useState([]);
  const [consultationUsedItems, setConsultationUsedItems] = useState(() => {
    // Try to load from local storage on initial render
    const savedUsedItems = localStorage.getItem('consultationUsedItems');
    return savedUsedItems ? JSON.parse(savedUsedItems) : {};
  });

  const openConsultationModal = (consultation) => {
    setSelectedConsultation(consultation);
  };
  const closeConsultationModal = () => {
    setSelectedConsultation(null);
  };

  const fetchConsultations = async () => {
    try {
      const response = await fetch('http://localhost:5000/consultations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch consultations: ${errorText}`);
      }

      const data = await response.json();
      
      // Extensive debug logging
      console.log('Fetched Consultations:', data.map(consultation => {
        const patientNameStatus = consultation.patientName 
          ? 'Present' 
          : consultation.patientFullDetails 
            ? 'Full Details Available' 
            : 'Missing';
        
        return {
          id: consultation._id,
          patientNameStatus,
          patientName: consultation.patientName,
          patientFullDetails: consultation.patientFullDetails
        };
      }));
      
      // Sort consultations by date (most recent first)
      const sortedConsultations = data.sort((a, b) => 
        new Date(b.consultationDate) - new Date(a.consultationDate)
      );

      setConsultations(sortedConsultations);
      setError(null);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setError(error.message || 'An unknown error occurred while fetching consultations');
    } finally {
      // Add a slight delay to ensure smooth loading transition
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }

      const data = await response.json();
      setInventoryItems(data.filter(item => item.quantity > 0));
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setError('Failed to fetch inventory items');
    }
  };

  // Open used items modal
  const openUsedItemsModal = (consultation) => {
    // Log the consultation being passed
    console.log('Opening Used Items Modal for Consultation:', consultation);
    
    // Validate consultation object
    if (!consultation) {
      console.error('No consultation provided');
      setError('Please select a valid consultation');
      return;
    }
  
    // Ensure the consultation has the required properties
    if (!consultation._id) {
      console.error('Invalid consultation: Missing _id', consultation);
      setError('Invalid consultation selected');
      return;
    }
  
    // Set the selected consultation
    setSelectedConsultation(consultation);
    
    // Fetch inventory items
    fetchInventoryItems();
    
    // Open the modal
    setUsedItemsModal(true);
    
    // Retrieve or initialize used items for this specific consultation
    const consultationId = consultation._id;
    
    // First, check local storage
    const savedUsedItems = JSON.parse(localStorage.getItem('consultationUsedItems') || '{}');
    const existingUsedItems = savedUsedItems[consultationId] || [];
    
    setSelectedUsedItems(existingUsedItems);
    
    // Clear any previous errors
    setError(null);
  };

  // Close used items modal
  const closeUsedItemsModal = () => {
    // Save the current used items for this consultation
    if (selectedConsultation && selectedConsultation._id) {
      const updatedUsedItems = {
        ...consultationUsedItems,
        [selectedConsultation._id]: selectedUsedItems
      };
      
      // Save to local storage
      localStorage.setItem('consultationUsedItems', JSON.stringify(updatedUsedItems));
      
      // Update state
      setConsultationUsedItems(updatedUsedItems);
    }
    
    // Close the modal
    setUsedItemsModal(false);
  };

  const clearUsedItemsForConsultation = (consultationId) => {
    const savedUsedItems = JSON.parse(localStorage.getItem('consultationUsedItems') || '{}');
    delete savedUsedItems[consultationId];
    localStorage.setItem('consultationUsedItems', JSON.stringify(savedUsedItems));
    
    // Also update the state
    setConsultationUsedItems(savedUsedItems);
  };
  // Add a used item to the list
  const addUsedItem = () => {
    setSelectedUsedItems([...selectedUsedItems, { 
      itemId: '', 
      itemName: '', 
      quantity: 1 
    }]);
  };

// Update a used item in the list
const updateUsedItem = (index, field, value) => {
  const newUsedItems = [...selectedUsedItems];
  newUsedItems[index][field] = value;

  // If itemId is selected, find and set the corresponding itemName
  if (field === 'itemId') {
    const selectedItem = inventoryItems.find(item => item._id === value);
    if (selectedItem) {
      newUsedItems[index]['itemName'] = selectedItem.itemName;
    }
  }

  setSelectedUsedItems(newUsedItems);
};

// Submit used items
const submitUsedItems = async () => {
  try {
    // Detailed logging and validation
    console.log('Submitting Used Items');
    console.log('Selected Consultation:', selectedConsultation);
    console.log('Selected Used Items:', selectedUsedItems);

    // Validate consultation selection
    if (!selectedConsultation) {
      console.error('No consultation selected');
      setError('Please select a consultation first');
      return;
    }

    // Validate consultation ID
    if (!selectedConsultation._id) {
      console.error('Selected consultation is missing _id');
      setError('Invalid consultation selected');
      return;
    }

    // Validate used items
    const invalidItems = selectedUsedItems.filter(item => 
      !item.itemId || !item.itemName || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      console.error('Invalid items:', invalidItems);
      setError('Please select valid items and quantities');
      return;
    }

    // Prepare used items for submission
    const usedItemsToSubmit = selectedUsedItems.map(item => ({
      ...item,
      dateUsed: new Date().toISOString()
    }));

    // Submit used items
    const response = await fetch(
      `http://localhost:5000/consultations/${selectedConsultation._id}/used-items`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ usedItems: usedItemsToSubmit })
      }
    );

    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add used items');
    }

    // Success handling
    const data = await response.json();
    console.log('Used items added successfully:', data);

    // Reset states
    setUsedItemsModal(false);
    setSelectedConsultation(null);
    setSelectedUsedItems([]);
    setError(null);

    // Refresh consultations
    await fetchConsultations();

    // Show success message
    alert('Used items added successfully');
  } catch (error) {
    console.error('Error in submitUsedItems:', error);
    setError(error.message || 'Failed to add used items');
  }
};

  useEffect(() => {
    fetchConsultations();
  }, []);

  return (  
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
        {/* Header */}
        <DentistHeader title="View Consultations" />
        
        <div className="flex-1 relative">
          {isLoading ? (
            <LoadingOverlay 
              message="Loading Consultations..." 
              isDarkMode={isDarkMode} 
              isTransparent={true}
              fullScreen={false}
            />
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              {/* Date Section */}
              <div className="flex flex-col items-center mb-4">
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-md w-full max-w-md">
                    Today: {formatDate(new Date())}
                  </div>
                </div>
              </div>

              {/* Consultations List */}
              <div className="flex flex-col items-center mt-6 mx-auto w-full max-w-7xl">
                <div className={`w-full border rounded-xl shadow-lg max-w-6xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  {error ? (
                    <div className={`text-center text-red-500 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {error}
                    </div>
                  ) : consultations.length === 0 ? (
                    <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming consultations</div>
                  ) : (
                    <div className="space-y-4">
                      {consultations.map((consultation, index) => (
                        <div
                          key={consultation._id || `consultation-${index}`}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'border-gray-700 hover:bg-gray-700' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Consultation #{consultation._id.slice(-6)}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Patient: {consultation.patientName || 'Unknown Patient'}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Scheduled on: {formatDate(new Date(consultation.consultationDate))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openConsultationModal(consultation)}
                              className="text-blue-500 hover:text-blue-400 transition"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => openUsedItemsModal(consultation)} 
                              className={`px-3 py-1 rounded ${isDarkMode 
                                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                                : 'bg-blue-500 hover:bg-blue-400 text-white'
                              }`}
                            >
                              Add Used Items
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Keep the existing modal code */}
              {selectedConsultation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className={`w-96 p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Consultation Details</h2>
                      <button 
                        onClick={closeConsultationModal}
                        className={`text-xl ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                      >
                        &times;
                      </button>
                    </div>
                    <div className="space-y-2">
                    <p><strong>Consultation ID:</strong> {selectedConsultation._id}</p>
                      <p><strong>Patient Name:</strong> {selectedConsultation.patientName || 'Unknown Patient'}</p>
                      {/* Remove the consultation date line */}
                      <p><strong>Notes:</strong> {selectedConsultation.notes || 'No notes available'}</p>
                      {/* Add prescription line */}
                      <div>
                        <strong>Prescription:</strong> 
                        {selectedConsultation.prescription && selectedConsultation.prescription.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {selectedConsultation.prescription.map((med, index) => (
                                <li key={index}>
                                  Medicine Name: {med.medicineName || med.medicineId} 
                                  (Quantity: {med.quantity})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No prescription provided</p>
                          )}
                      </div>
                      {/* Used Items Section */}
                      {selectedConsultation.usedItems && selectedConsultation.usedItems.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Used Items</h3>
                          <div className={`border rounded p-2 ${isDarkMode 
                            ? 'border-gray-700 bg-gray-800' 
                            : 'border-gray-200 bg-gray-50'
                          }`}>
                            <table className="w-full">
                              <thead>
                                <tr className={`border-b ${isDarkMode 
                                  ? 'border-gray-700 text-gray-300' 
                                  : 'border-gray-200 text-gray-600'
                                }`}>
                                  <th className="py-1 text-left">Item Name</th>
                                  <th className="py-1 text-right">Quantity</th>
                                  <th className="py-1 text-right">Date Used</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedConsultation.usedItems.map((item, index) => (
                                  <tr key={index} className={`${isDarkMode 
                                    ? 'text-gray-200 hover:bg-gray-700' 
                                    : 'hover:bg-gray-100'
                                  }`}>
                                    <td className="py-1">{item.itemName}</td>
                                    <td className="py-1 text-right">{item.quantity}</td>
                                    <td className="py-1 text-right">
                                      {formatDate(new Date(item.dateUsed))}
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
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Used Items Modal - Keep outside the main content flow for proper stacking */}
      {usedItemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-[500px] p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Used Items</h2>
              <button 
                onClick={() => setUsedItemsModal(false)}
                className={`text-xl ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                &times;
              </button>
            </div>
            {/* Modal content */}
            <div className="space-y-4">
              {selectedUsedItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={item.itemId}
                    onChange={(e) => updateUsedItem(index, 'itemId', e.target.value)}
                    className={`flex-grow p-2 rounded ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">Select Item</option>
                    {inventoryItems.map(invItem => (
                      <option key={invItem._id} value={invItem._id}>
                        {invItem.itemName} (Available: {invItem.quantity})
                      </option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateUsedItem(index, 'quantity', parseInt(e.target.value))}
                    className={`w-24 p-2 rounded ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                    }`}
                    placeholder="Qty"
                  />
                  <button 
                    onClick={() => removeUsedItem(index)}
                    className={`p-2 rounded ${isDarkMode 
                      ? 'bg-red-700 hover:bg-red-600 text-white' 
                      : 'bg-red-500 hover:bg-red-400 text-white'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <button 
              onClick={addUsedItem}
              className={`mt-4 w-full py-2 rounded ${isDarkMode 
                ? 'bg-green-700 hover:bg-green-600 text-white' 
                : 'bg-green-500 hover:bg-green-400 text-white'
              }`}
            >
              Add Another Item
            </button>

            {/* Submit Button */}
            <button 
              onClick={submitUsedItems}
              className={`mt-4 w-full py-2 rounded ${isDarkMode 
                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
            >
              Submit Used Items
            </button>

            {/* Error Display */}
            {error && (
              <div className={`mt-4 p-2 rounded text-center ${isDarkMode 
                ? 'bg-red-900 text-red-300' 
                : 'bg-red-100 text-red-700'
              }`}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dentist_ViewConsultation;
