import { database } from "../../infra/database.js";

export async function statusRoutes(app) {
  app.get("/", async (req, reply) => {
    return reply.status(200).send({ status: "api is running!" });
  });

  app.get("/database", async (req, reply) => {
    try {
      await database.raw("SELECT 1");
      return reply.status(200).send({ status: "database is ok!" });
    } catch (error) {
      console.log("Error: " + error);
      return reply.status(500).send({ status: "Houve um erro" });
    }
  });
}
