import Dashboard from "../components/Dashboard";
import User_Profile from "/src/images/user.png";
import User_Profile_Header from "../components/User_Profile_Header";

const Profile = () => {
  return (
    <>
      <div className="flex">
        <div>
          <Dashboard />
        </div>

        <div className="justify-center  mx-auto overflow-x-hidden">
          <div className="ml-48">
            <User_Profile_Header />
          </div>

          <div className="mt-16 flex justify-center">
            {/* content */}
            <div className=" mx-[50rem]">
              <div>
                <img className="h-24 ml-44" src={User_Profile} alt="" />
              </div>
              <div className="font-semibold mb-3 text-center">
                William James Moriarty
              </div>
              {/* row 1 */}
              <div className="flex gap-3">
                <div>
                  <div>First name*</div>
                  <div>
                    <input
                      className="border p-3 rounded-md"
                      type="text"
                      value="William James"
                    />
                  </div>
                </div>
                <div>
                  <div>Middle name</div>
                  <input
                    className="border p-3 rounded-md"
                    type="text"
                    value="Von"
                  />
                </div>
              </div>
              {/* row 2 */}
              <div className="flex gap-3">
                <div>
                  <div>Last name*</div>
                  <div>
                    <input
                      className="border p-3 rounded-md"
                      type="text"
                      value="Moriarty"
                    />
                  </div>
                </div>
                <div>
                  <div>Suffix name</div>
                  <select
                    name="suffix"
                    defaultValue="None"
                    className="border p-3 rounded-md"
                  >
                    <option value="None">None</option>
                    <option value="Jr.">Jr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                  </select>
                </div>
              </div>
              {/* row 3 */}
              <div className="flex gap-3">
                <div>
                  <div>Contact number*</div>
                  <div>
                    <input
                      className="border p-3 rounded-md"
                      type="number"
                      value="0912-345-6789"
                    />
                  </div>
                </div>
                <div>
                  <div>Email</div>
                  <input
                    className="border p-3 rounded-md"
                    type="text"
                    value="Criminalgenuis@example.com"
                  />
                </div>
              </div>

              {/* row 4 */}
              <div className="flex gap-3">
                <div>
                  <div>Sex at birth*</div>
                  <div>
                    <select
                      name="sex"
                      defaultValue="male"
                      className="border p-3 rounded-md"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div>Birthday*</div>

                  <input
                    className="border p-3 rounded-md w-fit"
                    type="date"
                    id="birthday"
                    name="birthday"
                  />
                </div>
              </div>
              {/* Log out */}
              <div className="border cursor-pointer mt-5 text-center text-white font-semibold bg-red-500 p-3 rounded-md justify-center">
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
