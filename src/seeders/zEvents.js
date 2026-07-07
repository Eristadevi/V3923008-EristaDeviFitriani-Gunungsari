export async function seed(knex) {
  // Ambil data paket wisata berdasarkan nama paket
  const paketEdukasi = await knex("paket_wisata")
    .where("nama_paket", "Paket Wisata Edukasi")
    .first();

  const paketBudaya = await knex("paket_wisata")
    .where("nama_paket", "Paket Budaya & Seni")
    .first();

  const paketKuliner = await knex("paket_wisata")
    .where("nama_paket", "Paket Kuliner Lokal")
    .first();

  const paketLiveIn = await knex("paket_wisata")
    .where("nama_paket", "Paket Live In Desa")
    .first();

  const paketHijau = await knex("paket_wisata")
    .where("nama_paket", "Paket Pariwisata Hijau")
    .first();

  // Hapus data lama agar tidak dobel saat seed dijalankan ulang
  await knex("events").del();

  await knex("events").insert([
    {
      paket_id: paketBudaya?.id || null,
      title: "Festival Budaya Gunungsari",
      slug: "festival-budaya-gunungsari",
      category: "Event Budaya",
      event_date: "2026-07-12",
      location: "Desa Gunungsari",
      image_url: null,
      description:
        "Nikmati pertunjukan seni tradisional, kuliner lokal, dan suasana budaya khas Desa Gunungsari.",
      detail:
        "Festival Budaya Gunungsari merupakan agenda desa yang menghadirkan pertunjukan seni tradisional, kirab budaya, kuliner lokal, serta kegiatan edukatif untuk memperkenalkan potensi budaya Desa Gunungsari kepada wisatawan.",
      is_active: true,
      urutan: 1,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      paket_id: paketEdukasi?.id || null,
      title: "Edukasi Pertanian Gunungsari",
      slug: "edukasi-pertanian-gunungsari",
      category: "Wisata Edukasi",
      event_date: "2026-07-20",
      location: "Area Edukasi Desa Gunungsari",
      image_url: null,
      description:
        "Belajar kebun kopi, budidaya padi, dan pengelolaan magot BSF bersama masyarakat desa.",
      detail:
        "Edukasi Pertanian Gunungsari mengajak pengunjung mengenal aktivitas pertanian desa, budidaya padi, kebun kopi, serta pengelolaan lingkungan berbasis masyarakat secara langsung.",
      is_active: true,
      urutan: 2,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      paket_id: paketKuliner?.id || null,
      title: "Jelajah Kuliner Lokal",
      slug: "jelajah-kuliner-lokal",
      category: "Kuliner Desa",
      event_date: "2026-07-28",
      location: "Area Wisata Gunungsari",
      image_url: null,
      description:
        "Rasakan kuliner khas desa dan produk UMKM lokal masyarakat Gunungsari.",
      detail:
        "Jelajah Kuliner Lokal merupakan kegiatan wisata yang memperkenalkan makanan khas, produk UMKM, serta cita rasa tradisional masyarakat Desa Gunungsari.",
      is_active: true,
      urutan: 3,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      paket_id: paketLiveIn?.id || null,
      title: "Live In Desa Gunungsari",
      slug: "live-in-desa-gunungsari",
      category: "Pengalaman Desa",
      event_date: "2026-08-03",
      location: "Desa Gunungsari",
      image_url: null,
      description:
        "Mengikuti kehidupan masyarakat desa secara langsung melalui kegiatan harian dan budaya lokal.",
      detail:
        "Live In Desa Gunungsari memberikan pengalaman tinggal dan berinteraksi langsung dengan masyarakat desa, mengenal kegiatan harian, budaya, serta nilai kebersamaan masyarakat lokal.",
      is_active: true,
      urutan: 4,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      paket_id: paketHijau?.id || null,
      title: "Gerakan Wisata Hijau Gunungsari",
      slug: "gerakan-wisata-hijau-gunungsari",
      category: "Alam",
      event_date: "2026-08-10",
      location: "Kawasan Wisata Gunungsari",
      image_url: null,
      description:
        "Wisata berbasis alam, budaya, dan keberlanjutan lingkungan.",
      detail:
        "Gerakan Wisata Hijau Gunungsari mengajak wisatawan mengenal konsep wisata berkelanjutan melalui kegiatan berbasis alam, budaya, dan kepedulian terhadap lingkungan desa.",
      is_active: true,
      urutan: 5,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}