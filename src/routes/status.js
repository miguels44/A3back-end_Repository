export async function statusRoutes(app) {
  app.get("/", (res, reply) => {
    return reply.status(200).send({ status: "api is runing" });
  });
}
