import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.png";
import User_About_Us from "../components/User_About_Us";
import Footer from "../components/Footer";

const About_us = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 space-y-4">
        {/* Header */}
        <div>
          <User_About_Us />
        </div>

        {/* About Us Content */}
        <div className="flex flex-row items-center justify-center space-x-6">
          {/* Image */}
          <div>
            <img
              className="object-contain w-64 h-64"
              src={dentist}
              alt="Dentist"
            />
          </div>

          {/* Text Content */}
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-semibold text-[#003367] mb-4">
              About Us
            </h2>
            <p className="text-gray-700 mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eum impedit, maxime quas eos excepturi accusantium corporis quibusdam ea at laudantium provident harum suscipit molestiae eius dolorum. Et, porro ad.
            </p>
            <p className="text-gray-700">
              Lorem ipsum, or lip sum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full bg-slate-200 p-4">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default About_us;
