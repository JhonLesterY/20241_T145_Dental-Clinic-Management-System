import { NavLink } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaClipboardList, FaBox, FaComments, FaCog } from "react-icons/fa";

const Dashboard = () => {
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

        {/* Navigation Links */}
        <ul className="space-y-6 font-medium text-lg px-6">
          <li>
            <NavLink to="/admin-dashboard" activeClassName="text-white" className="hover:text-gray-200 flex items-center gap-3">
              <FaHome className="text-xl" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-viewAppointment" activeClassName="text-white" className="hover:text-gray-200 flex items-center gap-3">
              <FaClipboardList className="text-xl" />
              View Appointment
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-calendar" activeClassName="text-white" className="hover:text-gray-200 flex items-center gap-3">
              <FaCalendarAlt className="text-xl" />
              Calendar
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Bottom Links */}
      <div className="space-y-5 pb-10 border-t border-gray-600 pt-6 px-6">
        <NavLink to="/admin-inventory" activeClassName="text-white" className="hover:text-gray-200 flex items-center gap-3">
          <FaBox className="text-xl" />
          Inventory
        </NavLink>
        <NavLink to="/admin-viewFeedback" activeClassName="text-white" className="hover:text-gray-200 flex items-center gap-3">
          <FaComments className="text-xl" />
          View Feedback
        </NavLink>
        <NavLink to="/admin-settings" activeClassName="text-white" className="hover:text-gray-200 flex items-center gap-3">
          <FaCog className="text-xl" />
          Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Dashboard;
