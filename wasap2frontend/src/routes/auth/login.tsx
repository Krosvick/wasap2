import { Input, Button } from "@nextui-org/react";
import axios from "axios";
import { useForm, SubmitHandler, FormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema } from "../../../../src/schemas/userSchema";
import { z } from "zod";
import { useEffect } from "react";

type UserLogin = z.infer<typeof userLoginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
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
          />
          <Input
            {...register("password")}
            placeholder="Password"
            className="w-80"
          />
          <Button type="submit" className="w-80">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
