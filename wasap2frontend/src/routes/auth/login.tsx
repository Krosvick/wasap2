import { Input, Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema } from "../../../../src/schemas/userSchema";
import { z } from "zod";
import { useLogin } from "../../services/authService";
import { useAuth } from "../../providers/authProvider";

import { useNavigate } from "react-router-dom";

export type UserLogin = z.infer<typeof userLoginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<UserLogin>({
    resolver: zodResolver(userLoginSchema),
  });

  const { mutateAsync, isSuccess, data } = useLogin();

  console.log(isSuccess);
  if (isSuccess) {
    login(data.data.token!);
    navigate("/", { replace: true });
    return;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <h1 className="text-4xl font-bold pb-5">Login</h1>
      <div className="flex flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit((data) => mutateAsync(data))}
          className="flex flex-col items-center justify-center gap-3"
        >
          <Input
            {...register("username")}
            placeholder="Username"
            className="w-80"
            errorMessage={errors.username?.message}
          />
          <Input
            {...register("password")}
            placeholder="Password"
            type="password"
            className="w-80"
            errorMessage={errors.password?.message}
          />
          <Button
            type="submit"
            className="w-80"
            isDisabled={!isDirty || !isValid}
          >
            Login
          </Button>
          <Button onClick={() => navigate("/register")} className="w-80">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
