import { ContentEmptyError, ContentTooLongError } from "@domain/errors/message";
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

  private static validateContent(
    content: string
  ): string | ContentEmptyError | ContentTooLongError {
    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return new ContentEmptyError();
    }

    const maxLength = 5000;
    if (trimmed.length > maxLength) {
      return new ContentTooLongError(trimmed.length, maxLength);
    }

    return trimmed;
  }

  public static create({
    id,
    threadId,
    senderId,
    content,
    sentAt,
  }: Pick<
    MessageEntity,
    "id" | "threadId" | "senderId" | "content" | "sentAt"
  >): MessageEntity | ContentEmptyError | ContentTooLongError {
    const validatedContent = this.validateContent(content);
    if (validatedContent instanceof Error) return validatedContent;

    return new MessageEntity(id, threadId, senderId, validatedContent, sentAt, [
      senderId,
    ]);
  }

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
