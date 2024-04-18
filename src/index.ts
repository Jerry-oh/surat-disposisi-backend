import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./database/database";
import userRoute from "./routes/user.route";
import letterRoute from "./routes/letter.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Headers": "content-type, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
    "Access-Control-Max-Age": 86400,
  });
  next();
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    app_name: process.env.APP_NAME || "kelapa_muda_backend",
    version: process.env.npm_package_version || "N/A",
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/letters", letterRoute);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
