# 📸 Instagram Feed Scraper API

![GitHub License](https://img.shields.io/github/license/kakrusliandika/InstagramApiNodeJs-Rusli)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Puppeteer](https://img.shields.io/badge/puppeteer-core-yellow)
![Status](https://img.shields.io/badge/status-beta-orange)

🚀 **Instagram Feed Scraper API** adalah API sederhana berbasis Node.js yang menggunakan Puppeteer untuk mengambil gambar dan caption dari akun Instagram publik.

⚠️ Catatan: Beberapa platform hosting seperti Vercel dan Railway mungkin tidak mendukung Chromium sepenuhnya. Proyek ini **berjalan lancar di lokal** atau VPS dengan konfigurasi Chromium lengkap.

---

## 🔧 Fitur

- Ambil feed terbaru dari profil Instagram publik
- Data meliputi:
  - Gambar (`imageUrl`)
  - Caption (`caption`)
  - Tanggal scraping (`date`)
- Maksimal 35 postingan
- Dibangun dengan `puppeteer-core` dan `chrome-aws-lambda`

---

## 📦 Instalasi

```bash
git clone https://github.com/kakrusliandika/InstagramApiNodeJs-Rusli.git
cd InstagramApiNodeJs-Rusli
npm install --legacy-peer-deps
```
---

## ▶️ Jalankan Secara Lokal
```bash
npm start
```
http://localhost:3000/api/instagram?username=instagram_username

---

## 📘 Contoh Response
```bash
[
  {
    "imageUrl": "https://instagram.fcgk10-1.fna.fbcdn.net/v/...jpg",
    "caption": "Sunset vibes at the beach 🌅",
    "date": "2025-04-29T13:45:20.678Z"
  },
  ...
]
```

---

## 🛑 Kendala Hosting

Platform	Status	Catatan
- ✅ Lokal	Berfungsi	Puppeteer berjalan baik dengan Chromium lokal
- ❌ Vercel	Gagal	Tidak support full headless Chromium (tanpa custom server)
- ❌ Railway	Gagal	Butuh konfigurasi tambahan; Chromium mungkin tidak tersedia
- 🟡 Render.com	Mungkin	Tergantung pengaturan runtime dan region
- ✅ VPS/Linux	Disarankan	Ideal untuk penggunaan puppeteer tanpa batasan runtime hosting
