import { Outlet } from "react-router-dom";
import AddContactForm from "../components/addContact";
import { useGetUserDetails } from "../services/userService";
import Contacts from "../components/Contacts";
import LogoutButton from "../components/logoutButton";
import { useAuth } from "../providers/authProvider";
import { ToastContainer } from "react-toastify";

export default function Root() {
  const { userId } = useAuth();
  const { data, isSuccess, isLoading } = useGetUserDetails(userId!);
  return (
    <main className="flex w-screen h-screen">
      <div className="flex flex-col justify-between w-1/4 h-full bg-emerald-600 p-5 text-zinc-100">
        <div>
          <AddContactForm userData={data} />
          {isLoading && <p>Loading...</p>}
          {isSuccess && <Contacts userId={userId!} />}
        </div>
        <LogoutButton />
      </div>
      <div className="w-full h-full">
        <Outlet />
        <ToastContainer />
      </div>
    </main>
  );
}
