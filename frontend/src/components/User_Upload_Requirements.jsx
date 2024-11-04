import Dashboard from "./Dashboard";
import User_Header_Appointment from "./User_Header_Appointment";
import Pagintation_Upload_Requirements from "./Pagintation_Upload_Requirements";

const User_Upload_Requirements = () => {
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
              {/* ------------------------------------------------------------------- */}
              <div>
                <div className="text-2xl ml-8">Upload Requirements</div>

                {/* cards */}
                <div className="flex-1 ">
                  {/* card 1 */}
                  <div className="bg-white mb-2 px-48 mx-[30rem] shadow-md  border rounded-xl py-6">
                    <h1 className="mb-5">Validated School(Scanned)</h1>
                    <div>
                      <input
                        type="file"
                        className="text-sm  text-stone-500
   file:mr-5 file:py-1 file:px-3 file:border-[1px]
   file:text-xs file:font-medium
   file:bg-stone-50 file:text-stone-700
   hover:file:cursor-pointer hover:file:bg-blue-50
   hover:file:text-blue-700"
                      />
                    </div>
                  </div>
                  {/* card 2 */}
                  <div className="bg-white px-48 mx-[30rem] mb-2 shadow-md  border rounded-xl py-6">
                    <h1 className="mb-5">
                      Validated Certificate of Registration(Scanned)
                    </h1>
                    <div>
                      <input
                        type="file"
                        className="text-sm  text-stone-500
   file:mr-5 file:py-1 file:px-3 file:border-[1px]
   file:text-xs file:font-medium
   file:bg-stone-50 file:text-stone-700
   hover:file:cursor-pointer hover:file:bg-blue-50
   hover:file:text-blue-700"
                      />
                    </div>
                  </div>
                  {/* card 3 */}
                  <div className="bg-white px-48 mx-[30rem] mb-2 shadow-md  border rounded-xl py-6">
                    <h1 className="mb-5">Vaccination Card(Scanned)</h1>
                    <div>
                      <input
                        type="file"
                        className="text-sm  text-stone-500
   file:mr-5 file:py-1 file:px-3 file:border-[1px]
   file:text-xs file:font-medium
   file:bg-stone-50 file:text-stone-700
   hover:file:cursor-pointer hover:file:bg-blue-50
   hover:file:text-blue-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------------- */}
            </div>
            {/* Pagintation */}

            <div className="ml-72">
              <Pagintation_Upload_Requirements />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default User_Upload_Requirements;
