import z from "zod";
import { colorSchema } from "./color";
import { userIdSchema } from "./user";

export const tagIdSchema = z.uuid().brand("tag");
export type TagId = z.infer<typeof tagIdSchema>;

export const tagSchema = z.object({
  id: tagIdSchema,
  label: z.string(),
  color: colorSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Tag = z.infer<typeof tagSchema>;

export const tagToFrontSchema = tagSchema.pick({
  id: true,
  label: true,
  color: true,
});
export type TagToFront = z.infer<typeof tagToFrontSchema>;

export const postIdSchema = z.uuid().brand("post");
export type PostId = z.infer<typeof postIdSchema>;

export const postSchema = z.object({
  id: postIdSchema,
  advisorId: userIdSchema,
  title: z.string(),
  content: z.string(),
  tagsId: tagIdSchema.array(),
  createdAt: z.iso.datetime(),
  readBy: userIdSchema.array(),
  updatedAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().optional(),
  clientId: userIdSchema.optional(),
});
export type Post = z.infer<typeof postSchema>;
