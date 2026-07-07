export async function up(knex) {
  await knex.schema.createTable("events", (table) => {
    table.increments("id").primary();

    table
      .integer("paket_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("paket_wisata")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.string("title").notNullable();
    table.string("slug").notNullable().unique();
    table.string("category").nullable();

    table.date("event_date").nullable();
    table.string("location").nullable();

    table.text("image_url").nullable();

    table.text("description").notNullable();
    table.text("detail").nullable();

    table.boolean("is_active").notNullable().defaultTo(true);
    table.integer("urutan").notNullable().defaultTo(0);

    table.timestamps(true, true);

    table.index("paket_id");
    table.index("slug");
    table.index("is_active");
    table.index("urutan");
    table.index("event_date");
  });
}

export async function down(knex) {
  await knex.schema.dropTable("events");
}