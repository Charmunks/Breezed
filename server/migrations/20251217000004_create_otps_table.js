export function up(knex) {
    return knex.schema.createTable('otps', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.string('email').notNullable();
        table.string('otp', 6).notNullable();
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.index('email');
    });
}

export function down(knex) {
    return knex.schema.dropTable('otps');
}
