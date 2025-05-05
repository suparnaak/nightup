import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors"; 
import connectDB from "./config/database";
import cookieParser from "cookie-parser";
import "./config/passport";




import userRoutes from "./routes/userRoutes";
import hostRoutes from "./routes/hostRoutes";
import adminRoutes from "./routes/adminRoutes";


import { initializeSocket } from "./config/SocketServer";  
import { createServer } from "http";


connectDB();
const app: Application = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes for user
app.use("/api/users", userRoutes);

// Host routes
app.use("/api/hosts", hostRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);



const httpServer = createServer(app);


initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(` Server + Socket.IO running on port ${PORT}`);
});
