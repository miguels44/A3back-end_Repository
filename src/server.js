import "dotenv/config";
import fastify from "fastify";
import cookie from "@fastify/cookie";
import { statusRoutes } from "./routes/status.js";
import { userRoutes } from "./routes/user.js";
import { sessionRoutes } from "./routes/session.js";
import { env } from "./env/index.js";
import { subjectsRoutes } from "./routes/subjects.js";
import { questionsRoutes } from "./routes/questions.js";
import { questionOptionsRoutes } from "./routes/questions-options.js"; 


const app = fastify();

app.register(cookie);

app.register(statusRoutes);

app.register(sessionRoutes, { prefix: "/sessions" });

app.register(userRoutes, { prefix: "/users" });

app.register(subjectsRoutes, { prefix: "/subjects" });

app.register(questionsRoutes, { prefix: "/questions" });

app.register(questionOptionsRoutes, { prefix: "/questions" });

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("🚀 HTTP Server is running on port: " + env.PORT);
  });
