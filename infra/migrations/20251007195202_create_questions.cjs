/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('questions', (table) => {

    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('subject_id')
      .notNullable()
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');

    table.text('statement').notNullable();

    table.enu('type', ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'CODE']).notNullable();

    table.text('answer').nullable();

    table.enu('level', ['EASY', 'MEDIUM', 'HARD']).notNullable();

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('questions');
};
