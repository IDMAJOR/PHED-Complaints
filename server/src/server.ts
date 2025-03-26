import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import connectDB from "./database/connectDB";
import complaintRoute from "./routes/complaintRoutes";

const app: Express = express();
const port = process.env.PORT || 2000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express!");
});

app.use("/api/v1/complaints", complaintRoute);

app.listen(port, () => {
  connectDB();
  console.log(`Server running on http://localhost:${port}`);
});
