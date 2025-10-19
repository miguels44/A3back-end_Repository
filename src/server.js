import "dotenv/config";
import fastify from "fastify";
import cookie from "@fastify/cookie";
import { statusRoutes } from "./routes/status.js";
import { userRoutes } from "./routes/user.js";
import { sessionRoutes } from "./routes/session.js";
import { env } from "./env/index.js";
import { subjectsRoutes } from "./routes/subjects.js";

const app = fastify();

app.register(cookie);

app.register(sessionRoutes);

app.register(statusRoutes);

app.register(userRoutes);

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("🚀 HTTP Server is running on port: " + env.PORT);
  });
