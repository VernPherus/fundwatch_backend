import express, { application } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import fundRoutes from "./routes/fund.route.js";
import logRoutes from "./routes/log.route.js";

dotenv.config();

const app = express();

//* PORT
const PORT = process.env.PORT;

//* APPLICATION STARTUP PROCESS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

//* ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/fund", fundRoutes);
app.use("api/log", logRoutes);

app.listen(PORT, () => {
  console.log("server is running on port: " + PORT);
});
