export async function up(knex) {
  await knex.schema.createTable("paket_wisata", (table) => {
    table.increments("id").primary();

    table.string("kode_paket").notNullable().unique();
    table.string("nama_paket").notNullable();
    table.string("kategori").notNullable();

    table.string("ikon").nullable();
    table.text("gambar_url").nullable();

    // paid    = paket berbayar
    // free    = paket gratis
    // consult = harga dikonfirmasi admin
    table.string("price_type").notNullable().defaultTo("consult");

    // Contoh:
    // Gratis
    // Mulai dari Rp25.000/orang
    // Menyesuaikan durasi dan kebutuhan
    table.string("price_label").notNullable().defaultTo("Menyesuaikan");

    // Nominal dasar / harga satuan.
    // paid isi nominal, free dan consult isi 0.
    table.integer("nominal").notNullable().defaultTo(0);

    table.boolean("payment_required").notNullable().defaultTo(false);

    table.string("durasi").notNullable();

    table.text("deskripsi_singkat").notNullable();
    table.text("deskripsi_detail").notNullable();

    table.text("cocok_untuk").nullable();

    // Isi array fasilitas dalam bentuk JSON
    table.json("fasilitas").nullable();

    table.boolean("aktif").notNullable().defaultTo(true);

    table.timestamps(true, true);

    table.index("kode_paket");
    table.index("kategori");
    table.index("price_type");
    table.index("aktif");
  });
}

export async function down(knex) {
  await knex.schema.dropTable("paket_wisata");
}