export class ThreadEntity {
  private constructor(
    public id: string,
    public participants: [],
    public createdAt: Date,
    public lastUpdatedAt: Date
  ) {}

  public static from({ id, participants, createdAt, lastUpdatedAt}: ThreadEntity) {
    return new ThreadEntity(
      id,
      participants,
      createdAt,
      lastUpdatedAt
    );
  }
}