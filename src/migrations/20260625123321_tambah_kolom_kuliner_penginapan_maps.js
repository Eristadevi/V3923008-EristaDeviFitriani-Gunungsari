const TABLE_NAME = "maps_destinations";

export async function up(knex) {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);

  // Kalau tabel belum ada, migration ini akan membuat tabel dari awal
  if (!hasTable) {
    await knex.schema.createTable(TABLE_NAME, (table) => {
      table.increments("id").primary();

      // Data utama lokasi
      table.string("title").notNullable();
      table.text("description").nullable();

      // Jenis tempat: wisata / kuliner / penginapan
      table.string("type").notNullable().defaultTo("wisata");

      // Koordinat lokasi
      table.decimal("latitude", 10, 7).notNullable();
      table.decimal("longitude", 10, 7).notNullable();

      // Gambar
      table.string("image_key").nullable();
      table.text("gambar_url").nullable();

      // Detail untuk card kuliner / penginapan
      table.text("alamat").nullable();
      table.string("label_harga").nullable();

      table.string("status_buka").nullable();
      table.string("jam_buka").nullable();
      table.string("nomor_telepon").nullable();

      table.string("label_jarak").nullable();

      // Contoh isi:
      // ["Menu rumahan", "Harga terjangkau", "Cocok rombongan"]
      table.json("keunggulan").nullable();

      table.boolean("direkomendasikan").notNullable().defaultTo(false);
      table.boolean("is_active").notNullable().defaultTo(true);

      table.integer("urutan_tampil").unsigned().notNullable().defaultTo(0);

      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").nullable();

      table.index(["type"]);
      table.index(["is_active"]);
      table.index(["direkomendasikan"]);
      table.index(["urutan_tampil"]);
    });

    return;
  }

  // Kalau tabel sudah ada, migration ini hanya menambah kolom yang belum ada
  const tambahKolomJikaBelumAda = async (namaKolom, callback) => {
    const exists = await knex.schema.hasColumn(TABLE_NAME, namaKolom);

    if (!exists) {
      await knex.schema.alterTable(TABLE_NAME, callback);
    }
  };

  await tambahKolomJikaBelumAda("gambar_url", (table) => {
    table.text("gambar_url").nullable();
  });

  await tambahKolomJikaBelumAda("alamat", (table) => {
    table.text("alamat").nullable();
  });

  await tambahKolomJikaBelumAda("label_harga", (table) => {
    table.string("label_harga").nullable();
  });

  await tambahKolomJikaBelumAda("status_buka", (table) => {
    table.string("status_buka").nullable();
  });

  await tambahKolomJikaBelumAda("jam_buka", (table) => {
    table.string("jam_buka").nullable();
  });

  await tambahKolomJikaBelumAda("nomor_telepon", (table) => {
    table.string("nomor_telepon").nullable();
  });

  await tambahKolomJikaBelumAda("label_jarak", (table) => {
    table.string("label_jarak").nullable();
  });

  await tambahKolomJikaBelumAda("keunggulan", (table) => {
    table.json("keunggulan").nullable();
  });

  await tambahKolomJikaBelumAda("direkomendasikan", (table) => {
    table.boolean("direkomendasikan").notNullable().defaultTo(false);
  });

  await tambahKolomJikaBelumAda("urutan_tampil", (table) => {
    table.integer("urutan_tampil").unsigned().notNullable().defaultTo(0);
  });

  try {
    await knex.schema.alterTable(TABLE_NAME, (table) => {
      table.index(["type"]);
      table.index(["is_active"]);
      table.index(["direkomendasikan"]);
      table.index(["urutan_tampil"]);
    });
  } catch (error) {
    console.log("Index kemungkinan sudah ada, migration tetap lanjut.");
  }
}

export async function down(knex) {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);

  if (!hasTable) return;

  const hapusKolomJikaAda = async (namaKolom) => {
    const exists = await knex.schema.hasColumn(TABLE_NAME, namaKolom);

    if (exists) {
      await knex.schema.alterTable(TABLE_NAME, (table) => {
        table.dropColumn(namaKolom);
      });
    }
  };

  await hapusKolomJikaAda("gambar_url");
  await hapusKolomJikaAda("alamat");
  await hapusKolomJikaAda("label_harga");
  await hapusKolomJikaAda("status_buka");
  await hapusKolomJikaAda("jam_buka");
  await hapusKolomJikaAda("nomor_telepon");
  await hapusKolomJikaAda("label_jarak");
  await hapusKolomJikaAda("keunggulan");
  await hapusKolomJikaAda("direkomendasikan");
  await hapusKolomJikaAda("urutan_tampil");
}
