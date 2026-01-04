import { ThreadEntity } from "@domain/entities/ThreadEntity";

export class InvalidThreadTypeError extends Error {
  public readonly statusCode = 400;

  constructor(
    public readonly threadId: ThreadEntity["id"],
    public readonly threadType: ThreadEntity["type"],
    public readonly operation: string
  ) {
    super(
      `Cannot ${operation} on thread ${threadId} with type "${threadType}". This operation is not allowed for this thread type.`
    );
    this.name = "InvalidThreadTypeError";
  }
}
