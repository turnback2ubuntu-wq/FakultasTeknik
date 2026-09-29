# REKAPITULASI DAN SCRAPING DATA AKREDITASI DKPS TEKNIK INDUSTRI
## UNIVERSITAS PGRI RONGGOLAWE TUBAN (UNIROW)
**Standar Instrumen Akreditasi: Lembaga Akreditasi Mandiri Program Studi Keteknikan (LAM Teknik / BAN-PT)**  
*Sumber Data: Pangkalan Data Pendidikan Tinggi (PDDikti) & Science and Technology Index (SINTA) Kemdiktisaintek RI*

---

### 📂 Struktur Direktori & File

```
Teknik Industri/
├── README.md                                                   # Dokumentasi lengkap repositori
├── REKAPITULASI_DATA_PDDIKTI_DAN_SINTA.md                      # Laporan komprehensif Markdown data SINTA & PDDikti
├── Rekapitulasi_Data_PDDIKTI_dan_SINTA_Teknik_Industri_UNIROW.docx # Dokumen Word Rekapitulasi siap cetak
├── Rekapitulasi_Data_PDDIKTI_dan_SINTA_Teknik_Industri_UNIROW.doc  # Salinan dokumen format .doc
├── Laporan_DKPS_Teknik_Industri_UNIROW.xlsx                    # Workbook Excel resmi 10-Sheet standar LAM Teknik
├── Laporan_DKPS_Teknik_Industri_UNIROW.docx                    # Borang DKPS resmi Microsoft Word siap cetak
├── Laporan_DKPS_Teknik_Industri_UNIROW.doc                     # Salinan Borang DKPS format .doc
├── Laporan_DKPS_Teknik_Industri_UNIROW.md                      # Laporan Borang DKPS format Markdown
├── scrape_sinta.py                                             # Script otomatisasi penarikan data SINTA
├── scrape_pddikti.py                                           # Script otomatisasi penarikan data PDDikti
├── run_all_scraper.py                                          # Master orchestrator scraping & integrasi data
├── generate_laporan_dkps.py                                    # Generator borang DKPS (Excel, Word, MD)
├── generate_rekapitulasi_doc.py                                # Generator laporan rekapitulasi (Word, MD)
└── data/
    ├── DKPS_Teknik_Industri_UNIROW.xlsx                        # Dataset kompilasi multi-sheet
    ├── sinta/                                                  # Dataset SINTA (JSON & CSV)
    │   ├── profil_dosen.json / .csv                            # 9 Dosen DTPS lengkap metrik skor
    │   ├── publikasi_scopus.json / .csv                        # 11 Artikel Scopus
    │   ├── publikasi_googlescholar.json / .csv                 # 900 Artikel Google Scholar
    │   ├── publikasi_garuda.json / .csv                        # 222 Artikel Jurnal Nasional Garuda
    │   ├── semua_publikasi.json / .csv                         # 1.133 Publikasi gabungan
    │   ├── penelitian.json / .csv                              # 502 Kegiatan riset & hibah
    │   ├── pengabdian.json / .csv                              # 139 Program pengabdian masyarakat (PkM)
    │   ├── hki_paten.json / .csv                               # 131 Sertifikat Hak Cipta & Paten
    │   └── buku.json / .csv                                    # 3 Buku ajar ber-ISBN
    └── pddikti/                                                # Dataset PDDikti (JSON & CSV)
        ├── profil_program_studi.json / .csv                    # Identitas resmi prodi (Kode: 26201)
        ├── data_dosen_homebase.json / .csv                     # 11 Dosen homebase
        ├── data_dosen_pengajar.json / .csv                     # 16 Dosen penghitung rasio
        ├── data_dosen_lengkap.json / .csv                      # Profil detail S1, S2, S3, & riwayat studi
        ├── data_dosen_riwayat_mengajar.json / .csv             # 2.345 Baris rekam jejak mengajar
        ├── data_dosen_penelitian_pddikti.json / .csv           # 25 Catatan portofolio riset PDDikti
        ├── data_dosen_pengabdian_pddikti.json / .csv           # 89 Catatan portofolio PkM PDDikti
        ├── data_dosen_karya_pddikti.json / .csv                # 335 Karya ilmiah dosen PDDikti
        ├── data_dosen_paten_pddikti.json / .csv                # 33 Paten/HKI dosen PDDikti
        ├── data_mahasiswa_historis.json / .csv                 # 49 Semester historis mahasiswa (2002-2026)
        ├── data_mahasiswa_daftar.json / .csv                   # Sampel 100 mahasiswa terdaftar
        └── data_kurikulum_matakuliah.json / .csv               # 313 Mata kuliah kurikulum unik
```

---

### 📊 Ringkasan Data Kunci S1 Teknik Industri UNIROW

1. **Identitas Program Studi:**
   - **Nama:** S1 Teknik Industri
   - **Kode Prodi:** 26201
   - **Perguruan Tinggi:** Universitas PGRI Ronggolawe Tuban (Kode: 071073 | SINTA Affiliation: 2100)
   - **Peringkat Akreditasi:** Baik Sekali
   - **Rasio Dosen : Mahasiswa:** 1 : 31.21 (Standar SN-Dikti ≤ 1:35)

2. **Dosen Tetap Penugasan Program Studi (DTPS):**
   - 9 Dosen Tetap ber-NIDN aktif (1 Doktor S3, 8 Magister S2)
   - 100% tersertifikasi Pendidik (Serdik)
   - Rata-rata beban EWMP: 14.1 SKS/semester

3. **Rekam Jejak Tridharma & Luaran Intelektual:**
   - **Total SINTA Score Overall:** 2.088
   - **Publikasi Scopus:** 11 Dokumen
   - **Publikasi Google Scholar:** 900 Dokumen (1.334 Sitasi)
   - **Publikasi Garuda:** 222 Dokumen
   - **Penelitian DTPS:** 502 Judul
   - **Pengabdian Masyarakat (PkM):** 139 Kegiatan
   - **Perolehan HKI & Paten:** 131 Sertifikat
   - **Buku Ber-ISBN:** 3 Judul
