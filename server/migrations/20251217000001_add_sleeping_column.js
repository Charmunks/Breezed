export function up(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.boolean('sleeping').defaultTo(false);
    });
}

export function down(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.dropColumn('sleeping');
    });
}
