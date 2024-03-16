import { z } from "zod";

export const userRegistrationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});
