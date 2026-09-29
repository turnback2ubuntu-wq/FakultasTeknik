# Pipeline Scraping Data SINTA & PDDikti
### Program Studi Teknik Informatika — Universitas PGRI Ronggolawe Tuban (UNIROW)
**Dokumen Pendukung Data Kuantitatif Program Studi (DKPS) / Akreditasi (LAM INFOKOM & BAN-PT)**

---

## 📌 Ringkasan
Pipeline ini secara otomatis mengumpulkan, membersihkan, dan mengintegrasikan seluruh data tri dharma perguruan tinggi serta profil institusi dari portal resmi **SINTA Kemdiktisaintek** dan **PDDikti Kemdiktisaintek** khusus untuk Program Studi **S1 Teknik Informatika Universitas PGRI Ronggolawe Tuban**.

Data yang dihasilkan disimpan dalam dua format utama:
1. **JSON & CSV** per entitas data di folder `data/sinta/` dan `data/pddikti/`.
2. **Integrated Excel Multi-Sheet** (`data/DKPS_Teknik_Informatika_UNIROW.xlsx`) yang telah disesuaikan dengan format tabel instrumen DKPS.

---

## 📂 Struktur Data & Entitas yang Dikumpulkan

### 1. Data SINTA (`data/sinta/`)
- **`profil_dosen.[json/csv]`**: Profil seluruh dosen tetap (SINTA ID, NIDN, Afiliasi, Skor SINTA Overall & 3Yr, Scopus H-Index, Google Scholar H-Index).
- **`publikasi_scopus.[json/csv]`**: Daftar publikasi terindeks Scopus lengkap beserta Quartile (Q1–Q4/no-Q), judul, tahun, sitasi, dan peran penulis (Author Order).
- **`publikasi_googlescholar.[json/csv]`**: Daftar publikasi Google Scholar beserta tahun, judul, jurnal, dan jumlah sitasi.
- **`publikasi_garuda.[json/csv]`**: Publikasi jurnal nasional terakreditasi di portal Garuda.
- **`penelitian.[json/csv]`**: Data riwayat penelitian dosen (Ketua peneliti, skema/sumber dana, tahun, dan besaran dana penelitian).
- **`pengabdian.[json/csv]`**: Data Pengabdian Kepada Masyarakat (PkM) (Ketua pelaksana, skema, tahun, dan dana).
- **`hki_paten.[json/csv]`**: Hak Kekayaan Intelektual (HKI) / Paten / Hak Cipta yang dimiliki dosen.
- **`buku.[json/csv]`**: Buku ajar / monograf ber-ISBN karya dosen.
- **`semua_publikasi.[json/csv]`**: Konsolidasi seluruh publikasi dosen Teknik Informatika.

### 2. Data PDDikti (`data/pddikti/`)
- **`profil_program_studi.[json/csv]`**: Kode Prodi (`55201`), Kode PT (`071073`), SK Izin Penyelenggaraan, Status Akreditasi ("Baik Sekali"), Tanggal Berdiri, Alamat, Website, Email, Biaya Kuliah, Rata-rata Masa Studi & Kelulusan (Graduation Rate), serta Rasio Dosen : Mahasiswa.
- **`data_dosen_homebase.[json/csv]`**: Daftar dosen homebase per semester (Nama, NIDN, NUPTK, Pendidikan S2/S3, Status Kepegawaian, Ikatan Kerja).
- **`data_dosen_pengajar.[json/csv]`**: Dosen aktif pengajar yang diperhitungkan dalam rasio dosen-mahasiswa.
- **`data_dosen_lengkap.[json/csv]`**: Profil komprehensif dosen yang mencakup riwayat pendidikan formal (S1, S2, S3 perguruan tinggi asal & gelar), jabatan akademik, dan status keaktifan.
- **`data_dosen_riwayat_mengajar.[json/csv]`**: Riwayat seluruh kelas yang diajar dosen (Semester, Kode Mata Kuliah, Nama Mata Kuliah, Kelas).
- **`data_mahasiswa_historis.[json/csv]`**: Data deret waktu (time-series) dari tahun 2002 hingga 2026/2027 Ganjil (50+ semester) yang mencatat jumlah mahasiswa terdaftar, jumlah dosen aktif, dan jumlah dosen pengajar per semester.
- **`data_kurikulum_matakuliah.[json/csv]`**: Rekonstruksi kurikulum dan mata kuliah prodi Teknik Informatika yang dihimpun dari seluruh riwayat perkuliahan dosen.

### 3. File Excel Terpadu DKPS
- **`data/DKPS_Teknik_Informatika_UNIROW.xlsx`**: Workbook Excel siap pakai yang berisi sheet:
  - *Profil Prodi*
  - *Dosen SINTA*
  - *Dosen PDDikti*
  - *Publikasi Scopus*
  - *Publikasi GScholar*
  - *Publikasi Garuda*
  - *Penelitian SINTA*
  - *Pengabdian SINTA*
  - *HKI dan Paten*
  - *Buku Ajar*
  - *Mahasiswa Historis*
  - *Kurikulum & Matkul*

---

## 🚀 Cara Menjalankan Scraper

Jika di kemudian hari ingin memperbarui data, cukup jalankan skrip berikut di terminal:

```bash
# Menjalankan seluruh pipeline sekaligus (SINTA + PDDikti + Excel)
python3 run_all_scraper.py

# Atau menjalankan secara terpisah:
python3 scrape_sinta.py    # Hanya SINTA
python3 scrape_pddikti.py  # Hanya PDDikti
```
