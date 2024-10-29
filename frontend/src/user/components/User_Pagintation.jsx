import { NavLink } from "react-router-dom";

const User_Pagintation = () => {
  return (
    <>
      <div className="flex justify-between">
        <NavLink
          to="/appointment"
          className="cursor-pointer shadow-sm mb-5 hover:shadow-lg rounded-xl px-5 py-2 text-white bg-customblue"
        >
          Back
        </NavLink>
        <NavLink
          to="/upload-requirements"
          className="cursor-pointer shadow-sm mb-5 hover:shadow-lg rounded-xl px-5 py-2 text-white bg-customblue"
        >
          Next
        </NavLink>
      </div>
    </>
  );
};

export default User_Pagintation;
