import { ThreadEntity } from "./ThreadEntity";
// import { UserEntity } from "./UserEntity";

export class MessageEntity {
  private constructor(
    public id: string,
    public threadId: ThreadEntity["id"],
    // public senderId: UserEntity["id"],
    public content: string,
    public sentAt: Date
  ) {}

  //TODO: Ajouter senderId
  public static from({ id, threadId, content, sentAt}: { id: string, threadId: ThreadEntity["id"], content: string, sentAt: Date }) {
    return new MessageEntity(
      id,
      threadId,
      content,
      sentAt
    );
  }
}