import Dashboard from "../components/Dashboard";

const Settings = () => {
  return (
    <>
      <div className="flex">
        <div>
          <Dashboard />
        </div>

        <div className="grid justify-center  mx-auto ">
          <div className="ml-48">
            {/* Header */}
            <div className="h-[3rem]  pt-3 text-center font-semibold text-lg">
              Settings
            </div>
          </div>

          <div>General Settings</div>

          <div className="mt-16">
            {/* content */}

            <div className="">
              <div className="border shadow-md p-5 rounded-xl mb-1.5">
                <div>Switch Theme</div>
              </div>
              <div className="border shadow-md p-5 rounded-xl mb-1.5">
                Notification Settings
              </div>
              <div className="border shadow-md p-5 rounded-xl mb-1.5">Help</div>
              <div className="border shadow-md p-5 rounded-xl mb-1.5">
                Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
