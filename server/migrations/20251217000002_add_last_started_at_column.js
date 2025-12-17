export function up(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.timestamp('last_started_at').defaultTo(knex.fn.now());
    });
}

export function down(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.dropColumn('last_started_at');
    });
}
