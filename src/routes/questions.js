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

const listQuestionsQuerySchema = z.object({
    subject_id: z.string().uuid("O subject_id deve ser um UUID válido.").optional(),
    level: QuestionLevel.optional(),
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

    app.get("/", { preHandler: [authenticate] }, async (req, reply) => {
        try {
            const filters = listQuestionsQuerySchema.parse(req.query)

            const query = database("questions")
                .select(
                    "questions.id",
                    "questions.statement",
                    "questions.type",
                    "questions.answer",
                    "questions.level",
                    "questions.created_at",
                    "questions.updated_at",
                    "subjects.id as subject_id",
                    "subjects.name as subject_name"
                )
                .join("subjects", "questions.subject_id", "=", "subjects.id")
            
            if (filters.subject_id) {
                query.where("questions.subject_id", filters.subject_id)
            }

            if (filters.level) {
                query.where("questions.level", filters.level)
            }

            const questions = await query;

            const formattedQuestions = questions.map(q => ({
                id: q.id,
                statement: q.statement,
                type: q.type,
                answer: q.answer,
                level: q.level,
                created_at: q.created_at,
                updated_at: q.updated_at,
                subject: {
                    id: q.subject_id,
                    name: q.subject_name
                }
            }))
            return reply.status(200).send(formattedQuestions)

        } catch (error) {
            console.error("Erro ao listar questões:", error)
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ 
                    error: "Erro de Validação nos filtros.",
                    details: error.errors 
                })
            }
            return reply.status(500).send({ error: "Erro ao listar questões." })
        }
    })

    app.get("/:id", { preHandler: [authenticate] }, async (req, reply) => {
        try {
            const paramsSchema = z.object({
                id: z.string().uuid("ID de questão inválido."),
            })

            const { id } = paramsSchema.parse(req.params)

            const question = await database("questions")
                .select(
                    "questions.id",
                    "questions.statement",
                    "questions.type",
                    "questions.answer",
                    "questions.level",
                    "questions.created_at",
                    "questions.updated_at",
                    "subjects.id as subject_id",
                    "subjects.name as subject_name"
                )
                .join("subjects", "questions.subject_id", "=", "subjects.id")
                .where("questions.id", id) 
                .first()

            if (!question) {
                return reply.status(404).send({ error: "Questão não encontrada." })
            }

             const formattedQuestion = {
                id: question.id,
                statement: question.statement,
                type: question.type,
                answer: question.answer,
                level: question.level,
                created_at: question.created_at,
                updated_at: question.updated_at,
                subject: {
                    id: question.subject_id,
                    name: question.subject_name
                }
            }
            return reply.status(200).send(formattedQuestion);

        } catch (error) {
            console.error("Erro ao buscar questão por ID:", error)
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: error.errors })
            }
            return reply.status(500).send({ error: "Erro ao buscar questão." })
        }
    })
}
