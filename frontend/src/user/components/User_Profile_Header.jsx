import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";

const User_Profile_Header = () => {
  return (
    <>
      <header className="text-gray-600 body-font ml-8 ">
        <div className="  grid grid-cols-2 p-5 mx-4 flex-col md:flex-row">
          <div className="flex justify-self-start title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
            <Link to="/dashboard" className="ml-3 text-xl cursor-pointer">
              Profile
            </Link>
          </div>

          <button className="inline-flex justify-self-end items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full text-base mt-4 md:mt-0">
            <img className="w-6" src={bell} alt="" />
          </button>
        </div>
      </header>

      <div className="border w-[95rem] mx-auto"></div>
    </>
  );
};

export default User_Profile_Header;
