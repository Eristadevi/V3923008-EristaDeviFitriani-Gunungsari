import midtransClient from "midtrans-client";
import crypto from "crypto";
import moment from "moment-timezone";

const {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION,
} = process.env;

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  throw new Error(
    "MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY wajib diisi di .env"
  );
}

const isProduction = MIDTRANS_IS_PRODUCTION === "true";

const snap = new midtransClient.Snap({
  isProduction,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const buatTransaksiMidtrans = async ({
  kodePesanan,
  nominal,
  dataPembeli,
  itemPembelian,
}) => {
  const waktuMulai = moment()
    .tz("Asia/Jakarta")
    .format("YYYY-MM-DD HH:mm:ss Z");

  const parameter = {
    transaction_details: {
      order_id: kodePesanan,
      gross_amount: nominal,
    },

    customer_details: {
      first_name: dataPembeli?.nama || "Pengunjung",
      email: dataPembeli?.email || "pengunjung@example.com",
      phone: dataPembeli?.telepon || "080000000000",
    },

    item_details: itemPembelian,

    expiry: {
      start_time: waktuMulai,
      unit: "hours",
      duration: 24,
    },
  };

  console.log("MIDTRANS MODE:", isProduction ? "PRODUCTION" : "SANDBOX");
  console.log("MIDTRANS CREATE ORDER ID:", kodePesanan);
  console.log("MIDTRANS GROSS AMOUNT:", nominal);

  const transaksi = await snap.createTransaction(parameter);

  console.log("MIDTRANS SNAP TOKEN:", transaksi.token);
  console.log("MIDTRANS REDIRECT URL:", transaksi.redirect_url);

  return {
    snap_token: transaksi.token,
    redirect_url: transaksi.redirect_url,
    order_id: kodePesanan,
  };
};

export const cekStatusMidtrans = async (kodePesanan) => {
  console.log("MIDTRANS CEK STATUS ORDER ID:", kodePesanan);
  console.log("MIDTRANS MODE CEK:", isProduction ? "PRODUCTION" : "SANDBOX");

  let lastError = null;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const status = await coreApi.transaction.status(kodePesanan);

      console.log("MIDTRANS STATUS RESPONSE:", status);

      return status;
    } catch (error) {
      lastError = error;

      console.log(
        `MIDTRANS CEK STATUS GAGAL PERCOBAAN ${attempt}:`,
        error.message
      );

      await delay(2000);
    }
  }

  throw lastError;
};

export const verifikasiSignatureMidtrans = (notifikasi) => {
  const { order_id, status_code, gross_amount, signature_key } = notifikasi;

  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest("hex");

  return hash === signature_key;
};

export const prosesNotifikasiMidtrans = async (notifikasi) => {
  if (!verifikasiSignatureMidtrans(notifikasi)) {
    throw new Error("Signature Midtrans tidak valid");
  }

  const {
    order_id,
    transaction_status,
    fraud_status,
    payment_type,
  } = notifikasi;

  let status = "menunggu";

  if (transaction_status === "settlement") {
    status = "dibayar";
  }

  if (transaction_status === "capture" && fraud_status === "accept") {
    status = "dibayar";
  }

  if (transaction_status === "expire") {
    status = "kedaluwarsa";
  }

  if (["deny", "cancel", "failure"].includes(transaction_status)) {
    status = "dibatalkan";
  }

  return {
    kodePesanan: order_id,
    status,
    jenisPembayaran: payment_type,
  };
};