import { Input, Button } from "@nextui-org/react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema } from "../../../../src/schemas/userSchema";
import { z } from "zod";

type UserLogin = z.infer<typeof userLoginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<UserLogin>({
    resolver: zodResolver(userLoginSchema),
  });

  const onSubmit: SubmitHandler<UserLogin> = async (data) => {
    const response = await axios.post(
      "http://localhost:3000/api/auth/login",
      data,
      { withCredentials: true },
    );
    console.log(response);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-screen">
      <h1 className="text-4xl font-bold pb-5">Login</h1>
      <div className="flex flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center"
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
        </form>
      </div>
    </div>
  );
}
