import { ThreadParticipantAlreadyExistError } from "@domain/errors/thread/ThreadParticipantAlreadyExistError";
import { UserEntity } from "./UserEntity";
import { InvalidThreadAccessError } from "@domain/errors/thread/InvalidThreadAccessError";
import { ThreadClosedError } from "@domain/errors/thread/ThreadClosedError";
import { AdministratorCannotLeaveThreadError } from "@domain/errors/thread/AdministratorCannotLeaveThreadError";
import { InvalidTitleError } from "@domain/errors/thread/InvalidTitleError";

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

  public transferTo(
    newAdvisorId: UserEntity["id"],
    now: Date
  ): ThreadEntity | ThreadClosedError | Error {
    if (this.isClose) return new ThreadClosedError(this.id);
    if (this.administratorId === newAdvisorId) return new Error();
    this.administratorId = newAdvisorId;
    this.lastUpdatedAt = now;
    return this;
  }

  public close(now: Date): void {
    this.lastUpdatedAt = now;
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
  ): ThreadEntity | ThreadParticipantAlreadyExistError | ThreadClosedError {
    if (this.isClose) return new ThreadClosedError(this.id);
    if (this.hasAccess(userId))
      return new ThreadParticipantAlreadyExistError(userId);
    this.participantsId = [...this.participantsId, userId];
    this.lastUpdatedAt = now;
    return this;
  }

  public removeParticipant(
    userId: UserEntity["id"],
    now: Date
  ): ThreadEntity | InvalidThreadAccessError {
    if (this.isClose) return new ThreadClosedError(this.id);
    if (this.administratorId === userId) {
      return new AdministratorCannotLeaveThreadError(this.id, userId);
    }
    if (!this.isParticipant(userId))
      return new InvalidThreadAccessError(userId, this.id);
    const index = this.participantsId.indexOf(userId);
    this.participantsId.splice(index, 1);
    this.lastUpdatedAt = now;

    return this;
  }

  public updateTitle(
    newTitle: string,
    now: Date
  ): ThreadEntity | InvalidTitleError | ThreadClosedError {
    if (this.isClose) return new ThreadClosedError(this.id);
    if (newTitle.trim().length < 3) return new InvalidTitleError(newTitle);

    this.title = newTitle.trim();
    this.lastUpdatedAt = now;
    return this;
  }
}
