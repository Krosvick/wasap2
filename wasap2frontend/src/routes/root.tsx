import { Outlet } from "react-router-dom";
import AddContactForm from "../components/addContact";
import { useGetUserDetails } from "../services/userService";
import Contacts from "../components/Contacts";

export default function Root() {
  const { data, isSuccess, isLoading } = useGetUserDetails();
  return (
    <main className="flex w-screen h-screen">
      <div className="flex flex-col w-1/4 h-full bg-gray-300 p-5 bg-emerald-700 text-zinc-100">
        <AddContactForm userData={data} />
        {isLoading && <p>Loading...</p>}
        {isSuccess && <Contacts userId={data.id} />}
      </div>
      <div className="w-full">
        <Outlet />
      </div>
    </main>
  );
}
