import Dashboard from "../components/Dashboard";
import User_Header from "../components/User_Header";
import dentist from "/src/images/dentist.jpeg";
import dentalchair from "/src/images/Dental_Chair_.jpg";

const User_Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2">
        {/* Header */}
        <User_Header />


        {/* Dashboard Content */}
        <div className="flex flex-col items-center mt-10 mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-[#003367] mb-8 text-center">
            Welcome to Your Dashboard
          </h2>
          

          {/* Info Cards */}
          <div className="grid gap-6 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {/* Card 1 */}
            <div className="bg-white border shadow-md rounded-xl cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <img
                className="object-cover rounded-t-xl w-full h-64"
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
            <div className="bg-white border shadow-md rounded-xl cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <img
                className="object-cover rounded-t-xl w-full h-64"
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
