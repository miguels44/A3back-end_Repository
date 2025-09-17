import "dotenv/config";
import fastify from "fastify";
import { statusRoutes } from "./routes/status.js";
import { env } from "./env/index.js";
import { userRoutes } from "./routes/user.js";

const app = fastify();

app.register(statusRoutes, {
  prefix: "status",
});

app.register(userRoutes, {
  prefix: "user",
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server in running in: " + env.PORT);
  });
