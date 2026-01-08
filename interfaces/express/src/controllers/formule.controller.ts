import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { formuleFactory } from "@infrastructure/adapters/db/mongo/factories/formules";
import { formuleSchema } from "@infrastructure/types/formule";

export class FormuleController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await formuleFactory().getAll.execute({ userId });
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

  static async post(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = formuleSchema
        .pick({
          interestRate: true,
          insuranceRate: true,
          label: true,
          type: true,
          description: true,
          accountId: true,
        })
        .merge(
          formuleSchema
            .pick({
              minAmount: true,
              maxAmount: true,
              currency: true,
            })
            .partial()
        )
        .parse(req.body);

      const result = await formuleFactory().createFormule.execute({
        userId,
        interestRate: payload.interestRate,
        insuranceRate: payload.insuranceRate,
        label: payload.label,
        type: payload.type,
        description: payload.description,
        accountId: payload.accountId,
        minAmount: payload.minAmount,
        maxAmount: payload.maxAmount,
        currency: payload.currency,
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

  static async geTypes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await formuleFactory().getTypes.execute({ userId });
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

  static async getActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await formuleFactory().getAllActive.execute({ userId });
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

  static async getFormule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { formuleId } = req.params;
      const result = await formuleFactory().getFormule.execute({
        userId,
        formuleId: formuleId,
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

  static async patch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { formuleId } = req.params;

      const payload = formuleSchema
        .pick({
          interestRate: true,
          insuranceRate: true,
          label: true,
          type: true,
          description: true,
          isActive: true,
          accountId: true,
        })
        .merge(
          formuleSchema
            .pick({
              minAmount: true,
              maxAmount: true,
              currency: true,
            })
            .partial()
        )
        .parse(req.body);

      const result = await formuleFactory().updateFormule.execute({
        userId,
        id: formuleId,
        interestRate: payload.interestRate,
        insuranceRate: payload.insuranceRate,
        label: payload.label,
        type: payload.type,
        description: payload.description,
        isActive: payload.isActive,
        accountId: payload.accountId,
        minAmount: payload.minAmount,
        maxAmount: payload.maxAmount,
        currency: payload.currency,
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

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { formuleId } = req.params;
      const result = await formuleFactory().stats.execute({
        formuleId: formuleId,
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
}
