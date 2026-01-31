import express, { Router } from "express";
import { PostsController } from "../controllers/posts.controller";

const postsRouter: Router = express.Router();

postsRouter.get("/", PostsController.getWithFilter);
postsRouter.post("/", PostsController.add);

postsRouter.get("/unread", PostsController.getUnreadWithTag);
postsRouter.get("/sse", PostsController.ssePost);

postsRouter.get("/:postId", PostsController.getByIdWithTags);
postsRouter.patch("/:postId", PostsController.edit);
postsRouter.delete("/:postId", PostsController.delete);

postsRouter.patch("/:postId/status", PostsController.updateStatus);
postsRouter.patch("/:postId/read", PostsController.markAsRead);
export default postsRouter;
