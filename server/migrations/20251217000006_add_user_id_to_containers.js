export function up(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.uuid('user_id').references('user_id').inTable('users').onDelete('SET NULL');
    });
}

export function down(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.dropColumn('user_id');
    });
}
