import { z } from "zod";

export const userRegistrationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const userLoginSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(8),
  })
  .refine((data) => data.email || data.username, {
    message: "Either username or email is required",
  });

export const addFriendSchema = z.object({
  userId: z.number(),
  friendUsername: z.string(),
});
