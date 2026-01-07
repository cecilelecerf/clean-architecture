import express, { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const threadRouter: Router = express.Router();

threadRouter.get("/", authMiddleware, ThreadController.getAll);
threadRouter.get("/:id", authMiddleware, ThreadController.getById);
threadRouter.post("/", authMiddleware, ThreadController.create);
threadRouter.post("/:id/close", authMiddleware, ThreadController.close);
threadRouter.post("/:id/join", authMiddleware, ThreadController.join);
threadRouter.post("/:id/transfer", authMiddleware, ThreadController.transfer);

threadRouter.get("/:id/messages", authMiddleware, ThreadController.getMessages);
threadRouter.post(
  "/:id/messages",
  authMiddleware,
  ThreadController.sendMessage
);

threadRouter.post(
  "/:id/participants/:userId",
  authMiddleware,
  ThreadController.addParticipant
);
threadRouter.delete(
  "/:id/participants/:userId",
  authMiddleware,
  ThreadController.removeParticipant
);

threadRouter.get(
  "/users/:userId/client",
  authMiddleware,
  ThreadController.getByClient
);
threadRouter.get(
  "/users/advisor",
  authMiddleware,
  ThreadController.advisorGetAll
);
threadRouter.get("/users/:userId", authMiddleware, ThreadController.getByUser);

export default threadRouter;
