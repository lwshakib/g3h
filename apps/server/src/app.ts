import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import "dotenv/config";
import routes from "./routes/index.js";
import { WEB_URL } from "./env.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import morganMiddleware from "./logger/morgan.logger.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: WEB_URL || "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(helmet());



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