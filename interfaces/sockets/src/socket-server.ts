import { createServer } from "http";
import { Message } from "infrastructure/src/types/message";
import { Server } from "socket.io";

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
  socket.on("thread:new_message", ({ message }: { message: Message }) => {
    console.log(message);
    console.log("au revoir");
    console.log("on new message");
    io.emit("test");
    io.to(message.threadId).emit(
      `thread:${message.threadId}:new_message`,
      message
    );
  });

  socket.on("notification:new", ({ title, content }) => {
    console.log(`Nouvelle notification: ${title} - ${content}`);
    io.emit("notification:new", { title, content });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on http://localhost:${PORT}`);
});
