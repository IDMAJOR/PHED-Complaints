import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import initializeSocket from "./socket";
import connectDB from "./database/connectDB";
import complaintRoute from "./routes/complaintRoutes";
import chatRoute from "./routes/chatRoutes";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/AdminRoutes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 2000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express!");
});

app.use("/api/v1/complaints", complaintRoute);
app.use("/api/v1/chats", chatRoute);
app.use("/api/v1/admin", adminRoutes);

// Start the server
server.listen(port, () => {
  connectDB();
  console.log(`Server running on http://localhost:${port}`);
});
