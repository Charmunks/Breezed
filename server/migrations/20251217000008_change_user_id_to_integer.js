export async function up(knex) {
    await knex.schema.alterTable('auth_tokens', (table) => {
        table.dropForeign('user_id');
    });

    await knex.schema.alterTable('containers', (table) => {
        table.dropForeign('user_id');
    });

    await knex('auth_tokens').del();
    await knex('containers').update({ user_id: null });
    await knex('users').del();

    await knex.schema.alterTable('auth_tokens', (table) => {
        table.dropColumn('user_id');
    });

    await knex.schema.alterTable('containers', (table) => {
        table.dropColumn('user_id');
    });

    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('user_id');
    });

    await knex.schema.alterTable('users', (table) => {
        table.increments('user_id').primary();
    });

    await knex.schema.alterTable('auth_tokens', (table) => {
        table.integer('user_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    });

    await knex.schema.alterTable('containers', (table) => {
        table.integer('user_id').unsigned().references('user_id').inTable('users').onDelete('SET NULL');
    });
}

export async function down(knex) {
    await knex.schema.alterTable('auth_tokens', (table) => {
        table.dropForeign('user_id');
        table.dropColumn('user_id');
    });

    await knex.schema.alterTable('containers', (table) => {
        table.dropForeign('user_id');
        table.dropColumn('user_id');
    });

    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('user_id');
    });

    await knex.schema.alterTable('users', (table) => {
        table.uuid('user_id').primary().defaultTo(knex.fn.uuid());
    });

    await knex.schema.alterTable('auth_tokens', (table) => {
        table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    });

    await knex.schema.alterTable('containers', (table) => {
        table.uuid('user_id').references('user_id').inTable('users').onDelete('SET NULL');
    });
}
