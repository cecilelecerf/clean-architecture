import {
  ThreadEntityWithUsers,
  ThreadEntityWithUsersAndLastMessage,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { MongoClient } from "../../MongoClient";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { ThreadModel } from "../models/ThreadModel";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserMapper } from "../../mappers/UserMapper";
import { MessageMapper } from "../../mappers/MessageMapper";
import { Types } from "mongoose";

export class ThreadRepositoryMongo implements ThreadRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToThread(doc: any): ThreadEntity {
    return ThreadEntity.from({
      id: doc._id.toString(),
      administratorId: doc.administratorId
        ? doc.administratorId.toString()
        : undefined,
      participantsId: doc.participantsId.map((participant: Types.UUID) =>
        participant.toString(),
      ),
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isClose: !!doc.isClose,
      type: doc.type,
    });
  }

  private mapThreadWithUsers(doc: any): ThreadEntityWithUsers {
    const administrator = doc.administratorId?._id
      ? UserMapper.mapDocToUser(doc.administratorId)
      : null;

    const participants: UserEntity[] = (doc.participantsId || [])
      .filter((p: any) => p?._id)
      .map((p: any) => UserMapper.mapDocToUser(p));

    const thread = ThreadEntity.from({
      id: doc._id.toString(),
      administratorId: doc.administratorId?._id?.toString() || null,
      participantsId: participants.map((p) => p.id.toString()),
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isClose: doc.isClose,
      type: doc.type,
    }) as ThreadEntityWithUsers;

    return Object.assign(thread, { administrator, participants });
  }

  private mapThreadWithUsersAndLastMessage(
    doc: any,
  ): ThreadEntityWithUsersAndLastMessage {
    const administrator = doc.administratorId?._id
      ? UserMapper.mapDocToUser(doc.administratorId)
      : null;

    const participants: UserEntity[] = (doc.participantsId || [])
      .filter((p: any) => p?._id)
      .map((p: any) => UserMapper.mapDocToUser(p));

    const thread = ThreadEntity.from({
      id: doc._id.toString(),
      administratorId: doc.administratorId?._id?.toString() || null,
      participantsId: participants.map((p) => p.id.toString()),
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isClose: doc.isClose,
      type: doc.type,
    }) as ThreadEntityWithUsersAndLastMessage;

    const lastMessage = doc.lastMessage
      ? MessageMapper.mapDocToMessage(doc.lastMessage)
      : null;

    return Object.assign(thread, { administrator, participants, lastMessage });
  }

  async save(thread: ThreadEntity): Promise<void> {
    await this.client.connect();

    await ThreadModel.create({
      _id: thread.id,
      participantsId: thread.participantsId,
      title: thread.title,
      createdAt: thread.createdAt,
      isClose: thread.isClose,
      type: thread.type,
      administratorId: thread.administratorId,
      updatedAt: thread.updatedAt,
    });
  }

  async update(thread: ThreadEntity): Promise<void> {
    await this.client.connect();

    await ThreadModel.findByIdAndUpdate(
      thread.id,
      {
        $set: {
          participantsId: thread.participantsId,
          title: thread.title,
          isClose: thread.isClose,
          type: thread.type,
          updatedAt: thread.updatedAt,
          administratorId: thread.administratorId,
        },
      },
      { new: false, runValidators: true },
    );
  }

  async findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null> {
    await this.client.connect();

    const doc = await ThreadModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToThread(doc);
  }

  async findAllWithUserAndLastMessageByParticipantIdAndType(
    participantId: string,
    type?: ThreadEntity["type"],
  ): Promise<ThreadEntityWithUsersAndLastMessage[]> {
    await this.client.connect();

    const matchStage: any = {
      participantsId: participantId,
    };

    if (type) {
      matchStage.type = type;
    }

    const docs = await ThreadModel.aggregate([
      // Stage 1 : Match threads par participant et type
      { $match: matchStage },

      // Stage 2 : Lookup administrator
      {
        $lookup: {
          from: "users",
          localField: "administratorId",
          foreignField: "_id",
          as: "administratorId",
        },
      },
      {
        $unwind: {
          path: "$administratorId",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 3 : Lookup participants
      {
        $lookup: {
          from: "users",
          localField: "participantsId",
          foreignField: "_id",
          as: "participantsId",
        },
      },

      // Stage 4 : Lookup dernier message
      {
        $lookup: {
          from: "messages",
          let: { threadId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$threadId", "$$threadId"] } } },
            { $sort: { sentAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 5 : Sort
      { $sort: { updatedAt: -1, createdAt: -1 } },
    ]);

    return docs.map((doc) => this.mapThreadWithUsersAndLastMessage(doc));
  }

  async findWithUserById(
    threadId: string,
  ): Promise<ThreadEntityWithUsers | null> {
    await this.client.connect();

    const docs = await ThreadModel.aggregate([
      // Stage 1 : Match par ID
      { $match: { _id: threadId } },

      // Stage 2 : Lookup administrator
      {
        $lookup: {
          from: "users",
          localField: "administratorId",
          foreignField: "_id",
          as: "administratorId",
        },
      },
      {
        $unwind: {
          path: "$administratorId",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 3 : Lookup participants (pas de filtre ici)
      {
        $lookup: {
          from: "users",
          localField: "participantsId",
          foreignField: "_id",
          as: "participantsId",
        },
      },
    ]);

    if (!docs.length) return null;

    return this.mapThreadWithUsers(docs[0]);
  }

  async findAllWithUserAndLastMessageByAdministratorIdAndType(
    administratorId: UserEntity["id"],
    type?: ThreadEntity["type"],
  ): Promise<ThreadEntityWithUsersAndLastMessage[]> {
    await this.client.connect();

    const matchStage: any = { administratorId };

    if (type) {
      matchStage.type = type;
    }

    const docs = await ThreadModel.aggregate([
      // Stage 1 : Match par administratorId et type
      { $match: matchStage },

      // Stage 2 : Lookup administrator
      {
        $lookup: {
          from: "users",
          localField: "administratorId",
          foreignField: "_id",
          as: "administratorId",
        },
      },
      { $unwind: "$administratorId" },

      // Stage 3 : Lookup participants filtrés (isActive + confirmedAt)
      {
        $lookup: {
          from: "users",
          let: { participantIds: "$participantsId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$participantIds"] },
                isActive: true,
                confirmedAt: { $ne: null },
              },
            },
          ],
          as: "participantsId",
        },
      },

      // Stage 4 : Lookup dernier message
      {
        $lookup: {
          from: "messages",
          let: { threadId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$threadId", "$$threadId"] } } },
            { $sort: { sentAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 5 : Sort
      { $sort: { updatedAt: -1, createdAt: -1 } },
    ]);

    return docs.map((doc) => this.mapThreadWithUsersAndLastMessage(doc));
  }

  async findAllWithUserAndLastMessageByAdministratorNullable(): Promise<
    ThreadEntityWithUsersAndLastMessage[]
  > {
    await this.client.connect();

    const docs = await ThreadModel.aggregate([
      // Stage 1 : Match administratorId null
      { $match: { administratorId: null } },

      // Stage 2 : Lookup participants filtrés (isActive + confirmedAt)
      {
        $lookup: {
          from: "users",
          let: { participantIds: "$participantsId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$participantIds"] },
                isActive: true,
                confirmedAt: { $ne: null },
              },
            },
          ],
          as: "participantsId",
        },
      },

      // Stage 3 : Lookup dernier message
      {
        $lookup: {
          from: "messages",
          let: { threadId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$threadId", "$$threadId"] } } },
            { $sort: { sentAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 4 : Sort
      { $sort: { updatedAt: -1, createdAt: -1 } },
    ]);

    return docs.map((doc) => this.mapThreadWithUsersAndLastMessage(doc));
  }

  async countByAdvisor(advisorId: UserEntity["id"]): Promise<number> {
    await this.client.connect();

    return await ThreadModel.countDocuments({
      administratorId: advisorId,
    });
  }
}
