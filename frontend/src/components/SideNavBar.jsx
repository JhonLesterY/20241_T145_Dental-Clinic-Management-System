import { NavLink } from "react-router-dom";

export default function SideNavBar() {
  return (
    <>
      {/* Navbar */}
      <nav className="h-screen fixed bg-customblue text-slate-200 w-[15rem] justify-items-center ">
        <NavLink to="/">
          <h1 className="text-2xl font-semibold mb-9">Unicare</h1>
        </NavLink>
        <ul>
          <li className="cursor-pointer mb-2">
            <NavLink to="/" className=" font-medium text-lg">
              Home
            </NavLink>
          </li>
          <li className="mb-2  font-medium text-lg">
            <NavLink to="/about-us">About</NavLink>
          </li>

          <li className=" font-medium text-lg">
            <NavLink>Contact</NavLink>
          </li>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <li className=" font-medium text-lg">
            <NavLink to="/login">Login</NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
