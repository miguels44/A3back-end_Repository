/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('progress', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    table.uuid('question_id')
      .notNullable()
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');

    table.uuid('student_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.boolean('is_correct').nullable();
    table.text('answer').nullable();
    table.text('explanation').nullable();
    table.decimal('accuracy', 5, 2).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = async function (knex) {
  await knex.schema.dropTable('progress')

}

