import express, { Router } from "express";
import { ThreadController } from "../controllers/thread.controller";

const threadRouter: Router = express.Router();

threadRouter.get("/", ThreadController.getAll);

export default threadRouter;
