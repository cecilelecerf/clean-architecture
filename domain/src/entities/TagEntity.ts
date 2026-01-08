import { InvalidTagLabelError } from "@domain/errors/tag";
import { Color } from "@domain/values/Color";

export type TagDTO = {
  color: string;
  createdAt: string;
  updatedAt: string;
} & Pick<TagEntity, "id" | "label">;

export type TagClientDTO = Pick<TagDTO, "id" | "color" | "label">;
export class TagEntity {
  private constructor(
    public id: string,
    public label: string,
    public color: Color,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  private static validateLabel(label: string): string | InvalidTagLabelError {
    const trimmed = label.trim();

    if (trimmed.length < 2 || trimmed.length > 50) {
      return new InvalidTagLabelError(label, trimmed.length);
    }

    return trimmed;
  }

  public static create({
    id,
    label,
    color,
    createdAt,
  }: Pick<TagEntity, "id" | "label" | "color" | "createdAt">):
    | TagEntity
    | InvalidTagLabelError {
    const validatedLabel = this.validateLabel(label);
    if (validatedLabel instanceof Error) return validatedLabel;

    return new TagEntity(id, validatedLabel, color, createdAt, createdAt);
  }

  public static from({
    id,
    label,
    color,
    createdAt,
    updatedAt,
  }: Pick<TagEntity, "id" | "label" | "color" | "createdAt" | "updatedAt">) {
    return new TagEntity(id, label, color, createdAt, updatedAt);
  }

  public rename({ newLabel, now }: { newLabel: string; now: Date }): void {
    this.label = newLabel;
    this.updatedAt = now;
  }

  public changeColor({
    newColor,
    now,
  }: {
    newColor: TagEntity["color"];
    now: Date;
  }): void {
    this.color = newColor;
    this.updatedAt = now;
  }
  public toClientDTO(): TagClientDTO {
    return { id: this.id, label: this.label, color: this.color.getValue() };
  }
  public toDTO(): TagDTO {
    return {
      id: this.id,
      label: this.label,
      color: this.color.getValue(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
