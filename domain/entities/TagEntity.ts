export class TagEntity {
  private constructor(
    public id: string,
    public label: string,
    public color: "blue" | "red" | "pink" | "yellow",
    public createdAt: Date,
    public modifiedAt?: Date
  ) {}

  public static from({
    id,
    label,
    color,
    createdAt,
    modifiedAt,
  }: Pick<TagEntity, "id" | "label" | "color" | "createdAt" | "modifiedAt">) {
    return new TagEntity(id, label, color, createdAt, modifiedAt);
  }

  public rename(newLabel: string): void {
    this.label = newLabel;
    this.modifiedAt = new Date();
  }

  public changeColor(newColor: TagEntity["color"]): void {
    this.color = newColor;
    this.modifiedAt = new Date();
  }
}
