import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const threadRouter: Router = express.Router();

threadRouter.get("/", AuthController.login);

export default threadRouter;
