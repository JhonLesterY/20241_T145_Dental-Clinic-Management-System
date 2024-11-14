import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.png";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const About_us = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-gray-50 text-gray-700">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="w-full shadow-lg bg-gray-50">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Appointment Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental logo" />
              <Link
                to="/appointment"
                className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition"
              >
                Appointment
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

            {/* Notification Bell */}
            <button
              className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 focus:outline-none"
              aria-label="Notifications"
            >
              <img className="w-6" src={bell} alt="Notifications" />
            </button>
          </div>
        </header>

        <div className="w-[95rem] mx-auto my-4"></div>

        {/* About Us Content */}
        <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center mt-4 space-x-0 lg:space-x-10 space-y-6 lg:space-y-0">
          {/* Image */}
          <div className="flex justify-center lg:justify-start">
            <img
              className="object-contain w-72 h-[500px]" // Increased height
              src={dentist}
              alt="Dentist"
            />
          </div>

          {/* Text Content */}
          <div className="max-w-lg mt-6 lg:mt-0 text-center lg:text-left">
            <h2 className="text-5xl font-semibold text-[#003367] mb-6">
              About Us
            </h2>
            <p className="text-gray-700 mb-4">
              At our clinic, we believe in more than just treating teeth—we’re
              committed to creating brighter, healthier smiles and enhancing
              overall well-being. Our team is passionate about providing
              personalized, compassionate care in a welcoming environment.
            </p>
            <p className="text-gray-700 mb-4">
              Established with a vision to redefine dental care, we blend
              advanced technology with a human touch, ensuring every visit is
              comfortable and stress-free. From preventive care to complex
              dental procedures, we prioritize your needs, comfort, and
              long-term dental health.
            </p>
            <p className="text-gray-700">
              With a team of highly skilled professionals and state-of-the-art
              facilities, we are dedicated to staying at the forefront of dental
              advancements. Experience quality care designed to exceed
              expectations—because your smile deserves the best.
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="space-y-4 mt-10 mx-auto w-full max-w-5xl">
          <Footer />
        </div>
      </div>
      </div>
  );
};

export default About_us;
