import { Route, Routes } from "react-router-dom";
import About_us from "./pages/About_us";
import Landing_Page from "./pages/DentalClinicLanding";
import Login from "./pages/PatientLogin";
import SignUp from "./pages/PatientSIgnup";
import User_Dashboard from "./pages/User_Dashboard";
import User_Appointment from "./pages/User_Appointment";
import Feedback from "./pages/Feedback";
import User_Upload_Requirements from "./components/User_Upload_Requirements";
import Appointment_Confirmation from "./pages/Appointment_Confirmation";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin_Dashboard";
import Calendar from "./pages/Admin_Calendar";
import Inventory from "./pages/Admin_Inventory";
import Admin_profile from "./pages/Admin_Profile";
import Admin_settings from "./pages/Admin_Settings";
import ViewAppointment from "./pages/Admin_ViewAppointment";
import Confirmation from "./pages/Appointment_Confirmation";

function App() {
  return (
    <>  
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Landing_Page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-inventory" element={<Inventory />} />
        <Route path="/admin-calendar" element={<Calendar />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-profile" element={<Admin_profile />} />
        <Route path="/admin-settings" element={<Admin_settings/>} />
        <Route path="/admin-viewAppointment" element={<ViewAppointment/>}/>
        <Route path="/appointment-confirmation" element={<Confirmation />} />
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
