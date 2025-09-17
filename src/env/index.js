import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  ENV: z.enum(["development", "test", "production"]).default("production"),
  PORT: z.coerce.number().default(3000),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_DB: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("⚠ Invalid enviroment variables!", _env.error.format());

  throw new Error("⚠ Invalid enviroment variables!");
}

export const env = _env.data;
