import Content from "../components/Content";
import SideNavBar from "../components/SideNavBar";

export default function Landing_Page() {
  return (
    <>
      <div className="h-dvh flex flex-cols-2 grow">
        <div className="relative">
          <div className="fixed left-0 z-50">
            <SideNavBar />
          </div>

          <div className="text-white overflow-hidden">
            <Content />
          </div>
        </div>
      </div>
    </>
  );
}
