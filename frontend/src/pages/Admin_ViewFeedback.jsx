import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavBar from "../components/SideNavBar";
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const Admin_ViewFeedback = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackData, setFeedbackData] = useState([
    { id: 1, patientId: '2201103921', name: 'John Doe', date: 'October 5, 2024', feedback: 'Very satisfied with the treatment.', reviewed: false },
    { id: 2, patientId: '2201103922', name: 'Jane Smith', date: 'October 6, 2024', feedback: 'The staff was very friendly and professional.', reviewed: false },
    { id: 3, patientId: '2201103923', name: 'Emily Johnson', date: 'October 7, 2024', feedback: 'Clean and comfortable clinic environment.', reviewed: false },
  ]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle marking feedback as reviewed
  const handleMarkReviewed = (id) => {
    setFeedbackData(prevData =>
      prevData.map(feedback =>
        feedback.id === id ? { ...feedback, reviewed: true } : feedback
      )
    );
  };

  // Handle deleting feedback
  const handleDelete = (id) => {
    setFeedbackData(prevData => prevData.filter(feedback => feedback.id !== id));
  };

  // Filter feedback based on search query
  const filteredFeedback = feedbackData.filter(
    feedback =>
      feedback.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.patientId.includes(searchQuery)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <SideNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
                {/* Header */}
                <header className="w-full shadow-md">
                    <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
                        {/* Logo and Appointment Link */}
                        <div className="flex items-center space-x-4">
                            <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
                            <Link to="/admin-viewFeedback" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                                View Feedback
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center bg-white border rounded-xl px-3 py-1">
                            <img className="w-5" src={magnify} alt="Search icon" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="ml-2 p-1 outline-none w-full"
                                aria-label="Search for appointments"
                            />
                        </div>

                        {/* Bell Icon */}
                        <div className="flex items-center">
                            <button className="bg-gray-100 border-0 p-3 rounded-full hover:bg-gray-200">
                                <img className="w-6" src={bell} alt="Notifications" />
                            </button>
                        </div>
                    </div>
                </header>

        <div className=" w-[95rem] mx-auto my-4"></div>

        {/* Main Content Area */}
        <div className="space-y-4 mt-5 mx-auto w-full max-w-4xl px-4">
          {/* Date Display */}
          <div className="flex justify-center mb-4">
          <div className="border rounded-md px-4 py-2 bg-gray-50 border shadow-md text-gray-700">
              Today: October 2024
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-3">
            {filteredFeedback.map((feedback) => (
              <div key={feedback.id} className="border shadow-md p-5 rounded-xl bg-gray-50 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="block font-semibold text-gray-800">{feedback.name}</span>
                    <span className="text-sm text-gray-500">Patient ID: {feedback.patientId}</span>
                    <span className="text-sm text-gray-500">Date: {feedback.date}</span>
                    <p className="mt-2 text-gray-700">{feedback.feedback}</p>
                    {feedback.reviewed && <span className="text-green-500 text-xs font-bold">Reviewed</span>}
                  </div>
                  <div className="space-x-2">
                    {/* Mark as Reviewed Button */}
                    {!feedback.reviewed && (
                      <button
                        onClick={() => handleMarkReviewed(feedback.id)}
                        className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-4 py-1 bg-[#003367] text-white transition-transform duration-200 ease-in-out"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-4 py-1 bg-red-600 text-white transition-transform duration-200 ease-in-out"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_ViewFeedback;
