import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().min(3, { message: "Minium 3 character" }).nonempty(),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z.string().min(3, { message: "Minium 3 character" }).nonempty(),
});
