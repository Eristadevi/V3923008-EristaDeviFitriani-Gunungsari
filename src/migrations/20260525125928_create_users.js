export async function up(knex) {
  await knex.schema.createTable("users", function (table) {
    table.string("id", 100).primary();

    table.string("username", 50).notNullable().unique();
    table.string("nama_lengkap", 100).notNullable();
    table.string("nomor_telepon", 20).nullable();

    table.string("email", 150).notNullable().unique();
    table.string("password", 255).notNullable();

    table
      .enu("role", ["pengguna", "admin"])
      .notNullable()
      .defaultTo("pengguna");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").nullable();

    table.index("username");
    table.index("email");
    table.index("role");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}