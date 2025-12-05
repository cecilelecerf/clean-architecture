import z from "zod";

export const colorSchema = z.enum([
  "yellow",
  "blue",
  "purple",
  "gray",
  "orange",
  "pink",
  "red",
  "green",
]);

export type Color = z.infer<typeof colorSchema>;
