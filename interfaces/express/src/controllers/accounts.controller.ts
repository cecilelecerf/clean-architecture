import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { accountFactory } from "@infrastructure/adapters/db/mongo/factories/account";
import { transactionFactory } from "@infrastructure/adapters/db/mongo/factories/transaction";
import { accountSchema } from '@infrastructure/types/account';
import { newTransactionSchema } from '@infrastructure/types/transaction';
import { querySchema } from '@infrastructure/types/pagination';

export class AccountsController {
    static async getAccounts(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { searchParams } = new URL(req.url);
            const type = searchParams.get('type') as 'bank' | 'client' | null;
            const result = type
            ? await accountFactory().getAccountsByType.execute({
                    userId,
                    type,
                })
            : await accountFactory().getAccounts.execute({ clientId: userId });
            
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

    static async create(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const payload = accountSchema.parse(req.body);
            const result = await accountFactory().createAccount.execute({
                iban: payload.IBAN,
                userId,
                name: payload.name,
                type: payload.type,
                color: payload.color,
                initialBalance: payload.balance,
                currency: payload.currency,
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

    static async getOneByUser(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const session = req.user?.userId;
            if (!session) return res.status(401).json({ message: "Unauthorized" });

            const { userId } = req.params;

            const result = await accountFactory().getAccounts.execute({
                clientId: userId,
                requesterId: session,
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

    static async getOneByIban(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { accountIban } = req.params;
            const result = await accountFactory().getAccountByIBAN.execute({
                iban: accountIban,
                userId: userId,
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

    static async delete(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { accountIban } = req.params;

            const result = await accountFactory().deleteAccount.execute(accountIban, userId);

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

    static async getAllAcounts(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { accountIban } = req.params;
            const { type, label, fromDate, toDate, page, limit } = req.query;

            const filters = querySchema.parse({
                label: label ?? undefined,
                type:
                type && type !== "all"
                    ? (type as "debit" | "credit")
                    : undefined,
                fromDate: fromDate ?? undefined,
                toDate: toDate ?? undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });

            const result = await transactionFactory().getAllByAccount.execute({
                iban: accountIban,
                clientId: userId,
                filters,
            });

            if (result instanceof Error) {
                return res.status(result.statusCode ?? 400).json({
                    name: result.name,
                    message: result.message,
                });
            }

            return res.json({ transactions: result.transactions, total: result.totalPages });
        } catch (error) {
            next(error);
        }
    }

    static async transfert(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { accountIban } = req.params;
            const payload = newTransactionSchema.parse(req.body);
            const result = await accountFactory().transfertBetweenAccount.execute({
                requestUserId: userId,
                fromAccountIban: accountIban,
                amountCurrency: payload.currency,
                amountValue: payload.amount,
                ...payload,
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

    static async getTransactionById(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { transactionId } = req.params;
            const result = await transactionFactory().getById.execute({
                transactionId: transactionId,
                userId: userId,
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

    static async getTransactionByUserId(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const session = req.user?.userId;
            if (!session) return res.status(401).json({ message: "Unauthorized" });

            const { transactionId, userId } = req.params;

            const result = await transactionFactory().getById.execute({
                transactionId: transactionId,
                userId,
                requestUserId: session,
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

    static async rename(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { accountIban } = req.params;

            const payload = accountSchema.pick({ name: true }).parse(req.body);

            const result = await accountFactory().renameAccount.execute(
                accountIban,
                userId,
                payload.name,
            );

            if (result instanceof Error) {
                return res.status(result.statusCode ?? 400).json({
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