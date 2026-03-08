# 🌙 Ramadhan Challenge: To-Do List App

Aplikasi web interaktif untuk membantu umat Muslim memantau dan meningkatkan kualitas ibadah selama bulan Ramadhan. Aplikasi ini dirancang dengan antarmuka yang modern, responsif, dan fitur motivasi real-time.
**Challenge 4- Alhazen Academy Ramadhan Coding Challenge**

**Dibuat oleh:** Reni Kartika Suwandi  
**Program:** Alhazen Academy Ramadhan Coding Challenge  
**Tahun:** 2026

🔗 **Live Demo:** [https://ramadan-challenge-4-todolist-app-4j.vercel.app/](https://ramadan-challenge-4-todolist-app-4j.vercel.app/)

##  Fitur Utama

### Dashboard Monitoring
*   **Progress Harian Otomatis:** Perhitungan persentase ibadah (Shalat, Qur'an, Puasa, Dzikir) secara real-time.
*   **Sistem Streak:** Melacak konsistensi ibadah harian (api penyemangat).
*   **Motivasi Dinamis:** Pesan motivasi yang berubah sesuai tingkat pencapaian progress.

###  Manajemen Ibadah Terperinci
1.  **Shalat Wajib:**
    *   Checklist 5 waktu dengan validasi waktu (peringatan jika dicentang sebelum waktunya).
    *   Indikator visual status shalat.
2.  **Baca Qur'an:**
    *   Input target dan halaman yang sudah dibaca.
    *   Progress bar visual dengan tombol "Tandai Selesai".
    *   Pengingat otomatis jika target belum tercapai.
3.  **Puasa Ramadhan:**
    *   Kalender interaktif 1-30 hari.
    *   Validasi waktu berbuka (tidak bisa menandai puasa selesai sebelum Maghrib).
    *   Tracking progress 30 hari penuh.
4.  **Dzikir Harian:**
    *   Checklist dzikir pagi dan petang.

### Notifikasi & Pengingat
*   Notifikasi masuk waktu shalat.
*   Pengingat waktu berbuka puasa.
*   Pengingat target Qur'an malam hari.

### 🎨 Desain & UX
*   **Responsive:** Tampilan optimal di Desktop, Tablet, dan Mobile.
*   **Dark/Light Mode:** Mendukung mode gelap untuk kenyamanan mata di malam hari.
*   **Icon Berwarna:** Menggunakan Bootstrap Icons dengan skema warna spesifik untuk setiap kategori ibadah.

## 🛠️ Teknologi

*   **HTML5** - Struktur semantik.
*   **CSS3** - Styling custom, Grid/Flexbox, Variabel CSS, Animasi.
*   **JavaScript (Vanilla)** - Logika aplikasi, manipulasi DOM, LocalStorage (penyimpanan data lokal), dan perhitungan waktu.
*   **Bootstrap 5** - Framework CSS untuk komponen dasar.
*   **Bootstrap Icons** - Ikon vektor.
*   **Fontsource Poppins** - Tipografi modern.

## Cara Menjalankan (Lokal)

1.  Clone atau unduh repository ini.
2.  Buka file `index.html` langsung di browser Anda (Chrome, Firefox, Edge, dll).
3.  Tidak perlu instalasi server atau npm, aplikasi berjalan sepenuhnya di sisi klien (*client-side*).

## Struktur File

```text
├── index.html      # Struktur utama HTML
├──css/styles.css      # Semua styling CSS
└── js/script.js       # Logika JavaScript & Fungsi
```

##  Catatan Penggunaan

*   Data tersimpan otomatis di browser Anda (**LocalStorage**), sehingga tidak hilang saat halaman di-refresh.
*   Pastikan izin notifikasi browser diaktifkan untuk menerima pengingat waktu shalat.
*   Waktu shalat menggunakan jadwal statis (dapat disesuaikan di variabel `prayerTimes` pada `script.js`).

---

**Dibuat dengan ❤️ untuk menyemarakkan bulan Ramadhan.**
