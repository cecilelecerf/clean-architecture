import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PostsController } from "../controllers/posts.controller";

const postsRouter: Router = express.Router();

postsRouter.get("/", authMiddleware, PostsController.getWithFilter);
postsRouter.post("/", authMiddleware, PostsController.add);

postsRouter.post("/unread", authMiddleware, PostsController.getUnreadWithTag);

postsRouter.post("/:postId", authMiddleware, PostsController.getByIdWithTags);
postsRouter.patch("/:postId", authMiddleware, PostsController.edit);
postsRouter.delete("/:postId", authMiddleware, PostsController.delete);

postsRouter.patch("/:postId/status", authMiddleware, PostsController.updateStatus);
postsRouter.patch("/:postId/read", authMiddleware, PostsController.markAsRead);

export default postsRouter;