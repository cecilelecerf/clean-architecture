import { UserEntity } from "./UserEntity";

export class ThreadEntity {
  private constructor(
    public id: string,
    public administratorId: UserEntity["id"],
    public participantsId: UserEntity["id"][],
    public title: string,
    public createdAt: Date,
    public isClose: boolean,
    public type: "external" | "internal",
    public lastUpdatedAt?: Date
  ) {}

  public static from({
    id,
    participantsId,
    administratorId,
    title,
    createdAt,
    lastUpdatedAt,
    isClose,
    type,
  }: Pick<
    ThreadEntity,
    | "id"
    | "administratorId"
    | "createdAt"
    | "lastUpdatedAt"
    | "participantsId"
    | "title"
    | "isClose"
    | "type"
  >) {
    return new ThreadEntity(
      id,
      administratorId,
      participantsId,
      title,
      createdAt,
      isClose,
      type,
      lastUpdatedAt
    );
  }

  public transferTo(newAdvisorId: UserEntity["id"], now: Date): void {
    if (this.administratorId === newAdvisorId) return;
    this.administratorId = newAdvisorId;
    this.lastUpdatedAt = now;
  }

  public close(): void {
    this.isClose = true;
  }
  /** Vérifie si un utilisateur est participant du thread */
  public isParticipant(userId: UserEntity["id"]): boolean {
    return this.participantsId.includes(userId);
  }

  /** Vérifie si un utilisateur est l’administrateur du thread */
  public isAdministrator(userId: UserEntity["id"]): boolean {
    return this.administratorId === userId;
  }

  /** Vérifie si un utilisateur a accès au thread (admin ou participant) */
  public hasAccess(userId: UserEntity["id"]): boolean {
    return this.isAdministrator(userId) || this.isParticipant(userId);
  }

  public addParticipant(
    userId: UserEntity["id"],
    now: Date
  ): ThreadEntity | Error {
    if (this.hasAccess(userId)) return new Error();
    this.participantsId = [...this.participantsId, userId];
    this.lastUpdatedAt = now;
    return this;
  }

  public removeParticipant(
    userId: UserEntity["id"],
    now: Date
  ): ThreadEntity | Error {
    if (!this.isParticipant(userId)) return new Error();
    const index = this.participantsId.indexOf(userId);
    if (index === -1) return new Error("User is not a participant");

    this.participantsId.splice(index, 1);
    this.lastUpdatedAt = now;

    return this;
  }
}
