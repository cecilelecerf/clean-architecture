import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CurrencyController } from "../controllers/currency.controller";

const currencyRouter: Router = express.Router();

currencyRouter.get("/", authMiddleware, CurrencyController.list);
currencyRouter.post("/", authMiddleware, CurrencyController.create);

currencyRouter.patch("/:code", authMiddleware, CurrencyController.update);
currencyRouter.delete("/:code", authMiddleware, CurrencyController.delete);

export default currencyRouter;