import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { MessageRepositoryMongo } from "../repositories/MessageRepositoryMongo";
import { ThreadRepositoryMongo } from "../repositories/ThreadRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { StartExternalThreadUsecase } from "@application/usecases/threads/clients/StartExternalThreadUsecase";
import { AddParticipantUsecase } from "application/src/usecases/threads/AddParticipantUsecase";
import { AdvisorGetAllThreadUsecase } from "@application/usecases/threads/administrators/advisors/AdvisorGetAllThreadUsecase";
import { AdvisorGetAllThreadByClientUsecase } from "@application/usecases/threads/administrators/advisors/AdvisorGetAllThreadByClientUsecase";
import { ClientGetAllThreadUsecase } from "@application/usecases/threads/clients/ClientGetAllThreadUsecase";
import { CloseThreadUsecase } from "@application/usecases/threads/CloseThreadUsecase";
import { FindThreadWithUserUsecase } from "@application/usecases/threads/administrators/advisors/FindThreadWithUserUsecase";
import { LeaveThreadUsecase } from "@application/usecases/threads/LeaveThreadUsecase";
import { RemoveParticipantUsecase } from "@application/usecases/threads/administrators/RemoveParticipantUsecase";
import { StartInternalThreadUsecase } from "@application/usecases/threads/administrators/directors/StartInternalThreadUsecase";
import { TransferThreadUsecase } from "@application/usecases/threads/administrators/TransferThreadUsecase";
import { UpdateThreadTitleUsecase } from "@application/usecases/threads/administrators/UpdateThreadTitleUsecase";
import { AdvisorJoinExternalThread } from "@application/usecases/threads/administrators/advisors/AdvisorJoinExternalThread";

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
