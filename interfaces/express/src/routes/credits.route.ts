import express, { Router } from "express";
import { CreditsController } from "../controllers/credits.controller";

const creditsRouter: Router = express.Router();

creditsRouter.get("/", CreditsController.getAllByUser);
creditsRouter.post("/", CreditsController.request);

creditsRouter.get("/users/:userId", CreditsController.getOneByUser);

creditsRouter.get("/status", CreditsController.getAllByStatus);

creditsRouter.get(
  "/formules/:formuleId",

  CreditsController.getAllByFormule
);

creditsRouter.patch(
  "/:creditId/grant",

  CreditsController.grantCredit
);
creditsRouter.get("/:creditId", CreditsController.getCredit);

export default creditsRouter;
