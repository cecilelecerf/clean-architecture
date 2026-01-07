import { threadsFactory } from "@infrastructure/adapters/db/mongo/factories/thread";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ThreadController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log("test");
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result =
        await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
          type: "external",
          userId,
        });
      console.log(result);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
