import { Color } from "@domain/values/Color";

export type TagToFront = Pick<TagEntity, "id" | "label" | "color">;
export class TagEntity {
  private constructor(
    public id: string,
    public label: string,
    public color: Color,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  public static from({
    id,
    label,
    color,
    createdAt,
    updatedAt,
  }: Pick<TagEntity, "id" | "label" | "color" | "createdAt" | "updatedAt">) {
    return new TagEntity(id, label, color, createdAt, updatedAt);
  }

  public rename(newLabel: string): void {
    this.label = newLabel;
    this.updatedAt = new Date();
  }

  public changeColor(newColor: TagEntity["color"]): void {
    this.color = newColor;
    this.updatedAt = new Date();
  }
  public toFront(): TagToFront {
    return { id: this.id, label: this.label, color: this.color };
  }
}
