import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { MessageRepositoryMongo } from "../repositories/MessageRepositoryMongo";
import { ThreadRepositoryMongo } from "../repositories/ThreadRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MessageRepositoryMySQL } from "../repositories/MessageRepositoryMySQL";
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
  const addParticipant = new AddParticipantUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const advisorGetAllThread = new AdvisorGetAllThreadUsecase(
    threadRepository,
    userRepository
  );
  const advisorGetAllByClientThread = new AdvisorGetAllThreadByClientUsecase(
    threadRepository,
    userRepository
  );
  const clientGetAllThread = new ClientGetAllThreadUsecase(
    threadRepository,
    userRepository
  );
  const closeThread = new CloseThreadUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const findThreadWithUser = new FindThreadWithUserUsecase(
    threadRepository,
    userRepository
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
  const startInternalThread = new StartInternalThreadUsecase(
    threadRepository,
    userRepository,
    uuidService,
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
  const advisorJoinExternalThread = new AdvisorJoinExternalThread(
    threadRepository,
    userRepository
  );

  return {
    startExternalThread,
    addParticipant,
    advisorGetAllThread,
    clientGetAllThread,
    closeThread,
    findThreadWithUser,
    leaveThread,
    removeParticipant,
    startInternalThread,
    transferThread,
    updateThreadTitle,
    advisorJoinExternalThread,
    advisorGetAllByClientThread,
  };
};
