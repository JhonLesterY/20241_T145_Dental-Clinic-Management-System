import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.png";
import User_About_Us from "../components/User_About_Us";
import Footer from "../components/Footer";

const About_us = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-2">
        {/* Header */}
        <User_About_Us />

        {/* About Us Content */}
        <div className="flex flex-col lg:flex-row items-center justify-center mt-8 space-x-0 lg:space-x-10 space-y-6 lg:space-y-0">
          {/* Image */}
          <div className="flex justify-center">
            <img
              className="object-contain w-64 h-140"
              src={dentist}
              alt="Dentist"
            />
          </div>

          {/* Text Content */}
          <div className="max-w-lg text-center lg:text-left">
            <h2 className="text-5xl font-semibold text-[#003367] mb-6">
              About Us
            </h2>
            <p className="text-gray-700 mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eum impedit, maxime quas eos excepturi accusantium corporis quibusdam ea at laudantium provident harum suscipit molestiae eius dolorum.
            </p>
            <p className="text-gray-700">
              Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic, or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's *De Finibus Bonorum et Malorum* for use in a type specimen book.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 mt-20 mx-auto w-full max-w-5xl">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default About_us;
