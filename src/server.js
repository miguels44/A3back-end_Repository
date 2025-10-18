import "dotenv/config";
import fastify from "fastify";
import { statusRoutes } from "./routes/status.js";
import { userRoutes } from "./routes/user.js";
import { sessionRoutes } from "./routes/session.js";
import { env } from "./env/index.js";

const app = fastify();

app.register(sessionRoutes, {
  prefix: "sessions",
});

app.register(statusRoutes, {
  prefix: "status",
});

app.register(userRoutes);

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("🚀 HTTP Server is running on port: " + env.PORT);
  });
