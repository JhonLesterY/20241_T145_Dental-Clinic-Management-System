import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";

const User_About_Us = () => {
  return (
    <>
      <header className="text-gray-600 body-font ">
        <div className="  grid grid-cols-2 p-5 mx-4 flex-col md:flex-row">
          <div className="flex justify-self-start title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
            <Link to="/dashboard" className="ml-3 text-xl cursor-pointer">
              About Us
            </Link>
          </div>
        </div>
      </header>

      <div className="border w-[95rem] mx-auto"></div>
    </>
  );
};

export default User_About_Us;
