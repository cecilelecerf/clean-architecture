import { UserEntity } from "./UserEntity";

export class NotificationEntity {
  private constructor(
    public id: string,
    public advisorId: UserEntity["id"],
    public clientId: UserEntity["id"],
    public title: string,
    public content: string,
    public isRead: boolean = false,
    public type: "info" | "alert" | "reminder",
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  public static from({
    id,
    advisorId,
    clientId,
    title,
    content,
    isRead,
    type,
    createdAt,
    updatedAt,
  }: Pick<
    NotificationEntity,
    | "id"
    | "advisorId"
    | "clientId"
    | "title"
    | "content"
    | "isRead"
    | "type"
    | "createdAt"
    | "updatedAt"
  >) {
    return new NotificationEntity(
      id,
      advisorId,
      clientId,
      title,
      content,
      isRead,
      type,
      createdAt,
      updatedAt
    );
  }

  /** Marquer la notification comme lue */
  public markAsRead(): void {
    this.isRead = true;
  }

  /** Modifier le contenu (ex: si le conseiller met à jour le message) */
  public updateContent(title: string, content: string): void {
    this.title = title;
    this.content = content;
  }
}
