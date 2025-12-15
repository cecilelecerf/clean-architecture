import { ThreadEntityWithUsers, ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { MongoClient } from "../../MongoClient";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { ThreadModel } from "../models/ThreadModel";

// TODO: faire les functions
export class ThreadRepositoryMongo implements ThreadRepository {
    constructor(private readonly client: MongoClient) {}

    async save(thread: ThreadEntity): Promise<void> {
        await this.client.connect();
                                                      
        await ThreadModel.create({
            participantsId: thread.participantsId,
            title: thread.title,
            createdAt: thread.createdAt,
            isClose: thread.isClose,
            type: thread.type,
            administratorId: thread.administratorId
        } as any);
    }

    async update(thread: ThreadEntity): Promise<void> {}

    async delete(threadId: ThreadEntity["id"]): Promise<void> {}

    async findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null> {}

    async findAllByParticipantId(
        userId: UserEntity["id"]
    ): Promise<ThreadEntity[]> {}

    async findAllByAdministratorId(
        advisorId: UserEntity["id"]
    ): Promise<ThreadEntity[]> {}

    async findAllExternalThreadWithUserByUserId(
        participantId: string
    ): Promise<ThreadEntityWithUsers[]> {}

    async findWithUserById(
        threadId: string
    ): Promise<ThreadEntityWithUsers | null> {}

    async findAllWithUserByAdministratorId(
        administratorId: UserEntity["id"]
    ): Promise<ThreadEntityWithUsers[]> {}

    async findAllWithUserByAdministratorNullable(): Promise<ThreadEntityWithUsers[]> {}
}