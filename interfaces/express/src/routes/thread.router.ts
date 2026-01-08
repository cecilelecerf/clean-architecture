import express, { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const threadRouter: Router = express.Router();

threadRouter.get("/", ThreadController.getAll);
threadRouter.get("/:id", ThreadController.getById);
threadRouter.post("/", ThreadController.create);
threadRouter.post("/:id/close", ThreadController.close);
threadRouter.post("/:id/join", ThreadController.join);
threadRouter.post("/:id/transfer", ThreadController.transfer);

threadRouter.get("/:id/messages", ThreadController.getMessages);
threadRouter.post("/:id/messages", ThreadController.sendMessage);

threadRouter.post(
  "/:id/participants/:userId",

  ThreadController.addParticipant
);
threadRouter.delete(
  "/:id/participants/:userId",

  ThreadController.removeParticipant
);

threadRouter.get(
  "/users/:userId/client",

  ThreadController.getByClient
);
threadRouter.get(
  "/users/advisor",

  ThreadController.advisorGetAll
);
threadRouter.get("/users/:userId", ThreadController.getByUser);

export default threadRouter;
