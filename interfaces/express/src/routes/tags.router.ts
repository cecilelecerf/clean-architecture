import express, { Router } from "express";
import { TagsController } from "../controllers/tags.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const tagsRouter: Router = express.Router();

tagsRouter.get("/tags", authMiddleware, TagsController.getAll);
tagsRouter.post("/tags", authMiddleware, TagsController.post);

tagsRouter.patch("/tags/:tagId", authMiddleware, TagsController.patch);
tagsRouter.delete("/tags/:tagId", authMiddleware, TagsController.delete);

export default tagsRouter;