import { database } from "../../infra/database.js"
import { z } from "zod"
import { authenticate } from "./session.js"

const QuestionType = z.enum([
    "MULTIPLE_CHOICE", 
    "TRUE_OR_FALSE", 
    "ESSAY"
], {
    errorMap: () => ({ message: "O tipo de questão é inválido. Valores aceitos: MULTIPLE_CHOICE, TRUE_OR_FALSE, ESSAY." })
})

const QuestionLevel = z.enum([
    "EASY", 
    "MEDIUM", 
    "HARD"
], {
    errorMap: () => ({ message: "O nível de dificuldade é inválido. Valores aceitos: EASY, MEDIUM, HARD." })
})

export async function questionsRoutes(app) {
    app.post("/", { preHandler: [authenticate] }, async (req, reply) => {
        try {
            const bodySchema = z.object({
                statement: z.string().min(1, "O enunciado da questão é obrigatório."),
                subject_id: z.string().uuid("O subject_id deve ser um UUID válido."),
                type: QuestionType,
                answer: z.string().min(1, "A resposta da questão é obrigatória."),
                level: QuestionLevel,
            })

            const validatedBody = bodySchema.parse(req.body)

            const { subject_id, ...questionData } = validatedBody

            const subject = await database("subjects").where({ id: subject_id }).first()

            if (!subject) {
                return reply.status(400).send({
                    error: "Disciplina Inválida.",
                    message: `O subject_id ${subject_id} não corresponde a nenhuma disciplina existente.`,
                })
            }

            const [question] = await database("questions")
                .insert({
                    ...questionData,
                    subject_id,
                })
                .returning(["id", "statement", "subject_id", "type", "answer", "level", "created_at", "updated_at"])
            return reply.status(201).send(question)

        } catch (error) {
            console.error("Erro ao criar questão:", error)
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ 
                    error: "Erro de Validação.",
                    details: error.errors 
                })
            }
            return reply.status(500).send({ error: "Erro ao cadastrar questão." })
        }
    })
}
