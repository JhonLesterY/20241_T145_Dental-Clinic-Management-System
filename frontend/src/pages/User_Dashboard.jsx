import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.jpeg";
import dentalchair from "/src/images/Dental_Chair_.jpg";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png"; // Assuming you have a user icon image

const User_Dashboard = () => {
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
          <div className="flex items-center justify-between p-2 mx-auto w-full max-w-5xl">
            <div className="flex items-center">
              <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
              <a href="/dashboard" className="ml-3 text-xl font-semibold text-[#003367] cursor-pointer">
                Dashboard
              </a>
            </div>

            <div className="flex items-center space-x-8 ml-auto">
              {/* Bell Icon */}
              <button className="inline-flex items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full">
                <img className="w-6" src={bell} alt="Notifications" />
              </button>

              {/* Profile Icon */}
              <a href="/profile" className="inline-flex items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full">
                <img className="w-6" src={userIcon} alt="Profile" />
              </a>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className="border w-[95rem] mx-auto"></div>

        {/* Dashboard Content */}
        <div className="flex flex-col items-center mt-5 mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-[#003367] mb-8 text-center">
            Welcome to Your Dashboard
          </h2>

          {/* Info Cards */}
          <div className="flex justify-center w-full mt-4"></div>
          <div className="grid gap-6 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl">
            {/* Card 1 */}
            <div className="bg-white-gray border shadow-md rounded-xl cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <img
                className="object-cover rounded-t-xl w-full h-80"
                src={dentist}
                alt="Dentist services provided at the university clinic"
              />
              <div className="p-4">
                <p className="text-gray-700 text-base">
                  The university dental clinic is an organization that provides
                  free dental care services for BukSU students and personnel.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white-gray border shadow-md rounded-xl cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <img
                className="object-cover rounded-t-xl w-full h-80"
                src={dentalchair}
                alt="Dental chair and equipment used in university clinic services"
              />
              <div className="p-4">
                <p className="text-gray-700 text-base">
                  The university dental clinic offers various services such as
                  tooth extraction, consultation, and fluoride varnish
                  applications.
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
