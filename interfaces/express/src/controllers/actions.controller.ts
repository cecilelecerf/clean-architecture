import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { actionFactory } from "@infrastructure/adapters/db/mongo/factories/action";
import { newActionSchema, updateActionSchema } from '@infrastructure/types/action';

export class ActionsController {
    static async getAllByAvailability(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const isAvailableParam = req.query.isAvailable;
            let isAvailable: boolean | undefined;

            if (typeof isAvailableParam === "string") {
                isAvailable = isAvailableParam === "true";
            } else {
                isAvailable = true;
            }

            const result = await actionFactory().getAllActionsByAvailability.execute({
                userId,
                isAvailable,
            });

            if (result instanceof Error) {
                return res.status(result.statusCode ?? 404).json({
                name: result.name,
                message: result.message,
                });
            }

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const payload = newActionSchema.parse(req.body);

            const result = await actionFactory().admin.createAction.execute({
                userId,
                ...payload,
                priceAmount: payload.price.amount,
                priceCurrency: payload.price.currency,
                totalNb: payload.quantity,
            });

            if (result instanceof Error) {
                return res.status(result.statusCode ?? 404).json({
                name: result.name,
                message: result.message,
                });
            }

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getSuggestion(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const result = await actionFactory().suggestion.execute({ limit: 6 });

            if (result instanceof Error) {
                return res.status(404).json({
                name: result.name,
                message: result.message,
                });
            }

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { ISIN } = req.params;

            const payload = updateActionSchema.parse(req.body);
            const result = await actionFactory().admin.updateAction.execute({
                userId,
                isin: ISIN,
                ...payload,
            });

            if (result instanceof Error) {
                return res.status(404).json({
                name: result.name,
                message: result.message,
                });
            }

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getAction(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { ISIN } = req.params;

            const result = await actionFactory().getAction.execute({
                userId,
                isin: ISIN,
            });

            if (result instanceof Error) {
                return res.status(404).json({
                name: result.name,
                message: result.message,
                });
            }

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getStat(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { ISIN } = req.params;

            const result = await actionFactory().getActionStat.execute({
                isin: ISIN,
            });

            if (result instanceof Error) {
                return res.status(404).json({
                name: result.name,
                message: result.message,
                });
            }

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}