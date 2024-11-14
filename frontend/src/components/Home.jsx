import { NavLink } from "react-router-dom";
import User from "/src/images/user.png";

const Home = () => {
  return (
    <div className="h-full fixed text-center bg-customblue text-slate-200 w-[15rem] flex flex-col justify-between">
      {/* Navbar Header */}
      <div>
        <NavLink to="/dentist-dashboard">
          <div className="text-2xl pt-5 font-semibold mb-3">Unicare</div>
          <div className="border w-44 mx-auto mb-9"></div>
        </NavLink>

        {/* Navigation Links */}
        <ul className="space-y-4 font-medium text-lg">
          <li>
            <NavLink to="/dentist-dashboard" activeClassName="text-white" className="hover:text-gray-200">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/dentist-viewConsultation" activeClassName="text-white" className="hover:text-gray-200">
              View Consultation
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Bottom Links */}
     <div className="flex flex-col items-center space-y-3 pb-6 border-t border-gray-600 pt-4">
        <NavLink to="/dentist-viewFeedback" activeClassName="text-white" className="hover:text-gray-200">
          View Feedback
        </NavLink>
        <NavLink to="/dentist-settings" activeClassName="text-white" className="hover:text-gray-200">
          Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Home;
