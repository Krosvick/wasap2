import { Input, Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMessageSchema } from "../../../src/schemas/messagesSchema";
import { z } from "zod";
import { useSendMessage } from "../services/messageService";

export type sendMessage = z.infer<typeof sendMessageSchema.body>;

//TODO
export default function SendMessage() {
  //simple input and button to add a contact by username
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<sendMessage>({
    resolver: zodResolver(sendMessageSchema.body),
  });

  const { mutateAsync, isSuccess, data, isError } = useSendMessage();

  if (isSuccess) {
    console.log(data);
  }

  return (
    <div className="flex flex-col justify-center items-start h-fit my-2">
      <form
        onSubmit={handleSubmit((data) => {
          mutateAsync({ ...data });
        })}
        className="flex gap-3 w-full"
      >
        <Input
          {...register("message")}
          placeholder="Mensaje"
          errorMessage={errors.message?.message || isError}
        />
        <Button
          type="submit"
          className="p-5"
          isDisabled={!isDirty || !isValid}
          color="secondary"
        >
          Send
        </Button>
      </form>
      {isError && (
        <p className="text-red-700 font-semibold">Error con el mensaje</p>
      )}
    </div>
  );
}
