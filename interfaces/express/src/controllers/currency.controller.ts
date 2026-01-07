import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { currencyFactory } from '@infrastructure/adapters/db/mongo/factories/currency';

import { createCurrencySchema, currencySchema, updateCurrencySchema} from '@infrastructure/types/currency';

export class CurrencyController {
    static async list(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const result = await currencyFactory().listCurrencies.execute();

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

    static async create(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const payload = createCurrencySchema.parse(req.body);
            const result = await currencyFactory().admin.createCurrency.execute({
                actorId: userId,
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

    static async update(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { code } = req.params;
            const payload = updateCurrencySchema.parse(req.body);

            const result = await currencyFactory().admin.updateCurrencyRate.execute({
                code,
                actorId: userId,
                newRate: payload.exchangeRate,
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

    static async delete(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { code } = req.params;

            const result = await currencyFactory().admin.deleteCurrency.execute({
                code,
                actorId: userId,
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