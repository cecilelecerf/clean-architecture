import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ActionsController } from "../controllers/actions.controller";

const actionsRouter: Router = express.Router();

actionsRouter.get("/", authMiddleware, ActionsController.getAllByAvailability);
actionsRouter.post("/", authMiddleware, ActionsController.create);

actionsRouter.get("/suggestion", authMiddleware, ActionsController.getSuggestion);

actionsRouter.patch("/:ISIN", authMiddleware, ActionsController.update);
actionsRouter.get("/:ISIN", authMiddleware, ActionsController.getAction);

actionsRouter.get("/:ISIN/stats", authMiddleware, ActionsController.getStat);

export default actionsRouter;