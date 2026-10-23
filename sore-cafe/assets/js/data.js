/* Data menu SORE. Harga dalam rupiah, sudah termasuk pajak. */
(function () {
  "use strict";

  var MENU = [
    {
      id: "es-kopi-susu",
      nama: "Es Kopi Susu Sore",
      kategori: "kopi",
      harga: 28000,
      deskripsi: "Espresso, susu segar, gula aren. Gelas 300 ml, disajikan dingin.",
      img: "assets/img/es-kopi-susu.jpg",
      tag: "Paling dicari"
    },
    {
      id: "americano",
      nama: "Americano",
      kategori: "kopi",
      harga: 25000,
      deskripsi: "Dua shot espresso dan air. Panas atau es, pahitnya bersih.",
      img: "assets/img/americano.jpg"
    },
    {
      id: "cappuccino",
      nama: "Cappuccino",
      kategori: "kopi",
      harga: 30000,
      deskripsi: "Espresso, susu steamed, foam tipis. Tanpa kayu manis.",
      img: "assets/img/cappuccino.jpg"
    },
    {
      id: "flat-white",
      nama: "Flat White",
      kategori: "kopi",
      harga: 32000,
      deskripsi: "Double ristretto, susu microfoam. Ukuran 180 ml.",
      img: "assets/img/flat-white.jpg"
    },
    {
      id: "v60-gayo",
      nama: "Chemex Gayo",
      kategori: "kopi",
      harga: 35000,
      deskripsi: "Single origin Aceh, diseduh manual di Chemex. Notes jeruk dan gula palem.",
      img: "assets/img/v60.jpg"
    },
    {
      id: "cortado",
      nama: "Cortado",
      kategori: "kopi",
      harga: 30000,
      deskripsi: "Espresso dan susu hangat dengan perbandingan sama. Kecil, kuat.",
      img: "assets/img/cortado.jpg"
    },
    {
      id: "espresso-tonic",
      nama: "Espresso Tonic",
      kategori: "kopi",
      harga: 33000,
      deskripsi: "Espresso, tonic dingin, irisan jeruk. Diminum sebelum es mencair.",
      img: "assets/img/espresso-tonic.jpg",
      tag: "Baru"
    },
    {
      id: "affogato",
      nama: "Affogato",
      kategori: "kopi",
      harga: 32000,
      deskripsi: "Espresso panas di atas es krim vanila. Makan pakai sendok.",
      img: "assets/img/affogato.jpg"
    },
    {
      id: "matcha-latte",
      nama: "Matcha Latte",
      kategori: "non-kopi",
      harga: 33000,
      deskripsi: "Matcha Uji, susu segar, tanpa gula tambahan.",
      img: "assets/img/matcha.jpg"
    },
    {
      id: "cokelat-panas",
      nama: "Cokelat Panas",
      kategori: "non-kopi",
      harga: 30000,
      deskripsi: "Dark chocolate 70%, susu, sedikit garam laut.",
      img: "assets/img/cokelat.jpg"
    },
    {
      id: "teh-serai",
      nama: "Teh Serai Madu",
      kategori: "non-kopi",
      harga: 25000,
      deskripsi: "Serai segar dan madu. Panas atau es.",
      img: "assets/img/teh-serai.jpg"
    },
    {
      id: "mocktail-sore",
      nama: "Mocktail Sore",
      kategori: "non-kopi",
      harga: 30000,
      deskripsi: "Stroberi, jeruk nipis, soda, mint. Tanpa alkohol.",
      img: "assets/img/mocktail.jpg"
    },
    {
      id: "lemon-tea",
      nama: "Lemon Tea",
      kategori: "non-kopi",
      harga: 24000,
      deskripsi: "Teh hitam, lemon, es. Manisnya bisa diminta kurang.",
      img: "assets/img/lemon-tea.jpg"
    },
    {
      id: "strawberry-milk",
      nama: "Strawberry Milk",
      kategori: "non-kopi",
      harga: 28000,
      deskripsi: "Stroberi segar, susu, sedikit vanila.",
      img: "assets/img/strawberry-milk.jpg"
    },
    {
      id: "nasi-goreng",
      nama: "Nasi Goreng Kampung",
      kategori: "makanan",
      harga: 45000,
      deskripsi: "Telur mata sapi, kerupuk, acar, sambal terasi.",
      img: "assets/img/nasi-goreng.jpg"
    },
    {
      id: "rice-bowl",
      nama: "Rice Bowl Ayam Sambal",
      kategori: "makanan",
      harga: 46000,
      deskripsi: "Nasi hangat, ayam suwir, sambal matah, telur rebus setengah.",
      img: "assets/img/rice-bowl.jpg",
      tag: "Dapur"
    },
    {
      id: "mie-goreng",
      nama: "Mie Goreng Jawa",
      kategori: "makanan",
      harga: 42000,
      deskripsi: "Mie kuning, telur, kol, kecap manis. Pedasnya terpisah.",
      img: "assets/img/mie-goreng.jpg"
    },
    {
      id: "soto-ayam",
      nama: "Soto Ayam Kampung",
      kategori: "makanan",
      harga: 40000,
      deskripsi: "Kuah bening, ayam suwir, koya, sambal. Dengan nasi.",
      img: "assets/img/soto.jpg"
    },
    {
      id: "sandwich-jagung",
      nama: "Sandwich Jagung",
      kategori: "makanan",
      harga: 42000,
      deskripsi: "Roti panggang, jagung manis, keju, saus mayo. Dipotong dua.",
      img: "assets/img/sandwich.jpg"
    },
    {
      id: "pasta-pomodoro",
      nama: "Pasta Pomodoro",
      kategori: "makanan",
      harga: 48000,
      deskripsi: "Penne, tomat, bawang putih, basil, parmesan.",
      img: "assets/img/aglio-olio.jpg"
    },
    {
      id: "omelet-keju",
      nama: "Omelet Keju",
      kategori: "makanan",
      harga: 38000,
      deskripsi: "Tiga telur, cheddar, daun bawang. Dengan roti panggang.",
      img: "assets/img/omelet.jpg"
    },
    {
      id: "french-toast",
      nama: "French Toast Sore",
      kategori: "makanan",
      harga: 34000,
      deskripsi: "Roti gandum, pisang, madu, butter. Untuk pagi yang lambat.",
      img: "assets/img/french-toast.jpg"
    },
    {
      id: "pisang-goreng",
      nama: "Pisang Goreng Madu",
      kategori: "camilan",
      harga: 25000,
      deskripsi: "Pisang raja, madu, wijen. Tiga potong.",
      img: "assets/img/pisang-goreng.jpg"
    },
    {
      id: "kentang-rosemary",
      nama: "Kentang Rosemary",
      kategori: "camilan",
      harga: 28000,
      deskripsi: "Kentang goreng, rosemary, garam laut. Dengan aioli.",
      img: "assets/img/kentang.jpg"
    },
    {
      id: "cookies-cokelat",
      nama: "Cookies Cokelat",
      kategori: "camilan",
      harga: 18000,
      deskripsi: "Dua keping, cokelat 55%, sedikit garam.",
      img: "assets/img/cookies.jpg"
    },
    {
      id: "donat-karamel",
      nama: "Donat Karamel",
      kategori: "camilan",
      harga: 25000,
      deskripsi: "Donat yeast, karamel asin, es krim vanila.",
      img: "assets/img/donat.jpg"
    },
    {
      id: "croissant-butter",
      nama: "Croissant Butter",
      kategori: "camilan",
      harga: 28000,
      deskripsi: "Butter Prancis, dipanggang ulang. Sering habis sebelum sore.",
      img: "assets/img/croissant.jpg"
    },
    {
      id: "roti-bakar",
      nama: "Roti Bakar Klasik",
      kategori: "camilan",
      harga: 26000,
      deskripsi: "Roti gandum, butter, kaya. Dipotong dua.",
      img: "assets/img/roti-bakar.jpg"
    },
    {
      id: "cinnamon-roll",
      nama: "Cinnamon Roll",
      kategori: "camilan",
      harga: 30000,
      deskripsi: "Roti gulung kayu manis, cream cheese glaze.",
      img: "assets/img/cinnamon-roll.jpg"
    },
    {
      id: "tiramisu",
      nama: "Tiramisu",
      kategori: "camilan",
      harga: 35000,
      deskripsi: "Mascarpone, espresso, kakao. Potongan tebal, disusun pagi.",
      img: "assets/img/cake.jpg"
    }
  ];

  var CATEGORIES = [
    { id: "semua", label: "Semua" },
    { id: "kopi", label: "Kopi" },
    { id: "non-kopi", label: "Non-Kopi" },
    { id: "makanan", label: "Makanan" },
    { id: "camilan", label: "Camilan" }
  ];

  window.SORE = window.SORE || {};
  window.SORE.MENU = MENU;
  window.SORE.CATEGORIES = CATEGORIES;
  window.SORE.HOME_PICKS = ["es-kopi-susu", "nasi-goreng", "cinnamon-roll"];

  window.SORE.BRAND = {
    nama: "SORE",
    sub: "Kopi & Dapur",
    alamat: "Jl. Bumi Sari No. 14, Bandung",
    jam: "Senin–Minggu, 07.00–22.00",
    dapur: "Dapur tutup 21.00",
    ig: "@sore.kopi",
    wa: "0812-2000-1414",
    wifi: "sore.tamu"
  };
})();
