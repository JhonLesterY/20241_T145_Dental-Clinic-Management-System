import Dashboard from "../components/Dashboard";
import User_Header_Appointment from "../components/User_Header_Appointment";
import User_Pagintation from "../components/User_Pagintation";

const User_Appointment = () => {
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

          <div className="mt-16">
            <div className=" gap-44 ml-52">
              {/* Content */}
              <div className="flex gap-1 mb-3">
                {/* date */}
                <div className="border rounded-md px-1">Today</div>
                <div>October 15, 2024</div>
              </div>

              {/* Appointment */}

              <div className="flex grid-cols-2 justify-between mx-[20rem]">
                <div className="border p-1 rounded-xl">October 18, 2024</div>
                <div className="border p-1 rounded-xl">Friday</div>
              </div>

              <div className="border mt-2 mx-[17rem]"></div>

              {/* Table */}

              <div className="flex grid-cols-2 justify-between mt-3 mx-[20rem]">
                <div className=" p-1 gap-1 flex">
                  <input type="radio" name="myRadio" />
                  <div>8:00 - 10:00 AM</div>
                </div>
                <div className="text-red-500 p-1 ">Fully Booked</div>
              </div>

              <div className="border mt-2 mx-[19rem]"></div>

              {/* Table */}

              <div className="flex grid-cols-2 justify-between mt-3 mx-[20rem]">
                <div className=" p-1 gap-1 flex ">
                  <input type="radio" name="myRadio" />
                  <div>10:30 - 12:30 NN</div>
                </div>
                <div className="text-red-500 p-1 font-se">Fully Booked</div>
              </div>

              <div className="border mt-2 mx-[19rem]"></div>

              {/* Table */}

              <div className="flex grid-cols-2 justify-between mt-3 mx-[20rem]">
                <div className=" p-1 gap-1 flex">
                  <input type="radio" name="myRadio" />
                  <div>1:00 - 3:00 PM</div>
                </div>
                <div className="text-green-500 p-1 ">Available Slots:2</div>
              </div>

              <div className="border mt-2 mx-[19rem]"></div>

              <div className="flex grid-cols-2 justify-between mt-3 mx-[20rem]">
                <div className=" p-1 gap-1 flex">
                  <input type="radio" name="myRadio" />
                  <div>3:00 - 5:00 PM</div>
                </div>
                <div className="text-green-500 p-1 ">Available Slots:2</div>
              </div>

              <div className="border mt-2 mx-[19rem]"></div>
            </div>
          </div>
          {/* Pagintation */}

          <div className="ml-52">
            <User_Pagintation />
          </div>
        </div>
      </div>
    </>
  );
};

export default User_Appointment;
