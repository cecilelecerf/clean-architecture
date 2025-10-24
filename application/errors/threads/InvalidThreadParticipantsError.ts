export class InvalidThreadParticipantsError extends Error {
  public readonly name = "InvalidThreadParticipantsError";

  constructor(message?: string) {
    super(
      message ||
        "Le nombre ou la composition des participants du thread est invalide."
    );
  }
}
