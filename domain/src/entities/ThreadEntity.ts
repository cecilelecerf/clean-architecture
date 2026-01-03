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

  private static validateTitle(title: string): string | InvalidTitleError {
    const trimmed = title.trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
      return new InvalidTitleError(title, trimmed.length);
    }
    return trimmed;
  }

  private static validateType(
    type: string
  ): "external" | "internal" | InvalidThreadTypeError {
    if (type !== "external" && type !== "internal") {
      return new InvalidThreadTypeError("unknown", type, [
        "external",
        "internal",
      ]);
    }
    return type;
  }

  public static create({
    id,
    participantsId,
    administratorId,
    title,
    createdAt,
    type,
  }: Pick<
    ThreadEntity,
    "id" | "administratorId" | "createdAt" | "participantsId" | "title" | "type"
  >): ThreadEntity | InvalidTitleError | InvalidThreadTypeError {
    const validatedTitle = this.validateTitle(title);
    if (validatedTitle instanceof Error) return validatedTitle;

    const validatedType = this.validateType(type);
    if (validatedType instanceof Error) return validatedType;

    return new ThreadEntity(
      id,
      participantsId,
      validatedTitle,
      createdAt,
      false,
      validatedType,
      administratorId,
      createdAt
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
    | InvalidThreadAccessError
    | InvalidThreadTypeError {
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

    if (this.type === "internal") {
      const removeResult = this.removeParticipant(newAdministratorId, now);
      if (removeResult instanceof Error) return removeResult;

      this.administratorId = newAdministratorId;

      const addResult = this.addParticipant(formerAdministratorId, now);
      if (addResult instanceof Error) {
        this.administratorId = formerAdministratorId;
        return addResult;
      }
    } else if (this.type === "external") {
      this.administratorId = newAdministratorId;
    } else {
      return new InvalidThreadTypeError(this.id, this.type, [
        "external",
        "internal",
      ]);
    }

    this.updatedAt = now;
    return this;
  }

  public close(now: Date): void {
    this.updatedAt = now;
    this.isClose = true;
  }
  public isParticipant(userId: UserEntity["id"]): boolean {
    if (!this.participantsId) return false;
    return this.participantsId.includes(userId);
  }

  public isAdministrator(userId: UserEntity["id"]): boolean {
    return this.administratorId === userId;
  }

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
      return new InvalidThreadTypeError(this.id, this.type, ["external"]);
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
