import React, { useState } from 'react';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import AdminSideBar from '../components/AdminSideBar';

const Admin_ViewFeedback = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  // Format current date
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">View Feedback</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {/* Search Icon */}
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

              {/* Bell Icon */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>
        <div className="w-[78rem] mx-auto my-4"></div>

        {/* Date Section */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-md w-full max-w-md">
              Today: {formatDate(new Date())}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4 mt-6 mx-auto w-full max-w-5xl px-4">
          <div className="space-y-3">
            {filteredFeedback.map((feedback) => (
              <div key={feedback.id} className="border shadow-md p-5 rounded-xl bg-white text-black">
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
                        className="cursor-pointer shadow-sm inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 px-6 rounded-full transform hover:scale-105 transition-transform duration-200 ease-in-out"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-4 py-1 bg-red-600 text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
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
