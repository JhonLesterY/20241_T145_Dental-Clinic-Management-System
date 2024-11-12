import { Link } from 'react-router-dom'
import Logo from '/src/images/Dental_logo.png'
import bell from '/src/images/bell.png'
import magnify from '/src/images/magnifying-glass.png'

const User_Header_Appointment = () => {
  return (
  
   <>
  <header className="text-gray-600 body-font ">
  <div className="  grid grid-cols-3 p-2 mx-4 flex-col md:flex-row">
    <div className="flex justify-self-start title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
      <img className='w-11 cursor-pointer' src={Logo} alt="dental-logo" />
      <Link to='/appointment' className="ml-3 text-xl cursor-pointer">Appointment</Link>
  
    </div>

<div className='flex bg-white gap-1 border rounded-xl justify-self-center px-2 py-0.5'>
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