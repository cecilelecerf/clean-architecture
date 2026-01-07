import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CreditsController } from "../controllers/credits.controller";

const creditsRouter: Router = express.Router();

creditsRouter.get("/", authMiddleware, CreditsController.getAllByUser);
creditsRouter.post("/", authMiddleware, CreditsController.request);

creditsRouter.get(
  "/users/:userId",
  authMiddleware,
  CreditsController.getOneByUser
);

creditsRouter.get("/status", authMiddleware, CreditsController.getAllByStatus);

creditsRouter.get(
  "/formules/:formuleId",
  authMiddleware,
  CreditsController.getAllByFormule
);

creditsRouter.get("/:creditId", authMiddleware, CreditsController.getCredit);
creditsRouter.patch(
  "/:creditId",
  authMiddleware,
  CreditsController.applyMonthlyPaiement
);

creditsRouter.patch(
  "/:creditId/grant",
  authMiddleware,
  CreditsController.grantCredit
);

export default creditsRouter;
