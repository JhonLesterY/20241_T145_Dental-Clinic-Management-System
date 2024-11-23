import { useState } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import DentistSideBar from "../components/DentistSidebar";

const Dentist_AddConsultation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    patientName: "",
    consultationDate: "",
    consultationDetails: "",
    contactNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Example: API call simulation (replace with your actual API call)
    try {
      const response = await fetch("http://localhost:5000/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit consultation.");
      }

      console.log("Form Submitted:", formData);
      setFormData({
        id: "",
        patientName: "",
        consultationDate: "",
        consultationDetails: "",
        contactNumber: "",
      });
    } catch (error) {
      setError("There was an error submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">Add Consultation</h1>
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

        {/* Divider */}
        <div className="w-[78rem] mx-auto my-4"></div>

        {/* Main Dashboard Content */}
        <div className="p-6">
          {/* Add Consultation Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              {/* ID Field */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Appointment ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Enter Appointment ID"
                  required
                />
              </div>

              {/* Patient Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Enter Patient Name"
                  required
                />
              </div>

              {/* Consultation Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Consultation Date</label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  required
                />
              </div>

              {/* Contact Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Enter Contact Number"
                  required
                />
              </div>

              {/* Consultation Details Field */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600">Consultation Details</label>
                <textarea
                  name="consultationDetails"
                  value={formData.consultationDetails}
                  onChange={handleInputChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Enter Details"
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
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

            {/* Error Message */}
            {error && <div className="mt-4 text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_AddConsultation;
