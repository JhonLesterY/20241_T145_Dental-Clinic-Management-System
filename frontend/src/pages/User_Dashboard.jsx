import { Link } from "react-router-dom"; // Import Link for navigation
import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.jpeg";
import dentalchair from "/src/images/Dental_Chair_.jpg";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";

const User_Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full shadow-lg bg-gray-50">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Dashboard Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
              <Link
                to="/dashboard"
                className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition"
              >
                Dashboard
              </Link>
            </div>

            {/* Notifications and Profile Icons */}
            <div className="flex items-center space-x-8">
              <button className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition">
                <img className="w-6" src={bell} alt="Notifications" />
              </button>
              <a
                href="/profile"
                className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition"
              >
                <img className="w-6" src={userIcon} alt="Profile" />
              </a>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className=" w-[95rem] mx-auto my-4"></div>

        {/* Dashboard Content */}
        <div className="flex flex-col items-center mt-5 mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-[#003367] mb-8 text-center">
            Welcome to Your Dashboard
          </h2>

          {/* Info Cards */}
          <div className="grid gap-6 w-full grid-cols-1 md:grid-cols-2 max-w-4xl">
            {/* Card 1 */}
            <div className="bg-gray-50 border shadow-lg rounded-xl transform hover:scale-105 transition duration-200">
              <img
                className="object-cover rounded-t-xl w-full h-80"
                src={dentist}
                alt="Dentist services provided at the university clinic"
              />
              <div className="p-4">
                <p className="text-gray-700">
                  The university dental clinic provides free dental care services
                  for BukSU students and personnel.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 border shadow-lg rounded-xl transform hover:scale-105 transition duration-200">
              <img
                className="object-cover rounded-t-xl w-full h-80"
                src={dentalchair}
                alt="Dental chair and equipment used in university clinic services"
              />
              <div className="p-4">
                <p className="text-gray-700">
                  The university dental clinic offers services such as tooth
                  extraction, consultation, and fluoride varnish applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Dashboard;
