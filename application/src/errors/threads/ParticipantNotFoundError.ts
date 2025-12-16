export class ParticipantNotFoundError extends Error {
    public readonly statusCode = 404;

    constructor(
        public readonly participantId: string,
        public readonly threadId: string
    ) {
        super(`Participant ${participantId} not found in thread ${threadId}`);
        this.name = "ParticipantNotFoundError";
    }
}