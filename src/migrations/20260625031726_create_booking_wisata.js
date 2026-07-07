export async function up(knex) {
  await knex.schema.createTable("booking_wisata", (table) => {
    table.increments("id").primary();

    // User yang melakukan booking.
    // Kalau user harus login, ini akan diisi dari token.
    table.integer("user_id").unsigned().nullable();

    // ID wisata dari frontend.
    // Dibuat nullable agar tetap aman kalau data wisata masih statis dari aplikasi.
    table.integer("wisata_id").unsigned().nullable();

    // Kode booking unik untuk ditampilkan ke user dan admin
    table.string("kode_booking").notNullable().unique();

    // Snapshot data wisata saat user melakukan booking
    table.string("nama_wisata").notNullable();
    table.string("kategori").nullable();

    // Data rombongan / pengunjung
    table.string("nama_pengunjung").notNullable();
    table.string("nomor_hp").notNullable();
    table.string("tanggal_kunjungan").notNullable();
    table.integer("jumlah_orang").notNullable().defaultTo(1);
    table.text("catatan").nullable();

    // Snapshot harga saat booking
    // free = gratis
    // paid = berbayar
    // consult = menyesuaikan / ditentukan admin
    table.string("price_type").notNullable().defaultTo("free");
    table.string("price_label").notNullable().defaultTo("Tiket masuk gratis");

    // Harga satuan per orang
    // Untuk wisata gratis isi 0
    table.integer("nominal_satuan").notNullable().defaultTo(0);

    // Total = nominal_satuan x jumlah_orang
    // Untuk free isi 0
    table.integer("total_nominal").notNullable().defaultTo(0);

    // Status booking:
    // menunggu_konfirmasi = user sudah booking, menunggu admin
    // menunggu_pembayaran = booking berbayar dan belum dibayar
    // dikonfirmasi = admin menerima booking
    // selesai = kunjungan sudah selesai
    // dibatalkan = booking dibatalkan
    table
      .string("status_booking")
      .notNullable()
      .defaultTo("menunggu_konfirmasi");

    // Status pembayaran:
    // tidak_perlu = wisata gratis
    // bayar_di_lokasi = pembayaran dilakukan di tempat
    // menunggu = menunggu pembayaran online
    // dibayar = pembayaran berhasil
    // dibatalkan = pembayaran dibatalkan
    // kedaluwarsa = pembayaran expired
    table
      .string("status_pembayaran")
      .notNullable()
      .defaultTo("tidak_perlu");

    // Pilihan pembayaran dari aplikasi:
    // pay_at_location
    // qris
    // bank_transfer
    // ewallet
    table.string("metode_pembayaran").nullable();

    // Jenis pembayaran aktual dari payment gateway:
    // qris, bank_transfer, gopay, shopeepay, dll.
    table.string("jenis_pembayaran").nullable();

    // Data transaksi online jika suatu saat wisata berbayar memakai Midtrans
    table.string("snap_token").nullable();
    table.text("redirect_url").nullable();

    table.timestamps(true, true);

    table.index("user_id");
    table.index("wisata_id");
    table.index("kode_booking");
    table.index("status_booking");
    table.index("status_pembayaran");
    table.index("price_type");
  });
}

export async function down(knex) {
  await knex.schema.dropTable("booking_wisata");
}