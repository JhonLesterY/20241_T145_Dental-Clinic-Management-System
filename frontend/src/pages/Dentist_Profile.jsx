import Home from "../components/Home";
import User_Profile from "/src/images/user.png";
import User_Profile_Header from "../components/User_Profile_Header";

const Dentist_Profile = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Home />

      {/* Main Profile Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-blue-900 text-white p-8">
        <div className="w-full max-w-2xl p-8 bg-white text-gray-800 rounded-lg shadow-lg">
          {/* Profile Header */}
          <User_Profile_Header />

          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <img
              className="h-24 w-24 rounded-full border-4 border-gray-300"
              src={User_Profile}
              alt="User Profile"
            />
          </div>

          <div className="text-center text-2xl font-semibold mb-4">
            William James Moriarty
          </div>

          {/* Profile Form */}
          <form className="space-y-4">
            {/* First and Middle Name */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">First Name*</label>
                <input
                  type="text"
                  defaultValue="William James"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Middle Name</label>
                <input
                  type="text"
                  defaultValue="Von"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Last Name and Suffix */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">Last Name*</label>
                <input
                  type="text"
                  defaultValue="Moriarty"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Suffix</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="None"
                >
                  <option value="None">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
            </div>

            {/* Contact and Email */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">Contact Number*</label>
                <input
                  type="text"
                  defaultValue="0912-345-6789"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Email</label>
                <input
                  type="email"
                  defaultValue="Criminalgenuis@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sex and Birthday */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">Sex at Birth*</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Male"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Birthday*</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-6">
              <button
                type="button"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105 transition-transform duration-200 ease-in-out"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dentist_Profile;
