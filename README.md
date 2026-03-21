# 🌙 Quest Idul Fitri 1447 H - Web-Based Mini Game

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)]([https://gameucapanidulfitri.netlify.app/])
[![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](#)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](#)

Sebuah *mini-game* interaktif berbasis web bertema Ramadan dan Idul Fitri. Proyek ini dibangun untuk mendemonstrasikan manipulasi DOM tingkat lanjut, *state management* murni menggunakan Vanilla JavaScript, serta integrasi animasi performa tinggi menggunakan GSAP.

---

## 🎮 Live Preview
**Mainkan gamenya di sini:** [[Tulis Link Live Demo Di Sini, contoh: quest-fitri.vercel.app]]([https://gameucapanidulfitri.netlify.app/])

> *(Opsional: Tambahkan GIF berdurasi 3-5 detik di sini yang memperlihatkan gameplay saat Boss diserang dan animasi kemenangan)*
> `![Gameplay Preview](link-gambar-gif-kamu.gif)`

---

## ✨ Key Features (Fitur Utama)
* **Dynamic State Management:** Mengelola sistem HP (*Health Points*), sistem *Combo*, pengisian *Power Strike*, dan *Timer* secara *real-time* tanpa *framework*.
* **Multiple Difficulties (Normal & Hard Mode):** Implementasi algoritma *counter-attack* acak dari boss dan sistem *penalty* (pengurangan poin/waktu) untuk menambah kompleksitas logika permainan.
* **Audio Engine & Haptic Feedback:** Menggunakan Web Audio API terintegrasi dengan penanganan masalah *Browser Autoplay Policy*, serta Web Vibrate API untuk memberikan *feedback* fisik pada perangkat *mobile*.
* **High-Performance Animations:** Memanfaatkan **GSAP (GreenSock Animation Platform)** untuk transisi layar yang *smooth*, efek *shake* saat menyerang, dan animasi elemen UI tanpa mengorbankan FPS.
* **Fully Responsive:** Antarmuka disesuaikan penuh untuk Desktop, Tablet, dan *Mobile* menggunakan CSS *Grid*, *Flexbox*, dan *Clamp()*.

---

## 🛠️ Tech Stack
* **Markup & Styling:** HTML5, CSS3 (Custom Properties / Variabel CSS, CSS Animations, Flexbox, Grid)
* **Logic:** Vanilla JavaScript (ES6+)
* **Animation Library:** GSAP 3.12.5

---

## 💡 Technical Highlights & What I Learned
Proyek ini bukan sekadar permainan *clicker* biasa, melainkan tempat saya mengasah pemecahan masalah *Front-End*:
1. **Mengatasi Browser Autoplay Policy:** Banyak peramban modern memblokir audio yang diputar otomatis. Saya belajar membuat arsitektur *AudioContext* yang menunda (*defer*) inisialisasi suara sampai ada interaksi (klik/sentuhan) pertama dari *user*.
2. **Event Handling & Timeout Clearance:** Pada *Hard Mode*, mengatur *timing* untuk serangan balik bos membutuhkan manajemen `setTimeout` dan `setInterval` yang hati-hati. Saya belajar pentingnya proses *cleanup* (`clearTimeout`) untuk mencegah *memory leak* dan *bug* logika yang tumpang tindih.
3. **Pemisahan Logika UI dan Game State:** Mengisolasi fungsi pembaruan layar (`updateHud()`) dari fungsi perhitungan data (seperti `applyDamage()`), yang merupakan prinsip dasar arsitektur komponen modern.

---

## 🚀 Cara Menjalankan Secara Lokal
Karena proyek ini dibangun menggunakan Vanilla Web Technologies, kamu tidak perlu menginstal *dependencies* yang rumit.

1. *Clone* repositori ini:
   ```bash
   git clone [LINK_GITHUB_REPO_KAMU]
