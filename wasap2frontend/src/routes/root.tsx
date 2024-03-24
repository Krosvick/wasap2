import { Outlet } from "react-router-dom";
import AddContactForm from "../components/addContact";
import { useGetUserDetails } from "../services/userService";

export default function Root() {
  const { data } = useGetUserDetails();
  console.log(data);
  return (
    <main className="flex w-screen h-screen">
      <div className="flex w-1/5 h-full bg-gray-300">
        <AddContactForm userData={data}/>
      </div>
      <div className="w-2/3">
        <Outlet />
      </div>
    </main>
  );
}
