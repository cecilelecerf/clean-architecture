import express, { Router } from "express";
import { AccountsController } from "../controllers/accounts.controller";

const accountsRouter: Router = express.Router();

accountsRouter.get("/", AccountsController.getAccounts);
accountsRouter.post("/", AccountsController.create);

accountsRouter.get("/users/:userId", AccountsController.getOneByUser);

accountsRouter.get("/:accountIban", AccountsController.getOneByIban);
accountsRouter.delete("/:accountIban", AccountsController.delete);

accountsRouter.get(
  "/:accountIban/transactions",
  AccountsController.getAllAcounts
);
accountsRouter.post("/:accountIban/transactions", AccountsController.transfert);

accountsRouter.patch("/:accountIban/rename", AccountsController.rename);

accountsRouter.get(
  "/:accountIban/transactions/:transactionId",
  AccountsController.getTransactionById
);

accountsRouter.get(
  "/:accountIban/transactions/:transactionId/users/:userId",
  AccountsController.getTransactionByUserId
);

export default accountsRouter;
