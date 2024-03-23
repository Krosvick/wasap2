import { Outlet, Link } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div className="flex min-w-1/3 h-full bg-gray-300">
        <h1>React Router Contacts</h1>
        <div className="flex items-center"></div>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
