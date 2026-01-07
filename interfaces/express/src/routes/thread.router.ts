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
  "/:id/participants",
  authMiddleware,
  ThreadController.addParticipant
);
threadRouter.delete(
  "/:id/participants/:userId",
  authMiddleware,
  ThreadController.removeParticipant
);

export default threadRouter;
