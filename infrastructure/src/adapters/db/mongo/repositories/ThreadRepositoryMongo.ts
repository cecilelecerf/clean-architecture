import {
  ThreadEntityWithUsers,
  ThreadRepository,
} from "@application/ports/repositories/ThreadRepository";
import { MongoClient } from "../../MongoClient";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { ThreadModel } from "../models/ThreadModel";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserMapper } from "../../mappers/UserMapper";

export class ThreadRepositoryMongo implements ThreadRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToThread(doc: any): ThreadEntity {
    return ThreadEntity.from({
      id: doc._id.toString(),
      administratorId: doc.administratorId,
      participantsId: doc.participantsId,
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
      participantsId: participants.map((p) => p.id),
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isClose: doc.isClose,
      type: doc.type,
    }) as ThreadEntityWithUsers;

    return Object.assign(thread, { administrator, participants });
  }

  /** Sauvegarder un thread */
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

  /** Mettre à jour un thread */
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
        },
      },
      { new: false, runValidators: true }
    );
  }

  /** Supprimer un thread */
  async delete(threadId: ThreadEntity["id"]): Promise<void> {
    await this.client.connect();

    await ThreadModel.deleteOne({ _id: threadId });
  }

  /** Trouver un thread par ID */
  async findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null> {
    await this.client.connect();

    const doc = await ThreadModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToThread(doc);
  }

  /** Tous les threads d'un participant */
  async findAllByParticipantId(
    userId: UserEntity["id"]
  ): Promise<ThreadEntity[]> {
    await this.client.connect();

    const docs = await ThreadModel.find({ participantsId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToThread(doc));
  }

  /** Tous les threads d'un administrateur */
  async findAllByAdministratorId(
    advisorId: UserEntity["id"]
  ): Promise<ThreadEntity[]> {
    await this.client.connect();

    const docs = await ThreadModel.find({ administratorId: advisorId })
      .sort({ updatedAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToThread(doc));
  }

  /** Threads avec users par participant */
  async findAllWithUserByParticipantIdAndType(
    participantId: string
  ): Promise<ThreadEntityWithUsers[]> {
    await this.client.connect();

    const threadsDocs = await ThreadModel.find({
      participantsId: participantId,
    })
      .populate("participantsId")
      .populate("administratorId")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean<any[]>();

    return threadsDocs.map((doc) => this.mapThreadWithUsers(doc));
  }

  /** Thread avec users par ID */
  async findWithUserById(
    threadId: string
  ): Promise<ThreadEntityWithUsers | null> {
    await this.client.connect();

    const doc = await ThreadModel.findById(threadId)
      .populate({ path: "administratorId" })
      .populate({
        path: "participantsId",
        match: { isActive: true, confirmedAt: { $ne: null } },
      })
      .lean<any>();

    if (!doc) return null;

    return this.mapThreadWithUsers(doc);
  }

  /** Threads avec users par administrateur et type */
  async findAllWithUserByAdministratorIdAndType(
    administratorId: UserEntity["id"],
    type: ThreadEntity["type"]
  ): Promise<ThreadEntityWithUsers[]> {
    await this.client.connect();

    const threadsDocs = await ThreadModel.find({ administratorId, type })
      .populate({ path: "administratorId" })
      .populate({
        path: "participantsId",
        match: { isActive: true, confirmedAt: { $ne: null } },
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean<any[]>();

    return threadsDocs.map((doc) => this.mapThreadWithUsers(doc));
  }

  /** Threads sans administrateur avec users */
  async findAllWithUserByAdministratorNullable(): Promise<
    ThreadEntityWithUsers[]
  > {
    await this.client.connect();

    const threadsDocs = await ThreadModel.find({ administratorId: null })
      .populate({
        path: "participantsId",
        match: { isActive: true, confirmedAt: { $ne: null } },
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean<any[]>();

    return threadsDocs.map((doc) => this.mapThreadWithUsers(doc));
  }
}
