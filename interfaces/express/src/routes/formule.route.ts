import express, { Router } from "express";
import { FormuleController } from "../controllers/formule.controller";

const formuleRouter: Router = express.Router();

formuleRouter.get("/", FormuleController.getAll);
formuleRouter.post("/", FormuleController.post);

formuleRouter.get("/types", FormuleController.geTypes);

formuleRouter.get("/active", FormuleController.getActive);

formuleRouter.get("/:formuleId", FormuleController.getFormule);
formuleRouter.patch("/:formuleId", FormuleController.patch);

formuleRouter.get("/:formuleId/stats", FormuleController.getStats);
export default formuleRouter;
