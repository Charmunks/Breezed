export function up(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.string('creator_ip').nullable().alter();
    });
}

export function down(knex) {
    return knex.schema.alterTable('containers', (table) => {
        table.string('creator_ip').notNullable().alter();
    });
}
