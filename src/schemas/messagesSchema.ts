import { z } from "zod";

export const accessRoomSchema = z.object({
  userId: z.string(),
  roomId: z.string(),
});

export const sendMessageSchema = z.object({
  message: z.string(),
  conversationId: z.string(),
});
