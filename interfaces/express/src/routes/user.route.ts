import express, { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouter: Router = express.Router();

userRouter.get("/", UserController.getAll);
userRouter.get("/me", UserController.me);
userRouter.get("/:id", UserController.getById);
userRouter.get("/:id/stats", UserController.stats);

userRouter.post("/new", UserController.create);
userRouter.post("/:id/ban", UserController.ban);
userRouter.patch("/me", UserController.updateMe);

export default userRouter;
