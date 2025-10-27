import { database } from "../../infra/database.js";
import { z } from "zod";
import { authenticate } from "./session.js";

export async function questionOptionsRoutes(app) {
  app.post(
    "/:questionId/options",
    { preHandler: [authenticate] },
    async (req, reply) => {
      try {
        const paramsSchema = z.object({
          questionId: z.string().uuid("ID da questão inválido."),
        });

        const bodySchema = z.object({
          option_text: z.string().min(1, "Texto da alternativa é obrigatório."),
          isCorrect: z.boolean({
            required_error: "O campo isCorrect é obrigatório.",
          }),
        });

        const { questionId } = paramsSchema.parse(req.params);
        const { option_text, isCorrect } = bodySchema.parse(req.body);

        const question = await database("questions")
          .where({ id: questionId })
          .first();

        if (!question) {
          return reply.status(404).send({ error: "Questão não encontrada." });
        }

        if (isCorrect) {
          await database("question_options")
            .where({ question_id: questionId })
            .update({ isCorrect: false });
        }

        const [option] = await database("question_options")
          .insert({
            question_id: questionId,
            option_text,
            isCorrect,
          })
          .returning([
            "id",
            "question_id",
            "option_text",
            "isCorrect",
            "created_at",
            "updated_at",
          ]);

        return reply.status(201).send(option);
      } catch (error) {
        console.error("Erro ao criar alternativa:", error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: "Erro de Validação.",
            details: error.errors,
          });
        }
        return reply
          .status(500)
          .send({ error: "Erro ao criar alternativa." });
      }
    }
  );

  app.get(
    "/:questionId/options",
    { preHandler: [authenticate] },
    async (req, reply) => {
      try {
        const paramsSchema = z.object({
          questionId: z.string().uuid("ID da questão inválido."),
        });

        const { questionId } = paramsSchema.parse(req.params);

        const question = await database("questions")
          .where({ id: questionId })
          .first();

        if (!question) {
          return reply.status(404).send({ error: "Questão não encontrada." });
        }

        const options = await database("question_options")
          .select(
            "id",
            "question_id",
            "option_text",
            "isCorrect",
            "created_at",
            "updated_at"
          )
          .where({ question_id: questionId })
          .orderBy("created_at", "asc");

        return reply.status(200).send(options);
      } catch (error) {
        console.error("Erro ao listar alternativas:", error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: "Erro de Validação.",
            details: error.errors,
          });
        }
        return reply
          .status(500)
          .send({ error: "Erro ao listar alternativas." });
      }
    }
  );


  app.put(
    "/options/:optionId",
    { preHandler: [authenticate] },
    async (req, reply) => {
      try {
        const paramsSchema = z.object({
          optionId: z.string().uuid("ID da alternativa inválido."),
        });

        const bodySchema = z.object({
          option_text: z
            .string()
            .min(1, "O texto da alternativa não pode ser vazio.")
            .optional(),
          isCorrect: z.boolean().optional(),
        });

        const { optionId } = paramsSchema.parse(req.params);
        const dataToUpdate = bodySchema.parse(req.body);

        if (Object.keys(dataToUpdate).length === 0) {
          return reply
            .status(400)
            .send({ error: "Nenhum campo fornecido para atualização." });
        }

        const option = await database("question_options")
          .where({ id: optionId })
          .first();

        if (!option) {
          return reply
            .status(404)
            .send({ error: "Alternativa não encontrada." });
        }

        if (dataToUpdate.isCorrect === true) {
          await database("question_options")
            .where({ question_id: option.question_id })
            .whereNot({ id: optionId })
            .update({ isCorrect: false });
        }

        const [updated] = await database("question_options")
          .where({ id: optionId })
          .update(
            {
              ...dataToUpdate,
              updated_at: database.fn.now(),
            },
            [
              "id",
              "question_id",
              "option_text",
              "isCorrect",
              "created_at",
              "updated_at",
            ]
          );

        return reply.status(200).send(updated);
      } catch (error) {
        console.error("Erro ao atualizar alternativa:", error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: "Erro de Validação.",
            details: error.errors,
          });
        }
        return reply
          .status(500)
          .send({ error: "Erro ao atualizar alternativa." });
      }
    }
  );

  app.delete(
    "/options/:optionId",
    { preHandler: [authenticate] },
    async (req, reply) => {
      try {
        const paramsSchema = z.object({
          optionId: z.string().uuid("ID da alternativa inválido."),
        });

        const { optionId } = paramsSchema.parse(req.params);
        const deletedCount = await database("question_options")
          .where({ id: optionId })
          .del();

        if (deletedCount === 0) {
          return reply
            .status(404)
            .send({ error: "Alternativa não encontrada para remoção." });
        }

        return reply.status(204).send();
      } catch (error) {
        console.error("Erro ao remover alternativa:", error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        return reply
          .status(500)
          .send({ error: "Erro ao remover alternativa." });
      }
    }
  );
}