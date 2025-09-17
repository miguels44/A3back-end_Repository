import "dotenv/config";
import fastify from "fastify";
import { statusRoutes } from "./routes/status.js";

const app = fastify();

app.register(statusRoutes, {
  prefix: "status",
});

app
  .listen({
    port: process.env.PORT,
  })
  .then(() => {
    console.log("HTTP Server in running in: " + process.env.PORT);
  });
