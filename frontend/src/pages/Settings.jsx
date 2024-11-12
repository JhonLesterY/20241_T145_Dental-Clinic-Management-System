import Dashboard from "../components/Dashboard";
import User_Header from "../components/User_Header";

const Settings = () => {
  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

        {/* Main Content */}
      <div className="flex-1 flex flex-col p-2">
        {/* Header */}
        <User_Header />

          <div className="space-y-4 mt-10 mx-auto w-full max-w-5xl">
            {/* Switch Theme */}
            <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black">
              <div className="flex justify-between items-center">
                <span>Switch Theme</span>
                <button className="px-4 py-2 rounded-full bg-yellow-400 text-black">Dark Mode</button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black">
              <div className="flex justify-between items-center">
                <span>Notification Settings</span>
                <button className="text-blue-500 text-black">Edit</button>
              </div>
            </div>

            {/* Help */}
            <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black">
              <div className="flex justify-between items-center">
                <span>Help</span>
                <button className="text-blue-500">View</button>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black">
              <div className="flex justify-between items-center">
                <span>Privacy Policy</span>
                <button className="text-blue-500">View</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
