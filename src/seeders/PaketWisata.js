import { db } from "../core/config/knex.js";

const paketWisata = [
  {
    kode_paket: "PKT-EDUKASI",
    nama_paket: "Paket Wisata Edukasi",
    kategori: "Edukasi",
    ikon: "book-open",
    gambar_url: null,

    price_type: "paid",
    price_label: "Mulai dari Rp25.000/orang",
    nominal: 25000,
    payment_required: true,

    durasi: "2 - 3 jam",

    deskripsi_singkat:
      "Belajar kebun kopi, budidaya padi, dan pengelolaan magot BSF.",

    deskripsi_detail:
      "Paket Wisata Edukasi cocok untuk pelajar, mahasiswa, keluarga, dan komunitas. Pengunjung dapat belajar langsung tentang kehidupan desa, pertanian, kebun kopi, budidaya padi, serta pengelolaan magot BSF.",

    cocok_untuk: "Sekolah, mahasiswa, komunitas, keluarga",

    fasilitas: JSON.stringify([
      "Pendamping kegiatan",
      "Area edukasi desa",
      "Sesi praktik sederhana",
      "Sesi tanya jawab",
      "Dokumentasi kegiatan",
    ]),

    aktif: true,
  },

  {
    kode_paket: "PKT-BUDAYA",
    nama_paket: "Paket Budaya & Seni",
    kategori: "Budaya",
    ikon: "music",
    gambar_url: null,

    price_type: "paid",
    price_label: "Mulai dari Rp20.000/orang",
    nominal: 20000,
    payment_required: true,

    durasi: "1 - 2 jam",

    deskripsi_singkat:
      "Mengenal seni tradisional, festival budaya, dan aksara Jawa.",

    deskripsi_detail:
      "Paket Budaya & Seni mengenalkan wisatawan pada kebudayaan lokal Gunungsari melalui seni tradisional, pengenalan aksara Jawa, serta kegiatan budaya masyarakat desa.",

    cocok_untuk: "Keluarga, sekolah, komunitas budaya, wisatawan umum",

    fasilitas: JSON.stringify([
      "Pendamping budaya",
      "Pengenalan seni tradisional",
      "Workshop aksara Jawa",
      "Area pertunjukan",
      "Dokumentasi budaya",
    ]),

    aktif: true,
  },

  {
    kode_paket: "PKT-KULINER",
    nama_paket: "Paket Kuliner Lokal",
    kategori: "Kuliner",
    ikon: "coffee",
    gambar_url: null,

    price_type: "consult",
    price_label: "Menyesuaikan pilihan kuliner",
    nominal: 0,
    payment_required: false,

    durasi: "45 menit - 1 jam",

    deskripsi_singkat:
      "Mencicipi makanan lokal dan mengenal produk UMKM desa.",

    deskripsi_detail:
      "Paket Kuliner Lokal menghadirkan pengalaman mencicipi makanan khas desa, mengenal produk UMKM, serta memahami potensi ekonomi kreatif masyarakat Gunungsari. Harga paket dapat menyesuaikan pilihan menu, jumlah peserta, dan kebutuhan kunjungan.",

    cocok_untuk: "Wisatawan umum, keluarga, pecinta kuliner",

    fasilitas: JSON.stringify([
      "Produk UMKM lokal",
      "Kuliner khas desa",
      "Area makan sederhana",
      "Cerita produk lokal",
    ]),

    aktif: true,
  },

  {
    kode_paket: "PKT-LIVEIN",
    nama_paket: "Paket Live In Desa",
    kategori: "Pengalaman",
    ikon: "home",
    gambar_url: null,

    price_type: "consult",
    price_label: "Menyesuaikan durasi dan kebutuhan",
    nominal: 0,
    payment_required: false,

    durasi: "1 - 2 hari",

    deskripsi_singkat:
      "Mengikuti kehidupan masyarakat desa secara langsung.",

    deskripsi_detail:
      "Paket Live In Desa memberikan pengalaman tinggal dan beraktivitas bersama masyarakat lokal. Pengunjung dapat mengenal kehidupan desa, budaya masyarakat, dan kegiatan sehari-hari warga Gunungsari. Harga akan menyesuaikan durasi, jumlah peserta, dan kebutuhan kegiatan.",

    cocok_untuk: "Pelajar, mahasiswa, komunitas, wisatawan budaya",

    fasilitas: JSON.stringify([
      "Pendamping lokal",
      "Aktivitas bersama warga",
      "Pengenalan kehidupan desa",
      "Interaksi masyarakat",
      "Pengalaman budaya lokal",
    ]),

    aktif: true,
  },

  {
    kode_paket: "PKT-HIJAU",
    nama_paket: "Paket Pariwisata Hijau",
    kategori: "Alam",
    ikon: "feather",
    gambar_url: null,

    price_type: "free",
    price_label: "Gratis",
    nominal: 0,
    payment_required: false,

    durasi: "1 - 2 jam",

    deskripsi_singkat:
      "Wisata berbasis alam, budaya, dan keberlanjutan lingkungan.",

    deskripsi_detail:
      "Paket Pariwisata Hijau mengajak pengunjung menikmati suasana desa yang asri sambil mengenal konsep wisata berkelanjutan, pelestarian lingkungan, dan pemberdayaan masyarakat lokal. Paket ini dapat digunakan sebagai pengenalan awal wisata desa.",

    cocok_untuk: "Keluarga, komunitas lingkungan, wisatawan umum",

    fasilitas: JSON.stringify([
      "Pendamping lokal",
      "Edukasi lingkungan",
      "Suasana alam desa",
      "Pengenalan wisata berkelanjutan",
    ]),

    aktif: true,
  },
];

const createPaketWisata = async () => {
  try {
    console.log("Mulai membuat seed paket wisata...");

    for (const paket of paketWisata) {
      const existing = await db("paket_wisata")
        .where("kode_paket", paket.kode_paket)
        .first();

      if (existing) {
        await db("paket_wisata")
          .where("kode_paket", paket.kode_paket)
          .update({
            ...paket,
            updated_at: db.fn.now(),
          });

        console.log(`Update paket: ${paket.nama_paket}`);
      } else {
        await db("paket_wisata").insert({
          ...paket,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        });

        console.log(`Tambah paket: ${paket.nama_paket}`);
      }
    }

    console.log("Seed paket wisata selesai.");
  } catch (error) {
    console.error("Gagal membuat seed paket wisata:", error.message);
  } finally {
    await db.destroy();
  }
};

createPaketWisata();