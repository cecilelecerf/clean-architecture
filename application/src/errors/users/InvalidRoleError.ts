export class InvalidRoleError extends Error {
  public readonly name = "InvalidRoleError";
  public readonly statusCode = 400;

  constructor(
    public readonly providedRole: string,
    public readonly allowedRoles: string[]
  ) {
    super(
      `Le rôle "${providedRole}" n'est pas valide. Rôles autorisés : ${allowedRoles.join(
        ", "
      )}`
    );
    Object.setPrototypeOf(this, InvalidRoleError.prototype);
  }
}
