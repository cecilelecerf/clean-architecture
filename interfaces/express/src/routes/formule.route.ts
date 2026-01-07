import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { FormuleController } from "../controllers/formule.controller";

const formuleRouter: Router = express.Router();

formuleRouter.get("/formules", authMiddleware, FormuleController.getAll);
formuleRouter.post("/formules", authMiddleware, FormuleController.post);

formuleRouter.get("/formules/types", authMiddleware, FormuleController.geTypes);

formuleRouter.get("/formules/active", authMiddleware, FormuleController.getActive);

formuleRouter.get("/formules/:formuleId", authMiddleware, FormuleController.getFormule);
formuleRouter.patch("/formules/:formuleId", authMiddleware, FormuleController.patch);

formuleRouter.get("/formules/:formuleId/stats", authMiddleware, FormuleController.getStats);
