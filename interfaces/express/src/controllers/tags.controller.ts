import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { tagsFactory } from "@infrastructure/adapters/db/mongo/factories/tag";
import { tagSchema } from "@infrastructure/types/feed";

export class TagsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await tagsFactory().getAllTags.execute();
      if (result instanceof Error) {
        return res.status(404).json({
          name: result.name,
          message: result.message,
        });
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async post(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = tagSchema
        .pick({
          color: true,
          label: true,
        })
        .parse(req.body);

      const result = await tagsFactory().createTag.execute({
        advisorId: userId,
        ...payload,
      });

      if (result instanceof Error) {
        return res.status(404).json({
          name: result.name,
          message: result.message,
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async patch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { tagId } = req.params;

      const payload = tagSchema
        .pick({ label: true, color: true })
        .partial()
        .parse(req.body);

      const result = await tagsFactory().updateTag.execute({
        id: tagId,
        administratorId: userId,
        ...payload,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(tagSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { tagId } = req.params;

      const result = await tagsFactory().deleteTag.execute({
        id: tagId,
        administratorId: userId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json({ message: "Tag supprimé avec succès" });
    } catch (error) {
      next(error);
    }
  }
}
