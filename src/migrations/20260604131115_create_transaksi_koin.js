export async function up(knex) {
  await knex.schema.createTable("transaksi_koin", (table) => {
    table.increments("id").primary();

    // User yang membeli koin
    table.integer("user_id").unsigned().nullable();

    // Data transaksi Midtrans
    table.string("kode_pesanan").notNullable().unique();
    table.integer("nominal").notNullable();

    // Status transaksi:
    // menunggu = belum bayar
    // dibayar = sudah bayar
    // dibatalkan = transaksi gagal/batal
    // kedaluwarsa = transaksi expired
    // ditukar = koin sudah ditukar di lokasi
    table.string("status").notNullable().defaultTo("menunggu");

    table.string("jenis_pembayaran").nullable();
    table.string("snap_token").nullable();
    table.text("redirect_url").nullable();

    // Kode bukti penukaran koin bambu
    table.string("kode_penukaran").nullable().unique();
    table.boolean("sudah_ditukar").notNullable().defaultTo(false);
    table.timestamp("waktu_ditukar").nullable();

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTable("transaksi_koin");
}