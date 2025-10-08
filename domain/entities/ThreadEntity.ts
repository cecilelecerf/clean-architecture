import { UserEntity } from "./UserEntity";

export class ThreadEntity {
  private constructor(
    public id: string,
    public participants: UserEntity["id"][],
    public createdAt: Date,
    public lastUpdatedAt: Date
  ) {}
  public static create({
    participants,
  }: Pick<ThreadEntity, "participants">): ThreadEntity | Error {
    if (participants.length < 2) {
      return new Error("A thread must have at least two participants");
    }

    const now = new Date();
    return new ThreadEntity(crypto.randomUUID(), participants, now, now);
  }
  public static from({
    id,
    participants,
    createdAt,
    lastUpdatedAt,
  }: ThreadEntity) {
    return new ThreadEntity(id, participants, createdAt, lastUpdatedAt);
  }
  public addParticipant(userId: UserEntity["id"]): void {
    if (!this.participants.includes(userId)) {
      this.participants.push(userId);
      this.lastUpdatedAt = new Date();
    }
  }

  public removeParticipant(userId: UserEntity["id"]): void {
    this.participants = this.participants.filter((id) => id !== userId);
    this.lastUpdatedAt = new Date();
  }

  public hasParticipant(userId: UserEntity["id"]): boolean {
    return this.participants.includes(userId);
  }
}
