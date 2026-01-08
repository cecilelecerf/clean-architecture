import z from "zod";

export const addressLineSchema = z
  .string({ error: "L’adresse est obligatoire" })
  .trim()
  .min(5, "L’adresse est trop courte")
  .max(255, "L’adresse est trop longue")
  .regex(/\d/, "L’adresse doit contenir un numéro");

export const citySchema = z
  .string({ error: "La ville est obligatoire" })
  .trim()
  .min(2, "Le nom de la ville est trop court")
  .max(100, "Le nom de la ville est trop long")
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "La ville contient des caractères invalides");

export const countrySchema = z
  .string({ error: "Le pays est obligatoire" })
  .trim()
  .min(2, "Le nom du pays est trop court")
  .max(100, "Le nom du pays est trop long")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Le pays contient des caractères invalides");

export const postalCodeSchema = z
  .string({ error: "Le code postal est obligatoire" })
  .trim()
  .min(3, "Le code postal est trop court")
  .max(10, "Le code postal est trop long")
  .regex(
    /^[A-Z0-9\s\-]{3,10}$/,
    "Le code postal contient des caractères invalides"
  );
export const dateOfBirthSchema = z.iso
  .datetime("Format de date invalide")
  .refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, "Date de naissance invalide")
  .refine((value) => {
    const date = new Date(value);
    const now = new Date();
    return date <= now;
  }, "La date de naissance ne peut pas être dans le futur")
  .refine((value) => {
    const date = new Date(value);
    const now = new Date();
    const minDate = new Date(
      now.getFullYear() - 150,
      now.getMonth(),
      now.getDate()
    );
    return date >= minDate;
  }, "Date de naissance invalide")
  .refine((value) => {
    const date = new Date(value);
    const now = new Date();
    const minAgeDate = new Date(
      now.getFullYear() - 18,
      now.getMonth(),
      now.getDate()
    );
    return date <= minAgeDate;
  }, "Vous devez avoir au moins 18 ans");

export const phoneNumberSchema = z
  .string({ error: "Le numéro de téléphone est obligatoire" })
  .trim()
  .refine(
    (v) => /^(\+\d{1,3})?\d{7,15}$/.test(v),
    "Numéro de téléphone invalide"
  );
export const sexeSchema = z.enum(["girl", "boy", "other"], "Sexe invalide");
