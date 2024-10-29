import { NavLink } from "react-router-dom";

const Pagintation_About_us = () => {
  return (
    <>
      <div className="flex justify-between mx-[15rem]">
        <NavLink
          to="/dashboard"
          className="cursor-pointer shadow-sm mb-5 hover:shadow-lg rounded-xl px-5 py-2 text-white bg-customblue"
        >
          Back
        </NavLink>
        <NavLink
          to="/dashboard"
          className="cursor-pointer shadow-sm mb-5 hover:shadow-lg rounded-xl px-5 py-2 text-white bg-customblue"
        >
          Next
        </NavLink>
      </div>
    </>
  );
};

export default Pagintation_About_us;
