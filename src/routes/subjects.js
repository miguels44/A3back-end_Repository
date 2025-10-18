import { database } from "../../infra/database.js"
import { z } from "zod"
import { authenticate } from "./session.js"

export async function subjectsRoutes(app) {
    app.post("/", { preHandler: [authenticate] }, async (req, reply) => {
        try {
            const bodySchema = z.object({
                name: z.string().min(1, "O nome da disciplina é obrigatório."),
            })

            const { name } = bodySchema.parse(req.body)

            const existing = await database("subjects").where({ name }).first()
            if (existing) {
                return reply.status(409).send({ error: "Disciplina com este nome já cadastrada." })
            }

            const [subject] = await database("subjects")
                .insert({ name })
                .returning(["id", "name", "created_at", "updated_at"])
            return reply.status(201).send(subject)

        } catch (error) {
            console.error(error)
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: error.errors })
            }
            return reply.status(500).send({ error: "Erro ao cadastrar disciplina." })
        }
    })

    app.get("/", { preHandler: [authenticate] }, async (req, reply) => { 
        try {
            const subjects = await database("subjects").select(
                "id",
                "name",
                "created_at",
                "updated_at"
            )
            return reply.status(200).send(subjects);

        } catch (error) {
            console.error(error)
            return reply.status(500).send({ error: "Erro ao listar disciplinas." })
        }
    })

    app.get("/:id", { preHandler: [authenticate] }, async (req, reply) => {
        try {
            const paramsSchema = z.object({
                id: z.string().uuid("ID de disciplina inválido."),
            })

            const { id } = paramsSchema.parse(req.params)

            const subject = await database("subjects")
                .select("id", "name", "created_at", "updated_at")
                .where({ id })
                .first()

            if (!subject) {
                return reply.status(404).send({ error: "Disciplina não encontrada." })
            }
            return reply.status(200).send(subject)

        } catch (error) {
            console.error(error)
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: error.errors })
            }
            return reply.status(500).send({ error: "Erro ao buscar disciplina." })
        }
    })
}
