import { NavLink } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Pagintation_Appointment_Confirmation from "../components/Pagintation_Appointment_Confirmation";
import User_Header_Appointment from "../components/User_Header_Appointment";

const Appointment_Confirmation = () => {
  return (
    <>
      <div className="flex">
        <div>
          <Dashboard />
        </div>

        <div className="justify-center  mx-auto overflow-x-hidden">
          <div className="ml-48">
            <User_Header_Appointment />
          </div>

          <div className="mt-5">
          
          <div className=" gap-44 ml-52">
{/* Content */}


            <div className="mx-[20rem] mt-10 ">
                <div className="border bg-white p-5 shadow-md rounded-xl">
                    <h1>Appointment Confirmation</h1>

                        <h1>Hi, Juan Dela Cruz!</h1>

                        <p className="w-[50rem] my-3">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est temporibus esse qui, iusto atque alias eveniet iure possimus, quasi quas autem? Incidunt aperiam accusantium expedita quam, quidem accusamus nihil ducimus.</p>

                        <p className="w-[50rem] my-3">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est temporibus esse qui, iusto atque alias eveniet iure possimus, quasi quas autem? Incidunt aperiam accusantium expedita quam, quidem accusamus nihil ducimus.</p>
           
                        <p className="w-[50rem] my-3">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est temporibus esse qui, iusto atque alias eveniet iure possimus, quasi quas autem? Incidunt aperiam accusantium expedita quam, quidem accusamus nihil ducimus.</p>


                        <div className="flex justify-between gap-1 text-center ">
                            <div className="rounded-2xl cursor-pointer grow bg-green-500 text-white p-2">View</div>
                            <NavLink to="/appointment" className="rounded-2xl cursor-pointer grow bg-red-500 text-white p-2">Cancel</NavLink>
                        </div>
                </div>
            </div>




          </div>
            {/* Pagintation */}

            <div className="ml-72">
              <Pagintation_Appointment_Confirmation />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Appointment_Confirmation;
