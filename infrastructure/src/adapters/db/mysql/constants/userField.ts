export const USER_FIELDS = [
  "id",
  "firstname",
  "lastname",
  "email",
  "password_hash",
  "role",
  "is_active",
  "created_at",
  "confirmed_at",
  "updated_at",
  "phone_number",
  "city",
  "address",
  "country",
  "postal_code",
  "sexe",
  "date_of_birth",
] as const;

export const getUserFields = (alias: string, prefix: string): string => {
  return USER_FIELDS.map(
    (field) => `${alias}.${field} AS ${prefix}${field}`,
  ).join(",\n        ");
};

export const getNullUserFields = (prefix: string): string => {
  return USER_FIELDS.map((field) => `NULL as ${prefix}${field}`).join(
    ",\n        ",
  );
};
