import { UserEntity } from "./UserEntity";

export class ThreadEntity {
  private constructor(
    public id: string,
    public clientId: UserEntity["id"],
    public advisorId: UserEntity["id"],
    public title: string,
    public createdAt: Date,
    public lastUpdatedAt: Date,
    public isClose: boolean
  ) {}

  public static from({
    id,
    clientId,
    advisorId,
    title,
    createdAt,
    lastUpdatedAt,
    isClose,
  }: ThreadEntity) {
    return new ThreadEntity(
      id,
      clientId,
      advisorId,
      title,
      createdAt,
      lastUpdatedAt,
      isClose
    );
  }

  public transferTo(newAdvisorId: UserEntity["id"]): void {
    if (this.advisorId === newAdvisorId) return;
    this.advisorId = newAdvisorId;
    this.lastUpdatedAt = new Date();
  }

  // Met à jour la date de dernier message / activité
  public touch(): void {
    this.lastUpdatedAt = new Date();
  }

  public close(): void {
    this.isClose = true;
  }
}
