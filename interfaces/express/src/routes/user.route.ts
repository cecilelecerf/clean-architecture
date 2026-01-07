import express, { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouter: Router = express.Router();

userRouter.get("/", authMiddleware, UserController.getAll);
userRouter.get("/me", authMiddleware, UserController.me);
userRouter.get("/:id", authMiddleware, UserController.getById);
userRouter.get("/:id/stats", authMiddleware, UserController.stats);

userRouter.post("/new", authMiddleware, UserController.create);
userRouter.post("/:id/ban", authMiddleware, UserController.ban);
userRouter.patch("/me", authMiddleware, UserController.updateMe);

export default userRouter;
