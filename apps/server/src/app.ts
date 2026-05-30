import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import routes from "./routes/index.js";
import { WEB_URL } from "./envs.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import morganMiddleware from "./logger/morgan.logger.js";
import { passportService } from "./services/auth.services.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: WEB_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(helmet());
app.use(passportService.passport.initialize());

app.get("/", (req, res) => {
  res.send("Axonix server is running");
});

app.get("/health", (req, res) => {
  res.send("Axonix server is healthy");
});

app.use("/api", routes);

const httpServer = http.createServer(app);

app.use(morganMiddleware);
app.use(errorHandler);

export default httpServer;