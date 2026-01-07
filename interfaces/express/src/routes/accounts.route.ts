import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AccountsController } from "../controllers/accounts.controller"

const accountsRouter: Router = express.Router();

accountsRouter.get("/", authMiddleware, AccountsController.getAccounts);
accountsRouter.post("/", authMiddleware, AccountsController.create);

accountsRouter.get("/users/:userId", authMiddleware, AccountsController.getOneByUser);

accountsRouter.get("/:accountIban", authMiddleware, AccountsController.getOneByIban);
accountsRouter.delete("/:accountIban", authMiddleware, AccountsController.delete);

accountsRouter.get("/:accountIban/transactions", authMiddleware, AccountsController.getAllAcounts);
accountsRouter.post("/:accountIban/transactions", authMiddleware, AccountsController.transfert);

accountsRouter.patch("/:accountIban/rename", authMiddleware, AccountsController.rename);

accountsRouter.get("/:accountIban/transactions/:transactionIban", authMiddleware, AccountsController.getTransactionById);

accountsRouter.get("/:accountIban/transactions/:transactionIban/users/:userId", authMiddleware, AccountsController.getTransactionByUserId);



