import { ZodError, ZodSchema } from 'zod';

/**
 * Parse un schéma Zod avec log automatique des erreurs en console.
 * @param schema Le schéma Zod à utiliser
 * @param data Les données à parser
 * @param label (optionnel) Un label pour identifier la source des données
 */
export function safeParseWithLog<T>(schema: ZodSchema<T>, data: unknown, label = 'parse'): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(`❌ Erreur de parsing (${label}):`);
      console.table(
        err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    } else {
      console.error(`❌ Erreur inattendue (${label}):`, err);
    }
    throw err;
  }
}
