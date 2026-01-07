import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { orderFactory } from "@infrastructure/adapters/db/mongo/factories/orders";
import { orderSchema } from "@infrastructure/types/order";

export class OrdersController {
  static async getAllByUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await orderFactory().getAllByUser.execute(userId);
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

  static async getPortfolio(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await orderFactory().getPorfolio.execute({ userId });
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

  static async getAllByActionStatusAndUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { ISIN } = req.params;

      const { searchParams } = new URL(req.url);

      const status = searchParams.get("status") ?? undefined;

      const result =
        await orderFactory().getAllByActionAndStatusAndUserId.execute({
          userId,
          actionId: ISIN,
          status,
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

  static async getPortfolioByISIN(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { ISIN } = req.params;

      const result = await orderFactory().getPortoflioByISIN.execute({
        userId,
        isin: ISIN,
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

  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { ISIN } = req.params;

      const result = await orderFactory().getOrderHistory.execute({
        isin: ISIN,
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

  static async placeOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { ISIN, type } = req.params;

      const { IBAN, quantity, price } = orderSchema
        .pick({
          IBAN: true,
          quantity: true,
          price: true,
        })
        .parse(req.body);

      const result = await orderFactory().placeOrder.execute({
        userId,
        IBAN,
        isin: ISIN,
        type: type as "buy" | "sell",
        quantity,
        price: price.amount,
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

  static async cancelOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { orderId } = req.params;

      const result = await orderFactory().cancelledOrder.execute({
        userId,
        orderId,
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
