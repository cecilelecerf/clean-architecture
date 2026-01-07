import express, { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { OrdersController } from "../controllers/orders.controller";

const ordersRouter: Router = express.Router();

ordersRouter.get("/", authMiddleware, OrdersController.getAllByUser);

ordersRouter.get("/portfolio", authMiddleware, OrdersController.getPortfolio);

ordersRouter.get(
  "/actions/:ISIN",
  authMiddleware,
  OrdersController.getAllByActionStatusAndUser
);
ordersRouter.get(
  "/actions/:ISIN/portfolio",
  authMiddleware,
  OrdersController.getPortfolioByISIN
);
ordersRouter.get(
  "/actions/:ISIN/history",
  authMiddleware,
  OrdersController.getHistory
);
ordersRouter.post(
  "/actions/:ISIN/:type",
  authMiddleware,
  OrdersController.placeOrder
);

ordersRouter.patch(
  "/:orderId/cancel",
  authMiddleware,
  OrdersController.cancelOrder
);

export default ordersRouter;
