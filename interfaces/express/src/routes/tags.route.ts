import express, { Router } from "express";
import { TagsController } from "../controllers/tags.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const tagsRouter: Router = express.Router();

tagsRouter.get("/", TagsController.getAll);
tagsRouter.post("/", TagsController.post);

tagsRouter.patch("/:tagId", TagsController.patch);
tagsRouter.delete("/:tagId", TagsController.delete);

export default tagsRouter;
