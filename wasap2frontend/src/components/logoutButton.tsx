import { Button } from "@nextui-org/react";
import { useAuth } from "../providers/authProvider";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button
      onClick={() => {
        logout();
      }}
    >
      Cerrar sesión
    </Button>
  );
}
