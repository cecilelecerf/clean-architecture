import { createServer } from "http";
import { Server } from "socket.io";
import { PostWithTagsAndUser } from "@application/ports/repositories/PostRepository";
import {
  MessageId,
  MessageWithUserDTO,
  ThreadId,
} from "@infrastructure/types/thread";
import { UserId } from "@infrastructure/types/user";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("✅ Client connecté :", socket.id);

  socket.on("thread:join", ({ threadId }) => {
    console.log(`${socket.id}  rejoint la thread ${threadId}`);
    socket.join(threadId);
  });

  socket.on("thread:leave", ({ threadId }) => {
    console.log(`${socket.id} quitte la thread ${threadId}`);
    socket.leave(threadId);
  });
  socket.on(
    "thread:new_message",
    ({ message }: { message: MessageWithUserDTO }) => {
      io.to(message.threadId).emit(
        `thread:${message.threadId}:new_message`,
        message,
      );
    },
  );

  socket.on(
    "thread:messages_marked_read",
    ({
      threadId,
      messageIds,
      userId,
      readAt,
    }: {
      threadId: ThreadId;
      messageIds: MessageId[];
      userId: UserId;
      readAt: string;
    }) => {
      io.emit(`thread:${threadId}:messages_read`, {
        messageIds,
        userId,
        readAt,
      });
    },
  );
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on http://localhost:${PORT}`);
});
