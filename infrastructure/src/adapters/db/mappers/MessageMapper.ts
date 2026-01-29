import { CreditEntity } from "@domain/entities/CreditEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { MessageEntity } from "domain/entities/MessageEntity";
import { RowDataPacket } from "mysql2";

export class MessageMapper {
  static mapRowToMessage(
    row: RowDataPacket,
    prefix: string = "",
  ): MessageEntity {
    const readerIds = row.reader_ids
      ? row.reader_ids.split(",").filter(Boolean)
      : [];

    const readBy =
      readerIds.length > 0
        ? [...new Set([row[`${prefix}sender_id`], ...readerIds])]
        : [row[`${prefix}sender_id`]];

    return MessageEntity.from({
      id: row[`${prefix}id`],
      threadId: row[`${prefix}thread_id`],
      senderId: row[`${prefix}sender_id`],
      content: row[`${prefix}content`],
      sentAt: new Date(row[`${prefix}sent_at`]),
      readBy: readBy,
    });
  }

  static mapDocToMessage(doc: any): MessageEntity {
    return MessageEntity.from({
      id: doc._id.toString(),
      threadId: doc.threadId?.toString() || doc.threadId,
      senderId:
        typeof doc.senderId === "string"
          ? doc.senderId?.toString()
          : doc.senderId._id,
      content: doc.content,
      sentAt: doc.sentAt,
      readBy: doc.readBy || [],
    });
  }
}
