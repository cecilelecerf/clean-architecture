export class ThreadAlreadyHasAdvisorError extends Error {
  public readonly statusCode = 409;
  constructor(message = "Thread déjà assigné à un conseiller.") {
    super(message);
    this.name = "ThreadAlreadyHasAdvisorError";
  }
}
