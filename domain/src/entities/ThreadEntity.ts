import {
  AdministratorCannotLeaveThreadError,
  InvalidThreadAccessError,
  InvalidTitleError,
  ThreadAlreadyHasAdvisorError,
  ThreadClosedError,
  ThreadNotActiveError,
  ThreadParticipantAlreadyExistError,
  ThreadTransferToSameAdministratorError,
} from "@domain/errors/thread";
import { UserEntity } from "./UserEntity";
import { InvalidThreadTypeError } from "@domain/errors/thread";

export class ThreadEntity {
  private constructor(
    public id: string,
    public participantsId: UserEntity["id"][],
    public title: string,
    public createdAt: Date,
    public isClose: boolean,
    public type: "external" | "internal",
    public administratorId: UserEntity["id"] | null,
    public updatedAt: Date
  ) {}

  public static create({
    id,
    participantsId,
    administratorId,
    title,
    createdAt,
    updatedAt,
    isClose,
    type,
  }: Pick<
    ThreadEntity,
    | "id"
    | "administratorId"
    | "createdAt"
    | "updatedAt"
    | "participantsId"
    | "title"
    | "isClose"
    | "type"
  >): ThreadEntity | InvalidTitleError {
    const verifiedTitle = this.validateTitle(title);
    if (verifiedTitle instanceof Error) return verifiedTitle;
    return new ThreadEntity(
      id,
      participantsId,
      verifiedTitle,
      createdAt,
      isClose,
      type,
      administratorId,
      updatedAt
    );
  }

  public static from({
    id,
    participantsId,
    administratorId,
    title,
    createdAt,
    updatedAt,
    isClose,
    type,
  }: Pick<
    ThreadEntity,
    | "id"
    | "administratorId"
    | "createdAt"
    | "updatedAt"
    | "participantsId"
    | "title"
    | "isClose"
    | "type"
  >) {
    return new ThreadEntity(
      id,
      participantsId,
      title,
      createdAt,
      isClose,
      type,
      administratorId,
      updatedAt
    );
  }

  public transferTo(
    newAdministratorId: UserEntity["id"],
    now: Date
  ):
    | ThreadEntity
    | ThreadClosedError
    | ThreadTransferToSameAdministratorError
    | InvalidThreadAccessError {
    if (this.isClose) return new ThreadClosedError(this.id);
    if (!this.administratorId)
      return new InvalidThreadAccessError(null, this.id);
    if (this.administratorId === newAdministratorId) {
      return new ThreadTransferToSameAdministratorError(
        this.id,
        this.administratorId
      );
    }

    const formerAdministratorId = this.administratorId;

    const removeResult = this.removeParticipant(newAdministratorId, now);
    if (removeResult instanceof Error) return removeResult;

    this.administratorId = newAdministratorId;

    const addResult = this.addParticipant(formerAdministratorId, now);
    if (addResult instanceof Error) {
      this.administratorId = formerAdministratorId;
      return addResult;
    }

    this.updatedAt = now;
    return this;
  }

  public close(now: Date): void {
    this.updatedAt = now;
    this.isClose = true;
  }
  /** Vérifie si un utilisateur est participant du thread */
  public isParticipant(userId: UserEntity["id"]): boolean {
    if (!this.participantsId) return false;
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
    this.participantsId.push(userId);
    this.updatedAt = now;
    return this;
  }

  public removeParticipant(
    userId: UserEntity["id"],
    now: Date
  ): ThreadEntity | InvalidThreadAccessError | ThreadClosedError {
    if (this.isClose) return new ThreadClosedError(this.id);
    if (this.administratorId === userId) {
      return new AdministratorCannotLeaveThreadError(this.id, userId);
    }
    if (!this.isParticipant(userId))
      return new InvalidThreadAccessError(userId, this.id);
    const index = this.participantsId.indexOf(userId);
    this.participantsId.splice(index, 1);
    this.updatedAt = now;

    return this;
  }

  public static validateTitle(
    newTitle: ThreadEntity["title"]
  ): InvalidTitleError | ThreadEntity["title"] {
    const trimedTitle = newTitle.trim();
    if (trimedTitle.length < 3 || trimedTitle.length > 50)
      return new InvalidTitleError(newTitle);
    return trimedTitle;
  }

  public updateTitle(
    newTitle: string,
    now: Date
  ): ThreadEntity | InvalidTitleError | ThreadClosedError {
    if (this.isClose) return new ThreadClosedError(this.id);
    const validatedTitle = ThreadEntity.validateTitle(newTitle);
    if (validatedTitle instanceof Error) return validatedTitle;
    this.title = validatedTitle;

    this.updatedAt = now;
    return this;
  }
  private hasAdministrator(): boolean {
    return !!this.administratorId;
  }
  private ensureCanAssignAdvisorInExternal():
    | ThreadNotActiveError
    | ThreadAlreadyHasAdvisorError
    | InvalidThreadTypeError
    | void {
    if (this.isClose) {
      return new ThreadNotActiveError("Le thread n'est plus actif.");
    }

    if (this.hasAdministrator()) {
      return new ThreadAlreadyHasAdvisorError(
        "Ce thread a déjà un conseiller."
      );
    }
    if (this.type !== "external")
      return new InvalidThreadTypeError(this.id, this.type, "external");
  }

  public assignAdvisor(
    userId: UserEntity["id"]
  ): ThreadNotActiveError | ThreadAlreadyHasAdvisorError | void {
    const error = this.ensureCanAssignAdvisorInExternal();
    if (error instanceof Error) return error;
    this.administratorId = userId;
  }

  toDTO(): ThreadDTO {
    return {
      id: this.id,
      participantsId: this.participantsId,
      title: this.title,
      isClose: this.isClose,
      type: this.type,
      administratorId: this.administratorId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export type ThreadDTO = { createdAt: string; updatedAt: string } & Pick<
  ThreadEntity,
  "id" | "participantsId" | "title" | "isClose" | "type" | "administratorId"
>;
