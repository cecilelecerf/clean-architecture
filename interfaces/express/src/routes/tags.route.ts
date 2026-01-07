import express, { Router } from "express";
import { TagsController } from "../controllers/tags.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const tagsRouter: Router = express.Router();

tagsRouter.get("/", authMiddleware, TagsController.getAll);
tagsRouter.post("/", authMiddleware, TagsController.post);

tagsRouter.patch("/:tagId", authMiddleware, TagsController.patch);
tagsRouter.delete("/:tagId", authMiddleware, TagsController.delete);

export default tagsRouter;
