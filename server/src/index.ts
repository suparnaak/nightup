import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors"; 
import connectDB from "./config/database";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import hostRoutes from "./routes/hostRoutes";

dotenv.config();
connectDB();

const app: Application = express();

app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN, 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes for user
app.use("/api/users", userRoutes);
//Host routes
app.use("/api/hosts", hostRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
