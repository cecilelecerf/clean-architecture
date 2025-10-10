import { UserEntity } from "./UserEntity";

export class NotificationEntity {
  private constructor(
    public readonly id: string,
    public readonly advisorId: UserEntity["id"],
    public readonly clientId: UserEntity["id"],
    public title: string,
    public content: string,
    public readonly createdAt: Date,
    public isRead: boolean = false,
    public readonly type: "info" | "alert" | "reminder"
  ) {}

  public static from({
    id,
    advisorId,
    clientId,
    title,
    content,
    createdAt,
    isRead,
    type,
  }: Pick<
    NotificationEntity,
    | "id"
    | "advisorId"
    | "clientId"
    | "title"
    | "content"
    | "createdAt"
    | "isRead"
    | "type"
  >) {
    return new NotificationEntity(
      id,
      advisorId,
      clientId,
      title,
      content,
      createdAt,
      isRead,
      type
    );
  }

  /** ✅ Marquer la notification comme lue */
  public markAsRead(): void {
    this.isRead = true;
  }

  /** 🔔 Modifier le contenu (ex: si le conseiller met à jour le message) */
  public updateContent(title: string, content: string): void {
    this.title = title;
    this.content = content;
  }
}
