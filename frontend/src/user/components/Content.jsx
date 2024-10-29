import BGbuksu from "/src/images/BukSU-Dental-Clinic.jpg";

// BukSU-Dental-Clinic.jpg
export default function Content() {
  return (
    <>
      {/* Landing Page */}
      <div className=" body-font relative h-screen w-screen">
        <div className="absolute bg-gray-800">
          <img
            className="object-cover opacity-75 h-screen w-screen fixed"
            src={BGbuksu}
            alt="buksuBG"
          />
        </div>

        <div className="bg-gray-950 mix-blend-darken opacity-30 absolute h-screen w-screen z-20"></div>

        <div className="container px-5 py-24 mx-auto flex ">
          <div className="z-20 mx-auto py-36 my-auto text-white flex  gap-3">
            <div className="text-5xl w-52 font-semibold flex text-wrap">
              Welcome to BukSU Dental Clinic
            </div>
            <div className="border"></div>
            <div className="my-auto">
              <h1>We</h1>
              <h1>Provide</h1>
              <h1 className="text-nowrap ">Best Dental Care Service</h1>{" "}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// <div className="h-screen bg-contextcolor w-screen ">

//    <div className="z-20 absolute inset-0 opacity-30">
//       <img className="h-screen w-screen object-cover" src={BGbuksu} alt="bgimg" />
//     </div>
//       <div className="z-30 opacity-100 mx-[50rem] py-36  text-white flex gap-3 ">
//         <div className="text-5xl font-semibold">
//           Welcome to BukSU Dental Clinic
//         </div>
//         <div className="border"></div>
//         <div className="my-auto">
//           <h1>We</h1>
//           <h1>Provide</h1>
//           <h1 className="text-nowrap ">Best Dental Care Service</h1>{" "}
//         </div>
//       </div>
//    </div>
