import { Link } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Logo from "/src/images/Dental_logo.png";  // Add the correct path to your logo

const Settings = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2">
        {/* User Header directly in the User_Dashboard */}
        <header className="text-gray-600 body-font shadow-md">
          <div className="flex items-center justify-between p-3 mx-auto w-full max-w-5xl">
            <div className="flex items-center">
              <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
              <Link to="/dashboard" className="ml-3 text-xl font-semibold text-[#003367] cursor-pointer">
                Settings
              </Link>
            </div>
            {/* Add more header elements here as needed */}
          </div>
        </header>
         
         {/* Divider */}
        <div className='border w-[95rem] mx-auto'></div>

        {/* Settings Content */}
        <div className="space-y-4 mt-10 mx-auto w-full max-w-5xl px-4 ">
          {/* Switch Theme */}
          <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Switch Theme</span>
              <button className="px-4 py-2 rounded-full bg-yellow-400 text-black">Dark Mode</button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Notification Settings</span>
              <button className="text-blue-500">Edit</button>
            </div>
          </div>

          {/* Help */}
          <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Help</span>
              <button className="text-blue-500">View</button>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Privacy Policy</span>
              <button className="text-blue-500">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
