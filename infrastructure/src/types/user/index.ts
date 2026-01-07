import z from "zod";
import {
  addressLineSchema,
  citySchema,
  countrySchema,
  dateOfBirthSchema,
  phoneNumberSchema,
  postalCodeSchema,
  sexeSchema,
} from "./client";

export const userIdSchema = z.uuid().brand("user");
export type UserId = z.infer<typeof userIdSchema>;

export const baseUserSchema = z.object({
  id: userIdSchema,
  firstname: z
    .string({ error: "Le prénom est obligatoire" })
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastname: z
    .string({ error: "Le nom est obligatoire" })
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z.email("Format d’email invalide"),
  passwordHash: z
    .string({ error: "Le mot de passe est obligatoire" })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  isActiveField: z.preprocess((val) => val === 1 || val === true, z.boolean()),
  createdAt: z.iso.datetime(),
  confirmedAt: z.iso.datetime().nullable().optional(),
  updatedAt: z.iso.datetime().nullable(),
});

const addressSchema = z.object({
  city: citySchema,
  country: countrySchema,
  address: addressLineSchema,
  postalCode: postalCodeSchema,
});
export const clientSchema = baseUserSchema.extend({
  role: z.literal("client"),
  sexe: sexeSchema,
  address: addressSchema,
  dateOfBirth: dateOfBirthSchema,
  phoneNumber: phoneNumberSchema,
});

export const userSchema = z.discriminatedUnion("role", [
  clientSchema,
  baseUserSchema.extend({
    role: z.literal("conseiller"),
  }),
  baseUserSchema.extend({
    role: z.literal("directeur"),
  }),
]);

export type User = z.infer<typeof userSchema>;

export type ClientUser = Extract<User, { role: "client" }>;
export type ConseillerUser = Extract<User, { role: "conseiller" }>;
export type DirecteurUser = Extract<User, { role: "directeur" }>;

export const createClientSchema = clientSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    confirmedAt: true,
    isActiveField: true,
    address: true,
  })
  .extend({
    confirmPassword: clientSchema.shape.passwordHash,
    ...addressSchema.shape,
  });
export type CreateClientPayload = z.infer<typeof createClientSchema>;

export const updateUserBaseSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.email().optional(),
});

export const updateClientSchema = updateUserBaseSchema.extend({
  sexe: z.enum(["girl", "boy", "other"]).optional(),
  address: addressSchema.partial().optional(),
  dateOfBirth: z.iso.datetime().optional(),
  phoneNumber: z.string().optional(),
});

export type UpdateClientPayload = z.infer<typeof updateClientSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserBaseSchema>;

export const userDtoSchema = z.discriminatedUnion("role", [
  z.object({
    id: userIdSchema,
    firstname: z.string(),
    lastname: z.string(),
    email: z.email(),
    role: z.literal("client"),
    isActiveField: z.boolean(),
    confirmedAt: z.iso.datetime().nullable().optional(),
  }),
  z.object({
    id: userIdSchema,
    firstname: z.string(),
    lastname: z.string(),
    email: z.email(),
    role: z.literal("conseiller"),
    isActiveField: z.boolean(),
    confirmedAt: z.iso.datetime().nullable().optional(),
  }),
  z.object({
    id: userIdSchema,
    firstname: z.string(),
    lastname: z.string(),
    email: z.email(),
    role: z.literal("directeur"),
    isActiveField: z.boolean(),
    confirmedAt: z.iso.datetime().nullable().optional(),
  }),
]);

export type UserDto = z.infer<typeof userDtoSchema>;

export const advisorStat = z.object({
  acceptedCreditsCount: z.number(),
  refusedCreditsCount: z.number(),
  activeThreadsCount: z.number(),
});

export const loginSchema = clientSchema
  .pick({
    email: true,
  })
  .extend({ password: baseUserSchema.shape.passwordHash });
export type LoginPayload = z.infer<typeof loginSchema>;
export const reqRegisterSchema = clientSchema
  .pick({
    firstname: true,
    lastname: true,
    email: true,
    address: true,
    dateOfBirth: true,
    phoneNumber: true,
    sexe: true,
  })
  .extend({ plainedPassword: z.string(), confirmPlainedPassword: z.string() });
export type RegisterPayload = z.infer<typeof reqRegisterSchema>;

export const registerAdminPayload = baseUserSchema
  .pick({
    firstname: true,
    lastname: true,
    email: true,
  })
  .extend({ role: z.string() });
export type RegisterAdminPayload = z.infer<typeof registerAdminPayload>;

export type RegisterResponse = z.infer<typeof userSchema>;

export const banUserSchema = z.object({ status: z.boolean() });
export type ReqBanUser = z.infer<typeof banUserSchema>;
