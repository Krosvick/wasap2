import { Outlet } from "react-router-dom";
import AddContactForm from "../components/addContact";
import { useGetUserDetails } from "../services/userService";
import Contacts from "../components/Contacts";
import LogoutButton from "../components/logoutButton";

export default function Root() {
  const { data, isSuccess, isLoading } = useGetUserDetails();
  return (
    <main className="flex w-screen h-screen">
      <div className="flex flex-col justify-between w-1/4 h-full bg-emerald-600 p-5 text-zinc-100">
        <div>
          <AddContactForm userData={data} />
          {isLoading && <p>Loading...</p>}
          {isSuccess && <Contacts userId={data.id} />}
        </div>
        <LogoutButton />
      </div>
      <div className="w-full h-full">
        <Outlet />
      </div>
    </main>
  );
}
