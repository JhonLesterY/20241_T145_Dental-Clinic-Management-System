/* eslint-disable react/no-unescaped-entities */
import { NavLink } from "react-router-dom";
import bg from "/src/images/BukSU-Dental-Clinic.jpg";
import googlelogo from "/src/images/google.png";

const Login = () => {
  return (
    <>
      <form className="text-white body-font">
        <div className="absolute z-0">
          <img
            className="object-cover mix-blend-darken bg-gray-500 opacity-60 h-screen w-screen"
            src={bg}
            alt="bg"
          />
        </div>
        <div className="bg-gray-950 mix-blend-darken opacity-10 absolute h-screen w-screen z-0"></div>
        <div className="container absolute z-10 px-5 py-24 mx-auto flex  items-center">
          <div className="text-center lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
            <h1 className="font-medium text-3xl text-gray-800">
              University Dental Clinic Management
            </h1>
          </div>
          <div className="lg:w-2/6 md:w-1/2 bg-customblue rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
            <h2 className=" text-lg font-medium title-font mb-5">Login</h2>
            <div className="relative mb-4">
              <label
                htmlFor="email"
                className="leading-7 text-sm text-blue-200"
              >
                Institutional Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full bg-white rounded border border-gray-300   text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="password"
                className="leading-7 text-sm text-blue-200"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full bg-white rounded border border-gray-300    text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>

            <div className="flex  mx-auto text-center mb-8 gap-3">
              <div className="underline text-blue-200 cursor-pointer">
                Forgot Password
              </div>
              <div>or</div>
              <div className="underline text-blue-200 cursor-pointer">
                Create Account
              </div>
            </div>

            <div className="flex cursor-pointer mx-auto text-center mb-8 gap-2 rounded-lg bg-white hover:bg-slate-200 p-2">
              <div>
                <img
                  className="h-8 w-8 my-auto"
                  src={googlelogo}
                  alt="googlelogo"
                />
              </div>
              <div className="text-black my-auto ">Continue with Google</div>
            </div>

            <NavLink
              to="/dashboard"
              className="text-white text-center bg-red-500 hover:bg-red-600 border-0 py-2 px-8  rounded text-lg"
            >
              <button className="font-semibold">Login</button>
            </NavLink>
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;
