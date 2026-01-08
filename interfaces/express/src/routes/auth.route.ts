import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter: Router = express.Router();

authRouter.post("/login", AuthController.login);
authRouter.post("/confirm-email", AuthController.confirmRegistration);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/register", AuthController.register);
authRouter.post("/reset-password", AuthController.resetPassword);

export default authRouter;
