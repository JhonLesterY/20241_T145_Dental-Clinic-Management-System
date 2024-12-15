import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";

const User_About_Us = () => {
  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2">
        {/* User Header directly in the User_Dashboard */}
        <header className="text-gray-600 body-font shadow-md">
          <div className="flex items-center justify-between p-1 mx-auto w-full max-w-5xl">
            <div className="flex items-center">
              <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
            <Link to="/dashboard" className="ml-3 text-xl font-semibold text-[#003367] cursor-pointer">
              About Us
            </Link>
          </div>
        </div>
      </header>

      <div className="border w-[95rem] mx-auto"></div>
      </div>
    </>
  );
};

export default User_About_Us;
