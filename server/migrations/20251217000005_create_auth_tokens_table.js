export function up(knex) {
    return knex.schema.createTable('auth_tokens', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
        table.string('token', 64).notNullable().unique();
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.index('token');
    });
}

export function down(knex) {
    return knex.schema.dropTable('auth_tokens');
}
