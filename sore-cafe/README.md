# SORE — Kopi & Dapur

Situs pemesanan statis untuk kedai kopi fiktif di Bandung. Tamu memindai QR di meja, memilih menu, mengisi nama dan nomor meja, lalu membayar lewat QRIS demo. Tidak ada framework, tidak ada build step, tidak ada CDN.

## Menjalankan

Butuh Node.js. Dari folder ini:

```powershell
node serve.js
```

Buka `http://127.0.0.1:4173/`.

Port bisa diganti:

```powershell
$env:PORT=8080; node serve.js
```

Jangan membuka `index.html` langsung lewat `file://` kalau ingin menguji QR meja. QR akan berisi alamat file, bukan alamat situs yang bisa dibuka ponsel.

## Deploy ke GitHub Pages

Situs ini statis, jadi bisa langsung dipasang di GitHub Pages.

1. Buat repository **public** di GitHub, misalnya `sore-cafe`. Repository private memerlukan paket GitHub yang mendukung Pages.
2. Upload **isi** folder ini ke root repository: `index.html`, semua halaman lain, folder `assets/`, `README.md`, dan `master-prompt.md`. Jangan upload folder induknya, supaya `index.html` berada di root.
3. Buka **Settings → Pages**. Di **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu satu sampai dua menit. Alamatnya akan menjadi `https://<username>.github.io/sore-cafe/`.
5. Buka `https://<username>.github.io/sore-cafe/qr.html` untuk membuat kartu QR. QR akan mengarah ke `https://<username>.github.io/sore-cafe/menu.html?meja=N`.

Kalau memakai Git dari folder ini:

```powershell
git init
git add .
git commit -m "SORE cafe ordering site"
git branch -M main
git remote add origin https://github.com/<username>/sore-cafe.git
git push -u origin main
```

Buat repository kosong dulu di GitHub, lalu jalankan perintah di atas. GitHub akan meminta login lewat browser. `serve.js` tidak dipakai di GitHub Pages.

GitHub Pages hanya menghosting front-end. Pesanan tetap tersimpan di browser tamu, bukan di database, dan QRIS tetap demo. Untuk pesanan yang benar-benar masuk ke staf, perlu backend.

## Halaman

| Berkas | Fungsi |
| --- | --- |
| `index.html` | Beranda, menu andalan, alur pesan, ruang, alamat |
| `menu.html` | 30 item, filter kategori, pencarian, keranjang |
| `checkout.html` | Nama, nomor meja, tipe pesanan, catatan, ringkasan |
| `status.html` | Status pesanan dan rincian, dari `?order=KODE` |
| `tentang.html` | Cerita kedai, asal bahan, dapur terbuka |
| `ruang.html` | Galeri ruang dan catatan kunjungan |
| `qr.html` | Alat staf: buat, unduh, dan cetak kartu QR A6 |

## Alur pesanan

1. Kartu di meja mengarah ke `menu.html?meja=7` (angka menyesuaikan meja).
2. Nomor meja disimpan di `localStorage` dengan kunci `sore.meja`; keranjang di `sore.cart.v1`.
3. Di checkout, tamu mengisi nama, memastikan nomor meja, memilih makan di tempat atau dibungkus, dan boleh menambah catatan.
4. Tombol bayar membuat payload QRIS dinamis sesuai total, lalu membuka dialog QR dengan hitung mundur 15 menit.
5. Tombol simulasi menyimpan pesanan ke `sore.orders.v1`, mengosongkan keranjang, dan membuka `status.html?order=KODE`.
6. Status di halaman pesanan dihitung dari waktu pesanan: diterima, disiapkan, siap diantar. Ini simulasi, bukan data dapur sungguhan.

## QRIS demo — batas yang harus dibaca

`assets/js/qris.js` membuat payload EMVCo yang strukturnya benar: tag merchant, nominal, mata uang, order ID, dan CRC16-CCITT. Namun merchant-nya placeholder:

- Nama: `SORE DEMO`
- PAN: `936000000000000000`
- Merchant ID: `SORE-DEMO-01`
- MCC: `5812`
- Kota: `BANDUNG`

QR ini **tidak terhubung ke uang sungguhan** dan tidak akan memotong saldo. Untuk produksi, ganti data merchant dengan yang diterbitkan acquirer/PJSP, buat transaksi di backend, verifikasi pembayaran lewat webhook, dan jangan mengandalkan tombol simulasi di browser.

Situs ini juga belum punya backend. Pesanan hanya tersimpan di browser tamu, jadi staf tidak otomatis melihat pesanan dari perangkat lain. Untuk dipakai nyata, tambahkan API pesanan dan layar dapur, atau minimal kirim pesanan ke printer/WhatsApp staf.

## QR meja dan cetak

- Buka `qr.html`, masukkan nomor meja 1–30, lalu `Tampilkan`.
- `Unduh QR` menghasilkan SVG. `Cetak kartu` mencetak kartu A6 105 × 148 mm tanpa margin.
- QR mengikuti alamat halaman saat dibuat. Untuk kartu yang dipakai di meja, buka `qr.html` dari alamat situs yang sudah di-deploy, bukan dari `localhost`.
- Untuk mencoba dari ponsel di Wi-Fi yang sama, jalankan server dengan host terbuka:

  ```powershell
  $env:HOST="0.0.0.0"; node serve.js
  ```

  Cari IPv4 komputer lewat `ipconfig`, lalu buka `http://<IP-komputer>:4173/` dari ponsel. Izinkan Node.js di firewall Windows untuk jaringan privat. Buka `qr.html` lewat alamat IP itu juga, supaya QR mengarah ke alamat yang bisa dibuka ponsel—bukan ke `localhost`.
- Ubah jumlah meja di `assets/js/checkout.js`, `assets/js/qr.js`, dan teks di `qr.html` bila perlu.

## Mengubah isi

- **Menu dan harga:** `assets/js/data.js`. Harga dalam rupiah, sudah termasuk pajak. Foto menu idealnya 4:5.
- **Warna, font, jarak:** variabel di bagian `:root` pada `assets/css/main.css`.
- **Alamat, jam, telepon, Instagram:** ada di setiap halaman dan footer; cari `Bumi Sari` atau `@sore.bandung`. Akun Instagram masih placeholder.
- **Teks halaman:** langsung di HTML masing-masing.
- **QRIS:** `assets/js/qris.js`; baca bagian demo di atas sebelum mengganti merchant.
- **Status pesanan:** `assets/js/status.js`; ambang waktunya ada di sana.

Font Fraunces dan Inter disimpan lokal di `assets/fonts/`. QR dibuat dengan `qrcode-generator` 1.4.4 (MIT) yang disalin ke `assets/js/vendor/qrcode.js`. Tidak ada permintaan ke server luar saat halaman dibuka.

## Struktur

```
sore-cafe/
├─ index.html
├─ menu.html
├─ checkout.html
├─ status.html
├─ tentang.html
├─ ruang.html
├─ qr.html
├─ serve.js
├─ assets/
│  ├─ css/main.css
│  ├─ fonts/
│  ├─ img/
│  └─ js/
│     ├─ app.js
│     ├─ data.js
│     ├─ menu.js
│     ├─ checkout.js
│     ├─ qris.js
│     ├─ qr.js
│     ├─ status.js
│     └─ vendor/qrcode.js
└─ master-prompt.md
```

## Catatan pengujian

Diuji di Chrome pada 1440 × 1000 dan 390 × 844: tidak ada error JavaScript, tidak ada overflow horizontal, alur keranjang → checkout → dialog QRIS → simulasi → status berjalan. Dialog pembayaran memakai `max-height: calc(100dvh - 24px)` dan bisa digulir pada layar pendek.

Foto: Unsplash. Peta digambar sebagai SVG di dalam `index.html`. Ilustrasi dan teks kedai bersifat fiktif.
