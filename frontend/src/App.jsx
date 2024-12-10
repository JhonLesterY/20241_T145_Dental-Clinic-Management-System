import { Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import About_us from "./pages/About_us";
import Landing_Page from "./pages/DentalClinicLanding";
import Login from "./pages/PatientLogin";
import SignUp from "./pages/PatientSignup";
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
import Admin_ViewFeedback from "./pages/Admin_ViewFeedback";
import ProtectedRoutes from "./components/protectedRoutes";
import ForgotPassword from "./pages/ForgotPassword";
import DentistDashboard from "./pages/Dentist_Dashboard";
import Dentist_ViewConsultation from "./pages/Dentist_ViewConsultation";
import Dentist_AddConsultation from "./pages/Dentist_AddConsultation";
import Dentist_Settings from "./pages/Dentist_Settings";
import Dentist_Profile from "./pages/Dentist_Profile";
import Dentist_ViewFeedback from "./pages/Dentist_ViewFeedback";
import UserSideBar from "./components/UserSideBar";
import AdminSideBar from "./components/AdminSideBar";
import Admin_UserManagement from "./pages/Admin_UserManagement";
import ResetPassword from "./pages/ResetPassword";
import DentistSideBar from "./components/DentistSidebar";
import Dentist_Report from "./pages/Dentist_Report";
import User_Report from "./pages/User_Report";
import Admin_Report from "./pages/Admin_Report";
import ActivityLogs from "./pages/ActivityLogs";
import AdminVerification from "./pages/AdminVerification";

function App() {
  console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID); 
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <>  
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing_Page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about-us" element={<About_us />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected Routes for Users */}
        <Route element={<ProtectedRoutes accountType="patient" />}>
          <Route path="/dashboard" element={<User_Dashboard />} />
          <Route path="/appointment" element={<User_Appointment />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/upload-requirements" element={<User_Upload_Requirements />} />
          <Route path="/appointment-confirmation" element={<Appointment_Confirmation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user-sidebar" element={<UserSideBar />} />
          <Route path="/user-reports" element={<User_Report />} />
        </Route>

        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoutes accountType="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-calendar" element={<Calendar />} />
          <Route path="/admin-inventory" element={<Inventory />} />
          <Route path="/admin-profile" element={<Admin_profile />} />
          <Route path="/admin-settings" element={<Admin_settings />} />
          <Route path="/admin-viewAppointment" element={<ViewAppointment />} />
          <Route path="/appointment-confirmation" element={<Confirmation />} />
          <Route path="/admin-viewFeedback" element={<Admin_ViewFeedback />} />
          <Route path="/admin-sidebar" element={<AdminSideBar />} />
          <Route path="/admin-userManagement" element={<Admin_UserManagement />} />
          <Route path="/admin-report" element={<Admin_Report />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
        </Route>
        
        {/* Protected Routes for Dentists */}
        <Route element={<ProtectedRoutes accountType="dentist" />}>
          <Route path="/dentist-dashboard" element={<DentistDashboard />} />
          <Route path="/dentist-viewConsultation" element={<Dentist_ViewConsultation />} />
          <Route path="/dentist-addConsultation" element={<Dentist_AddConsultation />} />
          <Route path="/dentist-settings" element={<Dentist_Settings />} />
          <Route path="/dentist-profile" element={<Dentist_Profile />} />
          <Route path="/dentist-viewFeedback" element={<Dentist_ViewFeedback />} />
          <Route path="/dentist-sidebar" element={<DentistSideBar />} />
          <Route path="/reports" element={<Dentist_Report />} />
        </Route>

        <Route path="/verify-admin/:token" element={<AdminVerification />} />
      </Routes>
    </>
    </GoogleOAuthProvider>
  );
}
export default App;
