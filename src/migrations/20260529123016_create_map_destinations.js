export async function up(knex) {
  await knex.schema.createTable("map_destinations", function (table) {
    table.increments("id").primary();

    table.string("title", 150).notNullable();
    table.text("description").nullable();

    table
      .enu("type", ["wisata", "kuliner", "penginapan"])
      .notNullable()
      .defaultTo("wisata");

    table.decimal("latitude", 10, 7).notNullable();
    table.decimal("longitude", 10, 7).notNullable();

    table.string("image_key", 100).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").nullable();

    table.index("title");
    table.index("type");
    table.index("is_active");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("map_destinations");
}