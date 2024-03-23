import { z } from "zod";

export const accessRoomSchema = z.object({
  userId: z.string(),
  roomId: z.string(),
});

export const sendMessageSchema = {
  params: z.object({
    username: z.string(),
    convId: z.string(),
  }),
  body: z.object({
    message: z.string().min(1).max(500),
  }),
};
