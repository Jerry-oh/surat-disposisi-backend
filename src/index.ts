import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.json({
    app_name: process.env.APP_NAME || "kelapa_muda_backend",
    version: process.env.npm_package_version || "N/A",
    environment: process.env.NODE_ENV,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
