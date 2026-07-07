export async function up(knex) {
  await knex.schema.createTable("pemesanan_wisata", (table) => {
    table.increments("id").primary();

    // Jika user login, user_id bisa diisi.
    // Jika pengunjung umum, boleh null.
    table.integer("user_id").unsigned().nullable();

    table.integer("paket_id").unsigned().notNullable();

    // Kode pesanan untuk Midtrans
    table.string("kode_pesanan").notNullable().unique();

    // Snapshot data paket saat user melakukan pemesanan
    table.string("nama_paket").notNullable();
    table.string("kategori").nullable();

    // Data form pengunjung
    table.string("nama_pengunjung").notNullable();
    table.string("nomor_hp").notNullable();
    table.string("tanggal_kunjungan").notNullable();
    table.integer("jumlah_orang").notNullable();
    table.text("catatan").nullable();

    // Snapshot harga saat pemesanan
    table.string("price_type").notNullable();
    table.string("price_label").notNullable();

    // Harga satuan paket
    table.integer("nominal_satuan").notNullable().defaultTo(0);

    // Total = nominal_satuan x jumlah_orang
    // Untuk free dan consult isi 0
    table.integer("total_nominal").notNullable().defaultTo(0);

    // Status pesanan:
    // menunggu_konfirmasi
    // menunggu_pembayaran
    // dikonfirmasi
    // selesai
    // dibatalkan
    table
      .string("status_pesanan")
      .notNullable()
      .defaultTo("menunggu_konfirmasi");

    // Status pembayaran:
    // tidak_perlu
    // menunggu
    // dibayar
    // dibatalkan
    // kedaluwarsa
    table
      .string("status_pembayaran")
      .notNullable()
      .defaultTo("tidak_perlu");

    // Pilihan dari aplikasi:
    // qris
    // bank_transfer
    // ewallet
    // pay_at_location
    table.string("metode_pembayaran").nullable();

    // Jenis pembayaran aktual dari Midtrans:
    // qris, bank_transfer, gopay, shopeepay, dll.
    table.string("jenis_pembayaran").nullable();

    // Data transaksi Midtrans
    table.string("snap_token").nullable();
    table.text("redirect_url").nullable();

    table.timestamps(true, true);

    table
      .foreign("paket_id")
      .references("id")
      .inTable("paket_wisata")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table.index("paket_id");
    table.index("kode_pesanan");
    table.index("status_pesanan");
    table.index("status_pembayaran");
    table.index("price_type");
  });
}

export async function down(knex) {
  await knex.schema.dropTable("pemesanan_wisata");
}