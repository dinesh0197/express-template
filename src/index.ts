import express from "express";
import cors from "cors";
import router from "./services/route";
import { notFoundHandler, errorHandler } from "./helper/globalErrorHandler";
import { DbInstance } from "./configs/db";
import { credentials } from "./configs/credentials";

const app = express();
const port = credentials.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", (req, res) => {
  res.send(`zinda hai 😅`);
});

app.use("/api/v1/", router);

app.use(notFoundHandler);
app.use(errorHandler);

DbInstance.then(() => {
  console.log("connected to database");

  app.listen(port, () => {
    console.log(`server is running on port 🚀: ${port}`);
  });
}).catch((err) => {
  console.log("can't connect with the database", err);
  process.exit(1);
});

declare global {
  namespace Express {
    interface Request {
      userInfo: {
        userId: string;
        userName: string;
        userEmail: string;
      };
    }
  }
}
