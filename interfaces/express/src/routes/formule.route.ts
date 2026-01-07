import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { FormuleController } from "../controllers/formule.controller";

const formuleRouter: Router = express.Router();

formuleRouter.get("/", authMiddleware, FormuleController.getAll);
formuleRouter.post("/", authMiddleware, FormuleController.post);

formuleRouter.get("/types", authMiddleware, FormuleController.geTypes);

formuleRouter.get("/active", authMiddleware, FormuleController.getActive);

formuleRouter.get("/:formuleId", authMiddleware, FormuleController.getFormule);
formuleRouter.patch("/:formuleId", authMiddleware, FormuleController.patch);

formuleRouter.get(
  "/:formuleId/stats",
  authMiddleware,
  FormuleController.getStats
);
export default formuleRouter;
