import { Button } from "@nextui-org/react";
import { useAuth } from "../providers/authUtils";

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
