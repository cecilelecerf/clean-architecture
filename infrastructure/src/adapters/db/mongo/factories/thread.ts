import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { MessageRepositoryMongo } from "../repositories/MessageRepositoryMongo";
import { ThreadRepositoryMongo } from "../repositories/ThreadRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { LeaveThreadUsecase } from "@application/usecases/threads/LeaveThreadUsecase";
import { StartExternalThreadUsecase } from "@application/usecases/threads/StartExternalThreadUsecase";
import { AddParticipantUsecase } from "@application/usecases/threads/admin/AddParticipantUsecase";
import { CloseThreadUsecase } from "@application/usecases/threads/admin/CloseThreadUsecase";
import { RemoveParticipantUsecase } from "@application/usecases/threads/admin/RemoveParticipantUsecase";
import { StartInternalThreadUsecase } from "@application/usecases/threads/StartInternalThreadUsecase";
import { TransferThreadUsecase } from "@application/usecases/threads/admin/TransferThreadUsecase";
import { UpdateThreadTitleUsecase } from "@application/usecases/threads/admin/UpdateThreadTitleUsecase";
import { GetAdvisorThreadsUsecase } from "@application/usecases/threads/GetAdvisorThreadsUsecase";
import { AdminJoinThreadUsecase } from "@application/usecases/threads/admin/AdminJoinThreadUsecase";
import { GetThreadsByUserAndTypeUsecase } from "@application/usecases/threads/GetThreadsByUserAndTypeUsecase";
import { GetThreadByIdUsecase } from "@application/usecases/threads/GetThreadByIdUsecase";

export const threadsFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const threadRepository = new ThreadRepositoryMongo(client);
  const messageRepository = new MessageRepositoryMongo(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const startExternalThread = new StartExternalThreadUsecase(
    threadRepository,
    userRepository,
    messageRepository,
    uuidService,
    clockService
  );

  const startInternalThread = new StartInternalThreadUsecase(
    threadRepository,
    userRepository,
    uuidService,
    clockService
  );
  const addParticipant = new AddParticipantUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const advisorGetAllThread = new GetAdvisorThreadsUsecase(
    threadRepository,
    userRepository
  );
  const getThreadsByUserAndTypeUsecase = new GetThreadsByUserAndTypeUsecase(
    threadRepository,
    userRepository
  );
  const getThreadById = new GetThreadByIdUsecase(
    threadRepository,
    userRepository
  );
  const closeThread = new CloseThreadUsecase(
    userRepository,
    threadRepository,
    clockService
  );

  const leaveThread = new LeaveThreadUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const removeParticipant = new RemoveParticipantUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const transferThread = new TransferThreadUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const updateThreadTitle = new UpdateThreadTitleUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const adminJoinThread = new AdminJoinThreadUsecase(
    threadRepository,
    userRepository
  );

  return {
    startExternalThread,
    addParticipant,
    advisorGetAllThread,
    closeThread,
    getThreadsByUserAndTypeUsecase,
    leaveThread,
    removeParticipant,
    startInternalThread,
    transferThread,
    updateThreadTitle,
    adminJoinThread,
    getThreadById,
  };
};
