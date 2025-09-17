import Knex from "knex";
import { env } from "./env/index.js";

export const database = Knex({
  client: "pg",
  connection: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
});
