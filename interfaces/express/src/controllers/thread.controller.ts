import { Response, NextFunction } from "express";
import { threadsFactory } from "@infrastructure/adapters/db/mongo/factories/thread";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  newExternalThreadSchema,
  newThreadSchema,
} from "@infrastructure/types/thread";
import { getThreadMessagesFactory } from "@infrastructure/adapters/db/mongo/factories/messages/getThreadMessagesFactory";
import { sendMessageFactory } from "@infrastructure/adapters/db/mongo/factories/messages/sendMessageFactory";

export class ThreadController {
  // ========================================================================
  // THREADS
  // ========================================================================

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const type = req.query.type as "external" | "internal" | undefined;

      const result =
        await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
          userId: req.user.userId,
          type,
        });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      if (!threadId)
        return res.status(400).json({ message: "Missing thread ID" });
      const result = await threadsFactory().getThreadById.execute({
        userId: req.user.userId,
        threadId,
      });

      if (!result) return res.status(404).json({ message: "Thread not found" });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const type = req.query.type as "external" | "internal" | undefined;
      let result;

      if (type === "external") {
        const data = newExternalThreadSchema.parse(req.body);

        result = await threadsFactory().startExternalThread.execute({
          clientId: data.participantsId[0],
          ...data,
          actorId: req.user.userId,
        });
      } else if (type === "internal") {
        const data = newThreadSchema.parse(req.body);

        result = await threadsFactory().startInternalThread.execute({
          administratorId: req.user.userId,
          ...data,
          participantsId: data.participantsId ?? [],
        });
      } else {
        return res.status(400).json({ message: "Invalid thread type" });
      }

      if (result instanceof Error) {
        return res
          .status(result.statusCode ?? 404)
          .json({ name: result.name, message: result.message });
      }

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async close(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      if (!threadId)
        return res.status(400).json({ message: "Missing thread ID" });

      await threadsFactory().closeThread.execute({
        userId: req.user.userId,
        threadId,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async join(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      if (!threadId)
        return res.status(400).json({ message: "Missing thread ID" });

      const result = await threadsFactory().adminJoinThread.execute({
        threadId,
        advisorId: req.user.userId,
      });

      if (result instanceof Error)
        return res
          .status(result.statusCode ?? 404)
          .json({ name: result.name, message: result.message });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async transfer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      const { newAdministratorId } = req.body;
      if (!threadId || !newAdministratorId)
        return res.status(400).json({ message: "Missing parameters" });

      const result = await threadsFactory().transferThread.execute({
        id: threadId,
        newAdministratorId,
        administratorId: req.user.userId,
      });

      if (result instanceof Error)
        return res
          .status(result.statusCode ?? 404)
          .json({ name: result.name, message: result.message });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ========================================================================
  // MESSAGES
  // ========================================================================

  static async getMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      const messages = await getThreadMessagesFactory().execute({
        id: threadId,
        userId: req.user.userId,
      });
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      const { content } = req.body;
      if (!threadId || !content)
        return res.status(400).json({ message: "Missing parameters" });

      const message = await sendMessageFactory().execute({
        threadId,
        content,
        senderId: req.user.userId,
      });

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  // ========================================================================
  // PARTICIPANTS
  // ========================================================================

  static async addParticipant(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      const userId = req.params.userId;
      if (!threadId || !userId)
        return res.status(400).json({ message: "Missing parameters" });

      const result = await threadsFactory().addParticipant.execute({
        id: threadId,
        userId,
        administratorId: req.user.userId,
      });

      if (result instanceof Error)
        return res
          .status(result.statusCode ?? 404)
          .json({ name: result.name, message: result.message });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async removeParticipant(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const threadId = req.params.id;
      const participantId = req.params.userId;
      if (!threadId || !participantId)
        return res.status(400).json({ message: "Missing parameters" });

      const result = await threadsFactory().removeParticipant.execute({
        threadId,
        administratorId: req.user.userId,
        participantId,
      });

      if (result instanceof Error)
        return res
          .status(result.statusCode ?? 404)
          .json({ name: result.name, message: result.message });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = req.params.userId;
      if (!userId) return res.status(400).json({ message: "Missing user ID" });
      const type = req.query.type as "external" | "internal" | undefined;

      const result =
        await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
          userId,
          type: type ?? undefined,
          advisorId: req.user.userId,
        });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getByClient(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = req.params.userId;
      if (!userId)
        return res.status(400).json({ message: "Missing client ID" });

      const result =
        await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
          userId,
          type: "external",
          advisorId: req.user.userId,
        });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async advisorGetAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const result = await threadsFactory().advisorGetAllThread.execute({
        administratorId: req.user.userId,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
