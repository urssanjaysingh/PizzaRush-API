import "colors";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import connectDB from "./config/config.js";
import corsOptions from "./config/corsOptions.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";
import pizzaRouter from "./routes/pizzaRoute.js";
import orderRouter from "./routes/orderRoute.js";
import configureCloudinary from "./services/cloudServices.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

// Configure Cloudinary
configureCloudinary();

//config dotenv
dotenv.config();

//mongodb connection
connectDB();

const app = express();

//middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//route
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/pizzas", pizzaRouter);
app.use("/api/orders", orderRouter);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 3500;
app.listen(port, () => {
  console.log(
    `Server running on ${process.env.NODE_ENV} mode on port ${port}`.rainbow
      .bold
  );
});
