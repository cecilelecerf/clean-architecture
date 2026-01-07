import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { savingsrateFactory } from "@infrastructure/adapters/db/mongo/factories/savingsrate";
import { savingRateSchema } from '@infrastructure/types/savingsrate';

export class SavingsrateController {
    static async getAll(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const result = await savingsrateFactory().getAll.execute({
                userId
            });
            if (result instanceof Error) {
                return res.status(result.statusCode ?? 400).json({
                name: result.name,
                message: result.message,
                });
            }
            res.json(result);
        }catch (error) {
            next(error);
        }
    }

    static async getCurrent(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });
            const result = await savingsrateFactory().getCurrent.execute({
                userId
            });
            if (result instanceof Error) {
                return res.status(result.statusCode ?? 400).json({
                name: result.name,
                message: result.message,
                });
            }
            res.json(result);
        }catch (error) {
            next(error);
        }
    }

    static async post(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const payload = savingRateSchema.pick({
                rate: true,
                effectiveDate: true,
                })
                .parse(req.body);

            const result = await savingsrateFactory().setSavingsRate.execute({
                rate: payload.rate,
                effectiveDate: payload.effectiveDate,
                userId,
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