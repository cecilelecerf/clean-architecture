import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
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
import { GetExternalThreadsByUserUsecase } from "@application/usecases/threads/GetExternalThreadsByUserUsecase";
import { AdminJoinThreadUsecase } from "@application/usecases/threads/admin/AdminJoinThreadUsecase";
export const threadsFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const threadRepository = new ThreadRepositoryMySQL(client);
  const messageRepository = new MessageRepositoryMySQL(client);
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
  const advisorGetAllThread = new GetAdvisorThreadsUsecase(
    threadRepository,
    userRepository
  );
  const closeThread = new CloseThreadUsecase(
    userRepository,
    threadRepository,
    clockService
  );
  const getExternalByUser = new GetExternalThreadsByUserUsecase(
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
  const adminJoinThread = new AdminJoinThreadUsecase(
    threadRepository,
    userRepository
  );

  return {
    startExternalThread,
    addParticipant,
    advisorGetAllThread, 
    closeThread, 
    getExternalByUser,
    leaveThread,
    removeParticipant,
    startInternalThread,
    transferThread,
    updateThreadTitle,
    adminJoinThread, 
  };
};
