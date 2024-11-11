import Dashboard from "./Dashboard";
import User_Header_Appointment from "./User_Header_Appointment";
import Pagintation_Upload_Requirements from "./Pagintation_Upload_Requirements";

const User_Upload_Requirements = () => {
  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <User_Header_Appointment />

        {/* Content Section */}
        <div className="w-full max-w-4xl mt-4 p-4">
          <h2 className="text-2xl font-semibold text-center text-[#003367] mb-4">
            Upload Requirements
          </h2>

          {/* Requirements Cards - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-white shadow-md border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
              <h1 className="text-lg font-medium mb-2 text-gray-700">
                Validated School ID
              </h1>
              <p className="text-sm text-gray-500 mb-4">(Scanned)</p>
              <input
                type="file"
                className="text-xs text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-blue-50 hover:file:text-blue-700 transition-all cursor-pointer"
              />
            </div>

            {/* Card 2 */}
            <div className="bg-white shadow-md border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
              <h1 className="text-lg font-medium mb-2 text-gray-700">
                Certificate of Registration
              </h1>
              <p className="text-sm text-gray-500 mb-4">(Scanned)</p>
              <input
                type="file"
                className="text-xs text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-blue-50 hover:file:text-blue-700 transition-all cursor-pointer"
              />
            </div>

            {/* Card 3 */}
            <div className="bg-white shadow-md border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
              <h1 className="text-lg font-medium mb-2 text-gray-700">
                Vaccination Card
              </h1>
              <p className="text-sm text-gray-500 mb-4">(Scanned)</p>
              <input
                type="file"
                className="text-xs text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-blue-50 hover:file:text-blue-700 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagintation_Upload_Requirements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Upload_Requirements;
