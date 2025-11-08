/**
 * Type générique pour représenter un arbre d'endpoints récursif
 */
type APIStructure = {
  [K in string]: ((...p: any[]) => any) | APIStructure;
};

/**
 * Crée un arbre d'endpoints récursif en conservant le typage strict.
 * Utile pour structurer les appels API de manière centralisée.
 *
 * @param structure L'objet de définition des endpoints
 * @returns Le même objet, typé correctement
 *
 * @example
 * const api = createEndpointsNodes({
 *   users: {
 *     getById: (id: string) => ({ queryKey: ["users", id], queryFn: () => fetchUser(id) }),
 *     create: (user: User) => ({ mutationKey: ["users", "create"], mutationFn: () => createUser(user) }),
 *   },
 * });
 *
 * // Usage :
 * api.users.getById("abc");
 * api.users.create({ name: "Alice" });
 */
export function createEndpointsNodes<T extends APIStructure>(structure: T): T {
  return structure;
}
