export function up(knex) {
    return knex.schema.createTable('users', (table) => {
        table.uuid('user_id').primary().defaultTo(knex.fn.uuid());
        table.string('email').notNullable().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('last_login');
        table.boolean('admin').defaultTo(false);
    });
}

export function down(knex) {
    return knex.schema.dropTable('users');
}
