export function up(knex) {
    return knex.schema.createTable('containers', (table) => {
        table.string('container_id').primary();
        table.string('name').notNullable().unique();
        table.string('password').notNullable();
        table.integer('port').notNullable();
        table.string('creator_ip').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export function down(knex) {
    return knex.schema.dropTable('containers');
}
