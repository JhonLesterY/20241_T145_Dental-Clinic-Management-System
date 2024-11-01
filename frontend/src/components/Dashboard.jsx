import { NavLink } from "react-router-dom";
import User from "/src/images/user.png";
const Dashboard = () => {
  return (
    <>
      {/* Navbar */}
      <div className="h-full fixed text-center bg-customblue text-slate-200 w-[15rem] justify-items-center ">
        <NavLink to="/dashboard">
          <div className="text-2xl pt-5 font-semibold mb-3">Unicare</div>

          <div className="border w-44 mb-9"></div>
        </NavLink>

        <div className="font-medium text-lg mb-5">
          <NavLink to="/Profile" className="flex gap-1">
            <div>
              <img className="h-8 " src={User} alt="img" />
            </div>
            <div className="my-auto">Profile</div>
          </NavLink>
        </div>
        <ul>
          <li className="cursor-pointer mb-2">
            <NavLink to="/dashboard" className=" font-medium text-lg">
              Dashboard
            </NavLink>
          </li>
          <li className="mb-2  font-medium text-lg">
            <NavLink to="/Appointment">Appointment</NavLink>
          </li>

          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />

          <li className=" font-medium text-lg mb-3">
            <NavLink to="/feedback">Feedback</NavLink>
          </li>

          <li className=" font-medium text-lg mb-3">
            <NavLink to="/about-us">About us</NavLink>
          </li>

          <li className=" font-medium text-lg mb-3">
            <NavLink to="/settings">Settings</NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Dashboard;
