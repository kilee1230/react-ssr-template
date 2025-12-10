import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

export type User = z.infer<typeof UserSchema>;

export const ServerDataSchema = z.object({
  users: z.array(UserSchema),
  timestamp: z.number(),
});

export type ServerData = z.infer<typeof ServerDataSchema>;
