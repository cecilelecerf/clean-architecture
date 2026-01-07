import { threadsFactory } from "@infrastructure/adapters/db/mongo/factories/thread";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ThreadController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result =
        await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
          type: "external",
          userId,
        });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
