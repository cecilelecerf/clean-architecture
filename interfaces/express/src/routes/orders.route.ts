import express, { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";

const ordersRouter: Router = express.Router();

ordersRouter.get("/", OrdersController.getAllByUser);

ordersRouter.get("/portfolio", OrdersController.getPortfolio);

ordersRouter.get(
  "/actions/:ISIN",
  OrdersController.getAllByActionStatusAndUser
);
ordersRouter.get(
  "/actions/:ISIN/portfolio",
  OrdersController.getPortfolioByISIN
);
ordersRouter.get("/actions/:ISIN/history", OrdersController.getHistory);
ordersRouter.post("/actions/:ISIN/:type", OrdersController.placeOrder);

ordersRouter.patch("/:orderId/cancel", OrdersController.cancelOrder);

export default ordersRouter;
