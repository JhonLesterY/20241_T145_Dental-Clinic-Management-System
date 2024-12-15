import { NavLink } from "react-router-dom";
import { FaCalendarAlt, FaComments, FaInfoCircle, FaCog, FaHome } from "react-icons/fa";

const Dashboard = () => {
  // Helper function for NavLink className
  const getLinkClassName = ({ isActive }) => {
    return `hover:text-gray-200 flex items-center gap-3 ${isActive ? 'text-white' : 'text-slate-200'}`;
  };

  return (
    <div className="h-full fixed bg-customblue text-slate-200 w-[16rem] flex flex-col justify-between shadow-lg transition-all duration-300 ease-in-out">
      {/* Navbar Header */}
      <div className="text-center mt-6">
        <NavLink to="/dashboard">
          <div className="text-2xl font-bold text-white tracking-wide hover:text-gray-300 transition duration-200">
            Unicare
          </div>
          <div className="border-b-2 border-gray-400 w-40 mx-auto mt-2 mb-8"></div>
        </NavLink>

        {/* Navigation Links directly below Unicare */}
        <ul className="space-y-6 font-medium text-lg px-6">
          <li>
            <NavLink 
              to="/dashboard" 
              className={getLinkClassName}
            >
              <FaHome className="text-xl" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/appointment" 
              className={getLinkClassName}
            >
              <FaCalendarAlt className="text-xl" />
              Appointment
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Bottom Links */}
      <div className="space-y-5 pb-10 border-t border-gray-600 pt-6 px-6">
        <NavLink 
          to="/feedback" 
          className={getLinkClassName}
        >
          <FaComments className="text-xl" />
          Feedback
        </NavLink>
        <NavLink 
          to="/about-us" 
          className={getLinkClassName}
        >
          <FaInfoCircle className="text-xl" />
          About Us
        </NavLink>
        <NavLink 
          to="/settings" 
          className={getLinkClassName}
        >
          <FaCog className="text-xl" />
          Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Dashboard;