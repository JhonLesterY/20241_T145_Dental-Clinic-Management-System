import { NavLink } from "react-router-dom";

const Pagintation_Appointment_Confirmation = () => {
  return (
    <>
      <div className="flex justify-between">
        <NavLink
          to="/appointment"
          className="cursor-pointer shadow-sm mb-5 hover:shadow-lg rounded-xl px-5 py-2 text-white bg-customblue"
        >
          Back
        </NavLink>
        {/* classname="hidden" to hide the next button */}
        <NavLink
          to="/Appointment-Confirmation"
          className="cursor-pointer hidden shadow-sm mb-5 hover:shadow-lg rounded-xl px-5 py-2 text-white bg-customblue"
        >
          Next
        </NavLink>
      </div>
    </>
  );
};

export default Pagintation_Appointment_Confirmation;
