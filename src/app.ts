import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";

// Import Routes
import login from "./routes/login";
import users from "./routes/users";
import posts from "./routes/posts";
import path from "path";

// Ceate app
const app = express();
const uploadsPath = path.join(__dirname, "../uploads");

// Cors options
const corsOptions = {
  origin: [
    "https://faustinee.mipanel.online",
    "http://localhost:5174",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: "GET, PATCH, POST, OPTIONS, PUT, DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, authorization",
};

// app config
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("dev"));

// Use routes
app.use("/login", login);
app.use("/users", users);
app.use("/posts", posts);
app.use("/uploads", express.static(uploadsPath));

// Implementar un protocolo de HTTPS de Security
// Error catching endware.
app.use((err: any, req: any, res: any, next: any) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = app;
