import express from "express";
import authRouter from "./routes/auth.route";
import cors from "cors";
import threadRouter from "./routes/thread.router";
import { authMiddleware } from "./middlewares/auth.middleware";
import userRouter from "./routes/user.route";
import savingsrateRouter from "./routes/savingsrate.router";
import tagsRouter from "./routes/tags.router";

const app = express();
const port = 3002;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/threads", authMiddleware, threadRouter);
app.use("/api/users", authMiddleware, userRouter);
app.use("/api/savings-rate", authMiddleware, savingsrateRouter);
app.use("/api/tags", authMiddleware, tagsRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
