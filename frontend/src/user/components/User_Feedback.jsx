import buksubg from '/src/images/BukSU-Dental-Clinic.jpg';
import { Link } from 'react-router-dom'
import Logo from '/src/images/Dental_logo.png'
import bell from '/src/images/bell.png'


const User_Feedback = () => {
  return (
   <>
     <div>
        <div>
        <header className="text-gray-600 body-font ">
  <div className="  grid grid-cols-2 p-3 mx-4 flex-col md:flex-row">
    <div className="flex justify-self-start title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
    <Link to="/dashboard">
      <img className='w-11 cursor-pointer ml-52' src={Logo} alt="dental-logo" />
      </Link>
      <div className="ml-3 text-xl cursor-pointer">Feed Back</div>
    </div>

    <button className="inline-flex justify-self-end items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full text-base mt-4 md:mt-0">
      <img className='w-6' src={bell} alt="" />
    </button>
  </div>
</header>

<div className='border w-[95rem] mx-auto'></div>
        </div>

    <section className="text-gray-600 body-font relative">
  <div className="absolute inset-0 opacity-60 bg-gray-300">
   <img className='h-screen w-screen object-cover' src={buksubg} alt="bg" />
  </div>
  <div className='absolute bg-black h-screen w-screen opacity-20'></div>
  <div className="container px-5 py-24 mx-auto flex">
    <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
      <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">Feedback</h2>

      <div className="relative mb-4">
        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
        <input type="email" id="email" name="email" className="w-full bg-white rounded border border-gray-300 focus:border-black focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
      </div>
      <div className="relative mb-4">
        <label htmlFor="message" className="leading-7 text-sm text-gray-600">Message</label>
        <textarea id="message" name="message" className="w-full bg-white rounded border border-gray-300 focus:border-black focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
      </div>
      <button className="text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg">Send</button>

    </div>
  </div>
</section>
    </div>
   </>
  )
}

export default User_Feedback