import express, { Router } from "express";
import { CurrencyController } from "../controllers/currency.controller";

const currenciesRouter: Router = express.Router();

currenciesRouter.get("/", CurrencyController.list);
currenciesRouter.post("/", CurrencyController.create);

currenciesRouter.patch("/:code", CurrencyController.update);
currenciesRouter.delete("/:code", CurrencyController.delete);

export default currenciesRouter;
