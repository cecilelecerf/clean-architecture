import { Color } from "@domain/values/Color";

export type TagDTO = { color: string } & Pick<
  TagEntity,
  "id" | "label" | "updatedAt" | "createdAt"
>;

export type TagClientDTO = Pick<TagDTO, "id" | "color" | "label">;
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
  public toClientDTO(): TagClientDTO {
    return { id: this.id, label: this.label, color: this.color.getValue() };
  }
  public toDTO(): TagDTO {
    return {
      id: this.id,
      label: this.label,
      color: this.color.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
