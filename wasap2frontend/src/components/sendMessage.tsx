import { Input, Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMessageSchema } from "../../../src/schemas/messagesSchema";
import { z } from "zod";
import { emitMessage } from "../services/messageService";

export type sendMessage = z.infer<typeof sendMessageSchema.body>;

//TODO
export default function SendMessage({
  conversationId,
  receiverId,
}: {
  conversationId: string;
  receiverId: string;
}) {
  //simple input and button to add a contact by username

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<sendMessage>({
    resolver: zodResolver(sendMessageSchema.body),
  });

  return (
    <div className="flex flex-col justify-center items-start h-fit my-2">
      <form
        onSubmit={handleSubmit((data) => {
          const updatedData = {
            ...data,
            receiverId: receiverId,
            conversationId: conversationId,
          };
          emitMessage(updatedData);
        })}
        className="flex gap-3 w-full"
      >
        <Input
          {...register("message")}
          placeholder="Mensaje"
          errorMessage={errors.message?.message}
        />
        <Button
          type="submit"
          className="p-5"
          color="secondary"
          isDisabled={!isDirty || !isValid}
        >
          Enviar
        </Button>
      </form>
    </div>
  );
}
