import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors"; // ✅ Step 1: Import cors
import connectDB from "./config/database";
import userRoutes from "./routes/userRoutes";

dotenv.config();
connectDB();

const app: Application = express();

app.use(cors({
  origin: "http://localhost:5173", // ✅ Step 2: Use cors middleware
  credentials: true
}));

app.use(express.json());

// Routes for user
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
