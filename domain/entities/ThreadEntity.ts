import { UserEntity } from "./UserEntity";

export class ThreadEntity {
  private constructor(
    public id: string,
    public participantsId: UserEntity["id"][],
    public administratorId: UserEntity["id"],
    public title: string,
    public createdAt: Date,
    public lastUpdatedAt: Date,
    public isClose: boolean,
    public type: "external" | "internal"
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
      participantsId,
      administratorId,
      title,
      createdAt,
      lastUpdatedAt,
      isClose,
      type
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
}
