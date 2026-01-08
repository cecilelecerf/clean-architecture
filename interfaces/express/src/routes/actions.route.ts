import express, { Router } from "express";
import { ActionsController } from "../controllers/actions.controller";

const actionsRouter: Router = express.Router();

actionsRouter.get("/", ActionsController.getAllByAvailability);
actionsRouter.post("/", ActionsController.create);

actionsRouter.get("/suggestions", ActionsController.getSuggestion);

actionsRouter.patch("/:ISIN", ActionsController.update);
actionsRouter.get("/:ISIN", ActionsController.getAction);

actionsRouter.get("/:ISIN/stats", ActionsController.getStat);

export default actionsRouter;
