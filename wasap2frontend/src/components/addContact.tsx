import { Input, Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addFriendSchema } from "../../../src/schemas/userSchema";
import { z } from "zod";
import { useAddContact } from "../services/contactsService";

export type AddContact = z.infer<typeof addFriendSchema>;

export interface AddContactFormProps {
  userData: {
    id: string;
    username: string;
    email: string;
    userFriendsIds: string[];
  };
}

export default function AddContactForm({ userData }: AddContactFormProps) {
  //simple input and button to add a contact by username
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<AddContact>({
    resolver: zodResolver(addFriendSchema),
  });

  const { mutateAsync, isSuccess, data } = useAddContact();

  if (isSuccess) {
    console.log(data);
  }

  return (
    <div className="flex">
      <form
        onSubmit={handleSubmit((data) => {
          mutateAsync({ ...data, userId: userData.id });
        })}
        className="flex gap-3 m-5"
      >
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
