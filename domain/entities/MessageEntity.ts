import { ThreadEntity } from "./ThreadEntity";
import { UserEntity } from "./UserEntity";

export class MessageEntity {
  private constructor(
    public id: string,
    public threadId: ThreadEntity["id"],
    public senderId: UserEntity["id"],
    public content: string,
    public sentAt: Date,
    public readAt?: Date
  ) {}

  public static from({
    id,
    threadId,
    senderId,
    content,
    sentAt,
    readAt,
  }: MessageEntity) {
    return new MessageEntity(crypto.randomUUID(), threadId, senderId, content, sentAt, readAt);
  }

  public markAsRead(): void {
    if (!this.readAt) {
      this.readAt = new Date();
    }
  }
  public isUnread(): boolean {
    return !this.readAt;
  }
  public isSentBy(userId: string): boolean {
    return this.senderId === userId;
  }
  public validateContent(): void {
    if (!this.content || this.content.trim() === "") {
      throw new Error("Message content cannot be empty");
    }
  }
}
