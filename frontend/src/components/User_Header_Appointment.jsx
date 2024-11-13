import { Link } from 'react-router-dom'
import Logo from '/src/images/Dental_logo.png'
import bell from '/src/images/bell.png'
import magnify from '/src/images/magnifying-glass.png'

const User_Header_Appointment = () => {
  return (
  
   <>
  <header className="text-gray-600 body-font shadow-md">
      <div className="flex items-center justify-between p-2 mx-auto w-full max-w-5xl">
        <div className="flex items-center">
      <img className='w-11 cursor-pointer' src={Logo} alt="dental-logo" />
      <Link to='/appointment' className="ml-3 text-xl font-semibold text-[#003367] cursor-pointer">Appointment</Link>
    </div>

      <div className='flex bg-white gap-1 border rounded-xl justify-self-center px-3 py-0.5'>
      <div className='my-auto'>
          <img className='w-5' src={magnify} alt="" />
      </div>
      <input type="text" placeholder='Search' className=' p-0.5 outline-none'/>
      </div>
          <button className=" justify-self-end items-center bg-gray-100 border-0 p-3 focus:outline-none hover:bg-gray-200 rounded-full text-base mt-4 md:mt-0">
            <img className='w-6' src={bell} alt="" />
          </button>
        </div>
      </header>

      <div className='border w-[95rem] mx-auto'></div>
          </>
   
  )
}

export default User_Header_Appointment;