import express, { Router } from "express";
import { SavingsrateController } from "../controllers/savingsrate.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const savingsrateRouter: Router = express.Router();

savingsrateRouter.get("/savingsrate", authMiddleware, SavingsrateController.getAll);
savingsrateRouter.get("/savingsrate/current", authMiddleware, SavingsrateController.getCurrent);
savingsrateRouter.post("/savingsrate", authMiddleware, SavingsrateController.post);

export default savingsrateRouter;