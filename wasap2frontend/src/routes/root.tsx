import { Outlet } from "react-router-dom";
import AddContactForm from "../components/addContact";

export default function Root() {
  return (
    <main className="flex w-screen h-screen">
      <div className="flex w-1/5 h-full bg-gray-300">
        <AddContactForm />
      </div>
      <div className="w-2/3">
        <Outlet />
      </div>
    </main>
  );
}
