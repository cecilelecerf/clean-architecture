export class InvalidTitleError extends Error {
  constructor(public readonly title: string, public readonly reason?: string) {
    super(
      `Invalid thread title: "${title}". ${reason ?? "The title is not valid."}`
    );
    this.name = "InvalidTitleError";
  }
}
