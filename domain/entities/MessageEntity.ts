import { ContentEmptyError } from "@domain/errors/message/ContentEmptyError";
import { ThreadEntity } from "./ThreadEntity";
import { UserEntity } from "./UserEntity";

export class MessageEntity {
  private constructor(
    public id: string,
    public threadId: ThreadEntity["id"],
    public senderId: UserEntity["id"],
    public content: string,
    public sentAt: Date,
    public readBy: UserEntity["id"][]
  ) {}

  public static from({
    id,
    threadId,
    senderId,
    content,
    sentAt,
    readBy,
  }: Pick<
    MessageEntity,
    "id" | "threadId" | "senderId" | "content" | "sentAt" | "readBy"
  >) {
    return new MessageEntity(id, threadId, senderId, content, sentAt, readBy);
  }

  public userRead(userId: UserEntity["id"]): void {
    this.readBy = [...this.readBy, userId];
  }
  public isUnread(userId: UserEntity["id"]): boolean {
    return this.readBy.includes(userId);
  }
  public isSentBy(userId: string): boolean {
    return this.senderId === userId;
  }
  public validateContent(): void | ContentEmptyError {
    if (!this.content || this.content.trim() === "") {
      return new ContentEmptyError();
    }
  }
}
