import { Input, Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addFriendSchema } from "../../../src/schemas/userSchema";
import { z } from "zod";

export type AddContact = z.infer<typeof addFriendSchema>;

export default function AddContactForm() {
  //simple input and button to add a contact by username
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<AddContact>({
    resolver: zodResolver(addFriendSchema),
  });

  return (
    <div className="flex">
      <form
        onSubmit={handleSubmit((data) => console.log(data))}
        className="flex gap-3 m-5"
      >
        <input type="hidden" {...register("userId")} value="1" />
        <Input
          {...register("friendUsername")}
          placeholder="Username"
          className="w-2/3"
          errorMessage={errors.friendUsername?.message}
        />
        <Button
          type="submit"
          className="w-1/3"
          isDisabled={!isDirty || !isValid}
          color="secondary"
        >
          Add Contact
        </Button>
      </form>
    </div>
  );
}
