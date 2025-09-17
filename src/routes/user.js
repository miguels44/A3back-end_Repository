import { database } from "../../infra/database.js";

export async function userRoutes(app) {
  // CREATE - Criar novo usuário
  app.post("/", async (req, reply) => {
    const { name, email, password } = req.body ?? req;
    if (!name || !email || !password) {
      return reply
        .status(400)
        .send({ error: "Campos obrigatórios: name, email, password" });
    }
    try {
      const [id] = await database("users").insert({ name, email, password });
      return reply.status(201).send({ id, name, email });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT" || error.code === "23505") {
        return reply.status(409).send({ error: "Email já cadastrado." });
      }
      console.log("Erro ao criar usuário:", error);
      return reply.status(500).send({ error: "Erro ao criar usuário." });
    }
  });

  // READ - Buscar usuário por ID
  app.get("/:id", async (req, reply) => {
    const { id } = req.params ?? req;
    try {
      const user = await database("users").where({ id }).first();
      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado." });
      }
      return reply.status(200).send(user);
    } catch (error) {
      console.log("Erro ao buscar usuário:", error);
      return reply.status(500).send({ error: "Erro ao buscar usuário." });
    }
  });
  // DELETE - Remover usuário
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params ?? req;
    try {
      const deleted = await database("users").where({ id }).del();
      if (deleted === 0) {
        return reply.status(404).send({ error: "Usuário não encontrado." });
      }
      return reply
        .status(200)
        .send({ message: "Usuário removido com sucesso." });
    } catch (error) {
      console.log("Erro ao remover usuário:", error);
      return reply.status(500).send({ error: "Erro ao remover usuário." });
    }
  });
  // UPDATE - Atualizar usuário
  app.put("/:id", async (req, reply) => {
    const { id } = req.params ?? req;
    const { name, email, password } = req.body ?? req;
    if (!name && !email && !password) {
      return reply.status(400).send({
        error:
          "Informe ao menos um campo para atualizar: name, email ou password.",
      });
    }
    try {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      const updated = await database("users").where({ id }).update(updateData);
      if (updated === 0) {
        return reply.status(404).send({ error: "Usuário não encontrado." });
      }
      return reply
        .status(200)
        .send({ message: "Usuário atualizado com sucesso." });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT" || error.code === "23505") {
        return reply.status(409).send({ error: "Email já cadastrado." });
      }
      console.log("Erro ao atualizar usuário:", error);
      return reply.status(500).send({ error: "Erro ao atualizar usuário." });
    }
  });
  // READ - Listar todos os usuários
  app.get("/all", async (req, reply) => {
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
      console.log("Erro ao buscar usuários:", error);
      return reply.status(500).send({ error: "Erro ao buscar usuários." });
    }
  });
}
