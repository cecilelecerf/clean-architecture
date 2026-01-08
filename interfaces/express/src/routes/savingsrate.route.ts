import express, { Router } from "express";
import { SavingsrateController } from "../controllers/savingsrate.controller";

const savingsrateRouter: Router = express.Router();

savingsrateRouter.get("/", SavingsrateController.getAll);
savingsrateRouter.get(
  "/current",

  SavingsrateController.getCurrent
);
savingsrateRouter.post("/", SavingsrateController.post);

export default savingsrateRouter;
