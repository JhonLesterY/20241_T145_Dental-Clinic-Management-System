/* eslint-disable react/no-unescaped-entities */
import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.png"; //
import User_About_Us from "../components/User_About_Us";
import Pagintation_About_us from "../components/Pagintation_About_us";
import Footer from "../components/Footer";

const About_us = () => {
  return (
    <>
      <div className="flex">
        <div>
          <Dashboard />
        </div>

        <div className="justify-center  mx-auto overflow-x-hidden">
          <div className="ml-48">
            <User_About_Us />
          </div>
          <div className="mt-4">
            <Pagintation_About_us />
          </div>
          <div className="mt-10">
            {/* content */}

<div className="flex mx-[10rem]">
{/* Dentist */}
    <div>
      <img className="w-[30rem]" src={dentist} alt="" />

    </div>
    {/* Content */}
    <div>
        <h1 className="text-3xl font-bold">About Us</h1>

        <p className="w-[50rem] my-3"> Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eum impedit, maxime quas eos excepturi accusantium corporis quibusdam ea at laudantium provident harum suscipit molestiae eius dolorum. Et, porro ad.</p>
        <p className="w-[50rem] my-3">
            
Lorem ipsum, or lip sum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century
who is thought to have scrambled parts of Cicero's De Fin bus Bono rum et McAllorum for use in a typ specimen book. Lorem ipsum, or lip sum as it is sometimes known,
is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century
who is thought to have scrambled parts of Cicero's De Fin bus Bono rum et McAllorum for use in a typ specimen book.
        </p>

    </div>
</div>

            <div className="bg-slate-200 h-[4.3rem]  rounded-tr-3xl rounded-tl-3xl ml-52 p-5">
<Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About_us;
