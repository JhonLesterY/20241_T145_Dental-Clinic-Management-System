import { Link, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const User_Upload_Requirements = () => {
  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full shadow-md">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Appointment Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
              <Link to="/appointment" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                Appointment
              </Link>
            </div>

            {/* Search Box */}
            <div className='flex bg-white gap-1 border rounded-xl justify-self-center px-3 py-0.5'>
              <div className='my-auto'>
                  <img className='w-5' src={magnify} alt="" />
              </div>
              <input type="text" placeholder='Search' className=' p-0.5 outline-none'/>
              </div>

            {/* Bell Icon */}
            <div className="flex items-center">
              <button className="bg-gray-100 border-0 p-3 rounded-full hover:bg-gray-200">
                <img className="w-6" src={bell} alt="notifications" />
              </button>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className='border w-[95rem] mx-auto'></div>

        {/* Content Section */}
        <div className="w-full max-w-4xl mt-4">
          <h2 className="text-3xl font-semibold text-center text-[#003367] mb-8">
            Upload Requirements
          </h2>

          {/* Requirements Cards - Larger Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-10 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <h1 className="text-2xl font-medium mb-7 text-gray-700">Validated School ID</h1>
              <p className="text-base text-gray-500 mb-9">(Scanned)</p>
              <input
                type="file"
                className="text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-blue-50 hover:file:text-blue-700 transition-all cursor-pointer"
              />
            </div>

            {/* Card 2 */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <h1 className="text-2xl font-medium mb-7 text-gray-700">Certificate of Registration</h1>
              <p className="text-base text-gray-500 mb-9">(Scanned)</p>
              <input
                type="file"
                className="text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-blue-50 hover:file:text-blue-700 transition-all cursor-pointer"
              />
            </div>

            {/* Card 3 */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <h1 className="text-3xl font-medium mb-7 text-gray-700">Vaccination Card</h1>
              <p className="text-base text-gray-500 mb-9">(Scanned)</p>
              <input
                type="file"
                className="text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-blue-50 hover:file:text-blue-700 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Pagination Section */}
          <div className="flex justify-between w-full mt-10 max-w-4xl">
            <NavLink
              to="/appointment"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Back
            </NavLink>
            <NavLink
              to="/appointment-confirmation"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Next
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Upload_Requirements;
