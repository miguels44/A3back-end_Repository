import { database } from "../../infra/database.js";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function userRoutes(app) {
  app.post("/users", async (req, reply) => {
    try {
      const bodySchema = z.object({
        name: z.string().min(1, "Nome é obrigatório."),
        email: z.string().email("E-mail inválido."),
        password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
      });

      const { name, email, password } = bodySchema.parse(req.body);

      const existing = await database("users").where({ email }).first();
      if (existing) {
        return reply.status(409).send({ error: "E-mail já cadastrado." });
      }

      const hash_password = await bcrypt.hash(password, 10);

      const [user] = await database("users")
        .insert({ name, email, hash_password })
        .returning(["id", "name", "email", "created_at", "updated_at"]);

      return reply.status(201).send(user);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(500).send({ error: "Erro ao criar usuário." });
    }
  });

  app.get("/users", async (req, reply) => {
    try {
      const users = await database("users").select(
        "id",
        "name",
        "email",
        "created_at",
        "updated_at"
      );
      return reply.status(200).send(users);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao buscar usuários." });
    }
  });

  app.get("/users/:id", async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid("ID inválido."),
      });

      const { id } = paramsSchema.parse(req.params);

      const user = await database("users")
        .select("id", "name", "email", "created_at", "updated_at")
        .where({ id })
        .first();

      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado." });
      }

      return reply.status(200).send(user);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(500).send({ error: "Erro ao buscar usuário." });
    }
  });

  app.put("/users/:id", async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid("ID inválido."),
      });
      const bodySchema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      });

      const { id } = paramsSchema.parse(req.params);
      const { name, email } = bodySchema.parse(req.body);

      const user = await database("users").where({ id }).first();
      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado." });
      }

      if (email && email !== user.email) {
        const exists = await database("users").where({ email }).first();
        if (exists) {
          return reply.status(409).send({ error: "E-mail já em uso." });
        }
      }

      const [updated] = await database("users")
        .where({ id })
        .update(
          { name, email, updated_at: database.fn.now() },
          ["id", "name", "email", "created_at", "updated_at"]
        );

      return reply.status(200).send(updated);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(500).send({ error: "Erro ao atualizar usuário." });
    }
  });

  app.delete("/users/:id", async (req, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid("ID inválido."),
      });

      const { id } = paramsSchema.parse(req.params);

      const user = await database("users").where({ id }).first();
      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado." });
      }

      await database("users").where({ id }).del();

      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(500).send({ error: "Erro ao remover usuário." });
    }
  });
}
