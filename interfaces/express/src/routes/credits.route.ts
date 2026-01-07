import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CreditsController } from "../controllers/credits.controller";

const creditsRouter: Router = express.Router();

creditsRouter.get("/credits", authMiddleware, CreditsController.getAllByUser);
creditsRouter.post("/credits", authMiddleware, CreditsController.request);

creditsRouter.get("/credits/:creditId", authMiddleware, CreditsController.getCredit);
creditsRouter.patch("/credits/:creditId", authMiddleware, CreditsController.applyMonthlyPaiement);

creditsRouter.patch("/credits/:creditId/grant", authMiddleware, CreditsController.grantCredit);

creditsRouter.get("/credits/users/:userId", authMiddleware, CreditsController.getOneByUser);

creditsRouter.get("/credits/status", authMiddleware, CreditsController.getAllByStatus);

creditsRouter.get("/credits/formules/:formuleId", authMiddleware, CreditsController.getAllByFormule);

