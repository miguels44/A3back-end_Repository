import { database } from "../../infra/database.js";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function authenticate(request, reply) {
  const sessionId = request.cookies.session_id;
  if (!sessionId) {
    return reply.status(401).send({ error: "Não autenticado" });
  }

  const session = await database("sessions").where({ id: sessionId }).first();

  if (
    !session ||
    !session.active ||
    new Date(session.expires_at) <= new Date()
  ) {
    return reply.status(401).send({ error: "Sessão inválida ou expirada" });
  }

  request.user = { id: session.user_id };
}

export async function sessionRoutes(app) {
  app.post("/", async (req, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(req.body);

    const user = await database("users").where({ email }).first();
    if (!user) return reply.status(401).send({ error: "Email ou senha inválidos" });

    const validPassword = await bcrypt.compare(password, user.hash_password);
    if (!validPassword) return reply.status(401).send({ error: "Email ou senha inválidos" });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [session] = await database("sessions")
      .insert({ user_id: user.id, expires_at: expiresAt })
      .returning(["id"]);

    reply
      .setCookie("session_id", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresAt,
      })
      .status(201)
      .send({ sessionId: session.id });
  });

  app.post("/logout", { preHandler: [authenticate] }, async (req, reply) => {
    await database("sessions")
      .where({ id: req.cookies.session_id })
      .update({ active: false });

    reply.clearCookie("session_id").status(204).send();
  });
}
