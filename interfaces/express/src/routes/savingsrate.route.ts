import express, { Router } from "express";
import { SavingsrateController } from "../controllers/savingsrate.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const savingsrateRouter: Router = express.Router();

savingsrateRouter.get("/", authMiddleware, SavingsrateController.getAll);
savingsrateRouter.get(
  "/current",
  authMiddleware,
  SavingsrateController.getCurrent
);
savingsrateRouter.post("/", authMiddleware, SavingsrateController.post);

export default savingsrateRouter;
