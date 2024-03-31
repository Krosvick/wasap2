import { Input, Button, Image } from "@nextui-org/react";
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

  const { mutateAsync, isSuccess, data, isError } = useAddContact();

  if (isSuccess) {
    console.log(data);
  }

  return (
    <div className="flex flex-col justify-center items-start h-fit my-2">
      <Image
        src="https://images3.memedroid.com/images/UPLOADED199/64d8460d85072.jpeg"
        alt="wasap2"
        width="200"
        height="50"
        className="m-1"
      />
      <h2 className="text-xl font-bold pb-1">Añadir contacto</h2>
      <form
        onSubmit={handleSubmit((data) => {
          mutateAsync({ ...data, userId: userData.id });
        })}
        className="flex gap-3 w-full"
      >
        <Input
          {...register("friendUsername")}
          placeholder="Username"
          errorMessage={errors.friendUsername?.message || isError}
        />
        <Button
          type="submit"
          className="p-5"
          isDisabled={!isDirty || !isValid}
          color="secondary"
        >
          Añadir
        </Button>
      </form>
      {isError && (
        <p className="text-red-700 font-semibold">
          Contacto ya agregado, viva la republica popular China!!!!
        </p>
      )}
    </div>
  );
}
