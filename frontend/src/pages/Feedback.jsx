import Dashboard from "../components/Dashboard";
import User_Feedback from "../components/User_Feedback";

const Feedback = () => {
  return (
    <>
      <div className="flex">
        <div className="z-20">
          <Dashboard />
        </div>

        <div className="w-screen z-0">
          <User_Feedback />
        </div>
      </div>
    </>
  );
};

export default Feedback;
