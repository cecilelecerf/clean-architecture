import { ThreadEntityWithUsers, ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { MongoClient } from "../../MongoClient";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { ThreadModel } from "../models/ThreadModel";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserModel } from "../models/UserModel";

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

    async update(thread: ThreadEntity): Promise<void> {
        await this.client.connect();
        
        await ThreadModel.updateOne(
            { _id: thread.id },
            {
                $set: {
                    participantsId: thread.participantsId,
                    title: thread.title,
                    isClose: thread.isClose,
                    type: thread.type,
                    updatedAt: thread.updatedAt || new Date(),
                },
            }
        );

        const existingDoc = await ThreadModel.findById(thread.id).lean();
        if (!existingDoc) return;

        const existingParticipantIds: string[] = existingDoc.participantsId || [];

        const participantsToAdd = thread.participantsId.filter(
            (id) => !existingParticipantIds.includes(id)
        );
        if (participantsToAdd.length > 0) {
            await ThreadModel.updateOne(
            { _id: thread.id },
            { $addToSet: { participantsId: { $each: participantsToAdd } } }
            );
        }

        const participantsToRemove = existingParticipantIds.filter(
            (id) => !thread.participantsId.includes(id)
        );
        if (participantsToRemove.length > 0) {
            await ThreadModel.updateOne(
            { _id: thread.id },
            { $pull: { participantsId: { $in: participantsToRemove } } }
            );
        }
    }

    async delete(threadId: ThreadEntity["id"]): Promise<void> {
        await this.client.connect();
                                
        await ThreadModel.deleteOne({ _id: threadId });
    }

    async findById(id: ThreadEntity["id"]): Promise<ThreadEntity | null> {
        await this.client.connect();
                        
        const doc = await ThreadModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        return ThreadEntity.from({
            id: doc._id.toString(),
            participantsId: doc.participantsId,
            title: doc.title,
            createdAt: doc.createdAt,
            isClose: doc.isClose,
            type: doc.type,
            administratorId: doc.administratorId ?? null,
            updatedAt: doc.updatedAt ?? null,
        });
    }

    async findAllByParticipantId(
        userId: UserEntity["id"]
    ): Promise<ThreadEntity[]> {
        await this.client.connect();

        const docs = await ThreadModel.find({ participantsId: userId }).lean();

        return docs.map((doc) => {
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
        })
    }

    async findAllByAdministratorId(
        advisorId: UserEntity["id"]
    ): Promise<ThreadEntity[]> {
        await this.client.connect();

        const docs = await ThreadModel.find({ administratorId: advisorId }).lean();

        return docs.map((doc) => {
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
        })
    }

    async findAllWithUserByParticipantIdAndType(
        participantId: string
    ): Promise<ThreadEntityWithUsers[]> {
        await this.client.connect();
        const threadsDocs = await ThreadModel.find({
            isClose: false,
            $or: [{ participantsId: participantId }, { administratorId: participantId }],
        })
            .sort({ updatedAt: -1, createdAt: -1 })
            .lean();
        
        if (threadsDocs.length === 0) return [];

        const userIdsSet = new Set<string>();
        threadsDocs.forEach(thread => {
            if (thread.administratorId) userIdsSet.add(thread.administratorId.toString());
            thread.participantsId?.forEach((id: string) => userIdsSet.add(id.toString()));
        });

        const userIds = Array.from(userIdsSet);
        const users = await UserModel.find({ _id: { $in: userIds } }).lean();
        const usersMap = new Map(users.map(u => [u._id.toString(), u]));

        const threads: ThreadEntityWithUsers[] = threadsDocs.map(doc => {
            const adminDoc = doc.administratorId ? usersMap.get(doc.administratorId.toString()) : null;
            const admin = adminDoc
            ? UserEntity.from({
                id: adminDoc._id.toString(),
                firstname: adminDoc.firstname,
                lastname: adminDoc.lastname,
                email: adminDoc.email,
                passwordHash: adminDoc.passwordHash,
                role: adminDoc.role,
                isActiveField: adminDoc.isActive,
                createdAt: adminDoc.createdAt,
                confirmedAt: adminDoc.confirmedAt,
                updatedAt: adminDoc.updatedAt,
                })
            : null;

            const mappedParticipants: (UserEntity | null)[] = (doc.participantsId || []).map(
            (pid: string): UserEntity | null => {
                const pDoc = usersMap.get(pid);
                if (!pDoc) return null;
                return UserEntity.from({
                id: pDoc._id.toString(),
                firstname: pDoc.firstname,
                lastname: pDoc.lastname,
                email: pDoc.email,
                passwordHash: pDoc.passwordHash,
                role: pDoc.role,
                isActiveField: pDoc.isActive,
                createdAt: pDoc.createdAt,
                confirmedAt: pDoc.confirmedAt,
                updatedAt: pDoc.updatedAt,
                });
            }
            );

            const participants: UserEntity[] = mappedParticipants.filter(
                (p): p is UserEntity => p !== null
            );

            const thread = ThreadEntity.from({
                id: doc._id.toString(),
                administratorId: doc.administratorId,
                participantsId: doc.participantsId?.map((id: string) => id.toString()) || [],
                title: doc.title,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                isClose: doc.isClose,
                type: doc.type,
            }) as ThreadEntityWithUsers;

            return Object.assign(thread, { admin, participants });
        });

        return threads;
    }

    async findWithUserById(
        threadId: string
    ): Promise<ThreadEntityWithUsers | null> {
        await this.client.connect();

        const doc = await ThreadModel.findById(threadId).lean();
        if (!doc) return null;

        const userIds: string[] = [];
        if (doc.administratorId) userIds.push(doc.administratorId.toString());
        if (doc.participantsId?.length) userIds.push(...doc.participantsId.map((id: string) => id.toString()));

        const uniqueUserIds = Array.from(new Set(userIds));

        const users = await UserModel.find({ _id: { $in: uniqueUserIds } }).lean();
        const usersMap = new Map(users.map(u => [u._id.toString(), u]));

        const adminDoc = doc.administratorId ? usersMap.get(doc.administratorId.toString()) : null;
        const administrator = adminDoc
            ? UserEntity.from({
                id: adminDoc._id.toString(),
                firstname: adminDoc.firstname,
                lastname: adminDoc.lastname,
                email: adminDoc.email,
                role: adminDoc.role,
                createdAt: adminDoc.createdAt,
                isActiveField: adminDoc.isActive,
                passwordHash: adminDoc.passwordHash,
                confirmedAt: adminDoc.confirmedAt,
                updatedAt: adminDoc.updatedAt,
            })
            : null;

        const mappedParticipants: (UserEntity | null)[] = (doc.participantsId || []).map(
            (pid: string): UserEntity | null => {
                const pDoc = usersMap.get(pid);
                if (!pDoc) return null;
                return UserEntity.from({
                id: pDoc._id.toString(),
                firstname: pDoc.firstname,
                lastname: pDoc.lastname,
                email: pDoc.email,
                passwordHash: pDoc.passwordHash,
                role: pDoc.role,
                isActiveField: pDoc.isActive,
                createdAt: pDoc.createdAt,
                confirmedAt: pDoc.confirmedAt,
                updatedAt: pDoc.updatedAt,
                });
            }
        );

        const participants: UserEntity[] = mappedParticipants.filter(
            (p): p is UserEntity => p !== null
        );

        const thread = ThreadEntity.from({
            id: doc._id.toString(),
            administratorId: doc.administratorId,
            participantsId: participants.map(p => p.id),
            title: doc.title,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            isClose: doc.isClose,
            type: doc.type,
        }) as ThreadEntityWithUsers;

        return Object.assign(thread, { administrator, participants });
    }

    async findAllWithUserByAdministratorIdAndType(
        administratorId: UserEntity["id"]
    ): Promise<ThreadEntityWithUsers[]> {
        await this.client.connect();

        const threadsDocs = await ThreadModel.find({ administratorId }).lean();
        if (threadsDocs.length === 0) return [];

        const userIdsSet = new Set<string>();
        threadsDocs.forEach(thread => {
            if (thread.administratorId) userIdsSet.add(thread.administratorId.toString());
            thread.participantsId?.forEach((pid: string) => userIdsSet.add(pid.toString()));
        });

        const userIds = Array.from(userIdsSet);
        const users = await UserModel.find({
            _id: { $in: userIds },
            isActive: true,
            confirmedAt: { $ne: null },
        }).lean();

        const usersMap = new Map(users.map(u => [u._id.toString(), u]));

        const threadsMap = new Map<string, ThreadEntityWithUsers>();

          for (const doc of threadsDocs) {
            let thread = threadsMap.get(doc._id.toString());

            if (!thread) {
            const adminDoc = doc.administratorId ? usersMap.get(doc.administratorId.toString()) : null;
            const administrator = adminDoc
                ? UserEntity.from({
                    id: adminDoc._id.toString(),
                    firstname: adminDoc.firstname,
                    lastname: adminDoc.lastname,
                    email: adminDoc.email,
                    role: adminDoc.role,
                    createdAt: adminDoc.createdAt,
                    isActiveField: adminDoc.isActive,
                    passwordHash: adminDoc.passwordHash,
                    confirmedAt: adminDoc.confirmedAt,
                    updatedAt: adminDoc.updatedAt,
                })
                : null;

            thread = ThreadEntity.from({
                id: doc._id.toString(),
                administratorId: doc.administratorId,
                participantsId: [],
                title: doc.title,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                isClose: doc.isClose,
                type: doc.type,
            }) as ThreadEntityWithUsers;

            thread.administrator = administrator;
            thread.participants = [];

            threadsMap.set(doc._id.toString(), thread);
            }

            (doc.participantsId || []).forEach((pid: string) => {
            const pDoc = usersMap.get(pid);
            if (!pDoc) return;

            const alreadyExists = thread!.participants.some(p => p.id === pid);
            if (!alreadyExists) {
                const participant = UserEntity.from({
                id: pDoc._id.toString(),
                firstname: pDoc.firstname,
                lastname: pDoc.lastname,
                email: pDoc.email,
                role: pDoc.role,
                createdAt: pDoc.createdAt,
                isActiveField: pDoc.isActive,
                passwordHash: pDoc.passwordHash,
                confirmedAt: pDoc.confirmedAt,
                updatedAt: pDoc.updatedAt,
                });
                thread!.participants.push(participant);
            }

            if (!thread!.participantsId.includes(pid)) {
                thread!.participantsId.push(pid);
            }
            });
        }

        return Array.from(threadsMap.values());

    }

    async findAllWithUserByAdministratorNullable(): Promise<ThreadEntityWithUsers[]> {
        await this.client.connect();

        const threadsDocs = await ThreadModel.find({ administratorId: null }).lean();
        if (threadsDocs.length === 0) return [];

        const userIdsSet = new Set<string>();
        threadsDocs.forEach(thread => {
            thread.participantsId?.forEach((pid: string) => userIdsSet.add(pid.toString()));
        });

        const userIds = Array.from(userIdsSet);

        const users = await UserModel.find({
            _id: { $in: userIds },
            isActive: true,
            confirmedAt: { $ne: null },
        }).lean();

        const usersMap = new Map(users.map(u => [u._id.toString(), u]));

        const threadsMap = new Map<string, ThreadEntityWithUsers>();

        for (const doc of threadsDocs) {
            let thread = threadsMap.get(doc._id.toString());

            if (!thread) {
                thread = ThreadEntity.from({
                    id: doc._id.toString(),
                    administratorId: undefined,
                    participantsId: [],
                    title: doc.title,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                    isClose: doc.isClose,
                    type: doc.type,
                }) as ThreadEntityWithUsers;

                thread.administrator = null;
                thread.participants = [];
                threadsMap.set(doc._id.toString(), thread);
            }

            (doc.participantsId || []).forEach((pid: string) => {
                const pDoc = usersMap.get(pid);
                if (!pDoc) return;

                const alreadyExists = thread!.participants.some(p => p.id === pid);
                if (!alreadyExists) {
                    const participant = UserEntity.from({
                        id: pDoc._id.toString(),
                        firstname: pDoc.firstname,
                        lastname: pDoc.lastname,
                        email: pDoc.email,
                        role: pDoc.role,
                        createdAt: pDoc.createdAt,
                        isActiveField: pDoc.isActive,
                        passwordHash: pDoc.passwordHash,
                        confirmedAt: pDoc.confirmedAt,
                        updatedAt: pDoc.updatedAt,
                    });
                    thread!.participants.push(participant);
                }

                if (!thread!.participantsId.includes(pid)) {
                    thread!.participantsId.push(pid);
                }
            });
        }

        return Array.from(threadsMap.values());
    }
}