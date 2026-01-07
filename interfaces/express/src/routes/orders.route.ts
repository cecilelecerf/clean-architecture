import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { OrdersController } from "../controllers/orders.controller";

const ordersRouter: Router = express.Router();

ordersRouter.get("/orders", authMiddleware, OrdersController.getAllByUser);

ordersRouter.get("/orders/portfolio", authMiddleware, OrdersController.getPortfolio);

ordersRouter.get("/orders/actions/:ISIN", authMiddleware, OrdersController.getAllByActionStatusAndUser);
ordersRouter.get("/orders/actions/:ISIN/portfolio", authMiddleware, OrdersController.getPortfolioByISIN);
ordersRouter.get("/orders/actions/:ISIN/history", authMiddleware, OrdersController.getHistory);
ordersRouter.post("/orders/actions/:ISIN/:type", authMiddleware, OrdersController.placeOrder);

ordersRouter.patch("/orders/:orderId/cancel", authMiddleware, OrdersController.cancelOrder);