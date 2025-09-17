import Knex from "knex";
import { env } from "../src/env/index.js";

export const config = {
  client: "pg",
  connection: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
  migrations: {
    directory: "./infra/migrations",
  },
};
export const database = Knex(config);
