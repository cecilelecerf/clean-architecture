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

  socket.on("post:update", ({ post }: { post: PostWithTagsAndUser }) => {
    console.log(`post:${post.id}:update`);
    io.emit(`post:${post.id}:update`, post);
  });
  socket.on("post:status", ({ post }: { post: PostWithTagsAndUser }) => {
    io.emit(`post:${post.id}:update`, post);
    io.emit(`post:status`, post);
  });

  socket.on("notification:new", ({ title, content }) => {
    console.log(`Nouvelle notification: ${title} - ${content}`);
    io.emit("notification:new", { title, content });
  });

  // (data: { messageIds: MessageId[], userId: UserId })
  socket.on(
    "thread:messages_marked_read",
    ({
      threadId,
      messageIds,
      userId,
    }: {
      threadId: ThreadId;
      messageIds: MessageId[];
      userId: UserId;
    }) => {
      console.log("------");
      console.log(`thread:${threadId}:messages_read`);
      io.emit(`thread:${threadId}:messages_read`, { messageIds, userId });
    },
  );
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on http://localhost:${PORT}`);
});
