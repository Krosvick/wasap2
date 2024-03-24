import { Input, Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userRegistrationSchema } from "../../../../src/schemas/userSchema";

import { useRegister } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export type UserRegister = z.infer<typeof userRegistrationSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<UserRegister>({
    resolver: zodResolver(userRegistrationSchema),
  });

  const { mutateAsync, isSuccess, data } = useRegister();

  if (isSuccess) {
    console.log(data);
    navigate("/login", { replace: true });
    return;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-screen pb-5">
      <h1 className="text-4xl font-bold pb-5">Register</h1>
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
            {...register("email")}
            placeholder="Email"
            className="w-80"
            errorMessage={errors.email?.message}
          />
          <Input
            {...register("password")}
            placeholder="Password"
            className="w-80"
            errorMessage={errors.password?.message}
          />
          <Button
            type="submit"
            className="w-80"
            isDisabled={!isDirty || !isValid}
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
