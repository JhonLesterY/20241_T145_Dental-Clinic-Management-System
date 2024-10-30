import { Route, Routes } from "react-router-dom";
import "./App.css";
import Landing_Page from "./user/pages/DentalClinicLanding";
import Login from "./user/pages/PatientLogin";
import User_Dashboard from "./user/pages/User_Dashboard";
import User_Appointment from "./user/pages/User_Appointment";
import Feedback from "./user/pages/Feedback";
import About_us from "./user/pages/About_us";
import User_Upload_Requirements from "./user/components/User_Upload_Requirements";
import Appointment_Confirmation from "./user/pages/Appointment_Confirmation";
import Settings from "./user/pages/Settings";
import Profile from "./user/pages/Profile";

function App() {
  return (
    <>  
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Landing_Page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<User_Dashboard />} />
        <Route path="/appointment" element={<User_Appointment />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/about-us" element={<About_us />} />
        <Route
          path="/upload-requirements"
          element={<User_Upload_Requirements />}
        />
        <Route
          path="/Appointment-Confirmation"
          element={<Appointment_Confirmation />}
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
