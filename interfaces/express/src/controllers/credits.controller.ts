import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { creditFactory } from "@infrastructure/adapters/db/mongo/factories/credit";
import {
  creditSchema,
  creditResponseSchema,
} from "@infrastructure/types/credit";

export class CreditsController {
  static async getAllByUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const result = await creditFactory().getCreditsByUser.execute({
        clientId: userId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async request(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const payload = creditSchema
        .pick({
          accountId: true,
          formuleCreditId: true,
          initialAmount: true,
          durationMonths: true,
          startDate: true,
        })
        .parse(req.body);

      const result = await creditFactory().requestCredit.execute({
        clientId: userId,
        accountId: payload.accountId,
        formuleCreditId: payload.formuleCreditId,
        amount: payload.initialAmount.amount,
        currency: payload.initialAmount.currency,
        durationMonths: payload.durationMonths,
        startDate: payload.startDate,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getOneByUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user?.userId;
      if (!session) return res.status(401).json({ message: "Unauthorized" });

      const { userId } = req.params;

      const result = await creditFactory().getCreditsByUser.execute({
        clientId: userId,
        adminId: session,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllByStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const status = req.query.label as string | undefined;

      const result = await creditFactory().getAllByStatus.execute({
        actorId: userId,
        status: status ?? null,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllByFormule(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { formuleId } = req.params;

      const result = await creditFactory().getAllByFormule.execute({
        actorId: userId,
        formuleId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getCredit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { creditId } = req.params;

      const result = await creditFactory().getCredit.execute({
        creditId: creditId,
        actorId: userId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async grantCredit(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { creditId } = req.params;
      const payload = creditResponseSchema.parse(req.body);

      const result = await creditFactory().grantCredit.execute({
        advisorId: userId,
        creditId: creditId,
        accept: payload.accept,
        reason: payload.reason ?? "",
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 400).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
