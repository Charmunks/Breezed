export function up(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.integer('max_containers').defaultTo(5);
        table.integer('max_active_containers').defaultTo(1);
    });
}

export function down(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('max_containers');
        table.dropColumn('max_active_containers');
    });
}
