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

// 404 Not Found data
export const NotFoundDataSchema = z.object({
  type: z.literal("notfound"),
  method: z.string(),
  path: z.string(),
});

export type NotFoundData = z.infer<typeof NotFoundDataSchema>;

// Union type for all page data
export type PageData = ServerData | NotFoundData;
