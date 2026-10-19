# Perencanaan & Eksekusi Sprint (Sprint Planning & Execution) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-E-SPR-05
- **Versi:** 1.0.0
- **Status:** Reconstructed Planning & Execution Analysis
- **Klasifikasi Bukti:** Gabungan `[Documented Design/Req]`, `[Historical Record]`, dan `[Reconstructed Analysis]`
- **Penanggung Jawab:** Senior Product Manager & Agile Coach

---

## 1. Pendahuluan & Penafian Metodologi (*Methodology Disclaimer*)

Dokumen ini membandingkan **Rancangan Struktur Sprint Awal (Planned Sprint Structure)** sebagaimana tercantum dalam dokumen perencanaan awal ([`docs/Product-Backlog.md`](../Product-Backlog.md)) terhadap **Alur Eksekusi Nyata (Actual AI-Assisted Implementation Execution)** yang terdokumentasi dalam repositori dan transkrip interaksi agen AI.

> [!WARNING]
> **Penafian Rekam Jejak Scrum:** Proyek ini dikembangkan secara mandiri dalam lingkungan purwarupa menggunakan bantuan agen AI (Google Stitch & Antigravity). Angka *Story Points* (SP) dan pengelompokan *Sprint ID (SP-01 s/d SP-06)* pada dokumen awal adalah **estimasi perencanaan teoritis** untuk memandu beban kerja tim, bukan bukti absensi upacara Scrum formal tim manusia (Daily Standup, Sprint Planning konvensional) di masa lalu.

---

## 2. Struktur Perencanaan Sprint Awal (Planned Baseline)

Dalam dokumen perencanaan awal [`docs/Product-Backlog.md`](../Product-Backlog.md), beban kerja diusulkan terbagi ke dalam 6 sprint tematik dua-mingguan:

| Sprint ID Usulan | Tema / Fokus Utama Sprint | Alokasi Epic & Backlog | Total Estimasi Story Points |
|---|---|---|---|
| **SP-01** | Fondasi Manajemen Batch & Peserta Siswa | `EP-JAT-01` (`BLG-001`–`004`), `EP-JAT-02` (`BLG-005`–`008`) | 24 Poin |
| **SP-02** | Antarmuka Siswa & Formulir Pengajuan Lamaran | `EP-JAT-03` (`BLG-009`–`012`), `EP-JAT-04` (`BLG-013`–`016`) | 24 Poin |
| **SP-03** | Rekayasa Inti Ekstraksi & Validasi Hybrid IDP | `EP-JAT-05` (`BLG-017`–`019`), `EP-JAT-06` (`BLG-020`–`022`) | 28 Poin |
| **SP-04** | Umpan Balik Validasi & Peninjauan Human-in-the-Loop | `EP-JAT-07` (`BLG-023`–`026`), `EP-JAT-08` (`BLG-027`–`030`) | 24 Poin |
| **SP-05** | Manajemen Applied Jobs, Monitoring & Hak Akses | `EP-JAT-09` (`BLG-031`–`034`), `EP-JAT-10` (`BLG-035`–`038`), `EP-JAT-11` (`BLG-039`–`041`) | 32 Poin |
| **SP-06** | Penjaminan Mutu Menyeluruh & Evaluasi UAT | `EP-JAT-12` (`BLG-042`–`044`) | 13 Poin |
| **Total** | **Seluruh 12 Epic & 44 Item Backlog** | **BLG-JAT-001 s/d BLG-JAT-044** | **145 Poin (Estimasi)** |

---

## 3. Realitas Urutan Eksekusi Nyata (*Actual Execution Flow*)

Berdasarkan analisis kronologis artefak prompt dan riwayat perubahan repositori, urutan pengerjaan aktual mengalami adaptasi pragmatis:

```
Urutan Perencanaan Teoretis:
SP-01 (Batch/Peserta) ──► SP-02 (Siswa/Submit) ──► SP-03 (IDP Inti) ──► SP-04 (Feedback/HITL) ──► SP-05 (Monitoring/RBAC) ──► SP-06 (QA)

Urutan Eksekusi Nyata Berbantuan AI:
Fase 1: Desain Visual Google Stitch (Seluruh Layaran & Token)
  │
Fase 2: Fondasi Proyek & Batch Management (EP-JAT-01, EP-JAT-02)
  │
Fase 3: Alur Interaksi Pengguna & Antarmuka Bisnis (EP-JAT-03, 04, 07, 08, 09, 10, 11)
  │     (Dibangun terlebih dahulu menggunakan mock adapter untuk memvalidasi UX)
  │
Fase 4: Rekayasa Mendalam Mesin Validasi Hybrid IDP (EP-JAT-05, EP-JAT-06)
  │     (Preprocessing biner, normalizer teks, Sørensen-Dice, non-override safeguard)
  │
Fase 5: Penjaminan Mutu Terpadu E2E & Stabilisasi (EP-JAT-12)
  │     (Uji integrasi 9-langkah, regresi kasus negatif, dan penyusunan dokumentasi)
```

### Rasional Perbedaan Urutan Eksekusi:
1. **Validasi Alur UX Sebelum Pemodelan AI Berat:** Tim memutuskan untuk membangun antarmuka interaksi Student dan Admin terlebih dahulu (EP-JAT-03 s/d 11) menggunakan *mock response data* agar alur pengguna, status validasi, dan pembagian peran disepakati terlebih dahulu.
2. **Isolasi Kompleksitas AI:** Pembangunan modul ekstraksi OCR dan validasi semantik (EP-JAT-05 dan 06) ditempatkan setelah alur bisnis stabil, sehingga integrasi *pipeline* IDP memiliki kontrak antarmuka yang sangat jelas dan tidak bongkar-pasang.

---

## 4. Evaluasi Rincian Sprint per Sprint

### Iterasi Sprint 1: Fondasi Batch & Manajemen Peserta
- **Backlog Ditugaskan:** `BLG-JAT-001` s/d `BLG-JAT-008` (EP-JAT-01 & EP-JAT-02).
- **Tujuan Iterasi:** Memastikan Admin dapat membuat jadwal batch, menentukan kuota target per level pekerjaan, mendaftarkan peserta, dan memonitor profil siswa.
- **Pencapaian Nyata:** Seluruh form konfigurasi batch, date range picker, multi-target, pendaftaran siswa, dan modal hapus terproteksi berhasil diselesaikan.
- **Story Points:** Direncanakan 24 Poin | Terealisasi Terverifikasi: 8/8 Item (100%).
- **Pengujian:** `ep-jat-01.test.tsx` (9 tests pass), `ep-jat-02.test.tsx` (7 tests pass).
- **Deviasi:** Penambahan kewajiban pengetikan nama persis pada modal hapus batch (`DSN-TBD-05`, `BR-09`).

---

### Iterasi Sprint 2: Alur Pelaporan Siswa & Formulir Bukti
- **Backlog Ditugaskan:** `BLG-JAT-009` s/d `BLG-JAT-016` (EP-JAT-03 & EP-JAT-04).
- **Tujuan Iterasi:** Siswa dapat melihat batch yang diikutinya, memeriksa periode aktif, dan melaporkan aktivitas lamaran dengan berkas bukti.
- **Pencapaian Nyata:** Dashboard siswa menampilkan status jendela tanggal (*Active*, *Upcoming*, *Expired*), tombol submit terkunci otomatis di luar rentang, dan laci form pelaporan 8 field dengan dropzone berkas berfungsi mulus.
- **Story Points:** Direncanakan 24 Poin | Terealisasi Terverifikasi: 8/8 Item (100%).
- **Pengujian:** `ep-jat-03.test.tsx` (7 tests pass), `ep-jat-04.test.tsx` (5 tests pass).
- **Deviasi:** Penambahan peringatan *auto-rejected* bila siswa melamar pada tanggal di luar rentang aktif batch (`DSN-TBD-04`, `BR-45`).

---

### Iterasi Sprint 3: Antrean Human-in-the-Loop & Umpan Balik Validasi
- **Backlog Ditugaskan:** `BLG-JAT-023` s/d `BLG-JAT-030` (EP-JAT-07 & EP-JAT-08).
- **Tujuan Iterasi:** Membangun antrean verifikasi Admin untuk berkas Waiting Confirmation dan menyajikan status validasi serta umpan balik transparan kepada siswa.
- **Pencapaian Nyata:** Standardisasi 3 status validasi (`Approved`, `Waiting Confirmation`, `Rejected`), antrean verifikasi khusus Waiting Confirmation, modal inspeksi bukti berdampingan, penolakan wajib alasan (>= 10 karakter), dan dialog konfirmasi persetujuan sekunder.
- **Story Points:** Direncanakan 24 Poin | Terealisasi Terverifikasi: 8/8 Item (100%).
- **Pengujian:** `ep-jat-07.test.tsx` (5 tests pass), `ep-jat-08.test.tsx` (6 tests pass).
- **Deviasi:** Peniadaan toolbar persetujuan massal (*bulk action*) demi menegakkan ketelitian pemeriksaan berkas (`DSN-TBD-03`, `BR-32`).

---

### Iterasi Sprint 4: Manajemen Applied Jobs, Monitoring & Kontrol Akses
- **Backlog Ditugaskan:** `BLG-JAT-031` s/d `BLG-JAT-041` (EP-JAT-09, EP-JAT-10, EP-JAT-11).
- **Tujuan Iterasi:** Menyediakan filter terpadu pelaporan, mengintegrasikan mesin kalkulasi target terpusat tanpa angka statis, dan menegakkan izin peran Student vs Admin.
- **Pencapaian Nyata:** Tabel filter Applied Jobs interaktif, fungsi kalkulasi progres `computeBatchMonitoringSummary` objektif, preservasi snapshot tanggal pengajuan (`BR-42`), service assertion `assertAdminAccess`, serta modal konfirmasi aksi destruktif dengan proteksi klik ganda.
- **Story Points:** Direncanakan 32 Poin | Terealisasi Terverifikasi: 11/11 Item (100%).
- **Pengujian:** `ep-jat-09.test.tsx` (5 tests pass), `ep-jat-10.test.tsx` (6 tests pass), `ep-jat-11.test.tsx` (5 tests pass).

---

### Iterasi Sprint 5: Rekayasa Inti Pipeline Hybrid IDP
- **Backlog Ditugaskan:** `BLG-JAT-017` s/d `BLG-JAT-022` (EP-JAT-05 & EP-JAT-06).
- **Tujuan Iterasi:** Membangun pipeline pemrosesan berkas, verifikasi biner magic bytes, normalisasi teks, ekstraksi 7 atribut terstruktur, validasi aturan deterministik leksikal, dan perumusan kebijakan keputusan hibrida.
- **Pencapaian Nyata:** Preprocessor biner nyata (PNG/JPEG), text normalizer dengan pembersihan null bytes dan detektor penutupan lowongan (`BR-41`), pencocokan Sørensen-Dice dengan normalisasi badan hukum (`BR-40`), serta penegakan mutlak *Deterministic Non-Override Safeguard* (`BR-26`). Layanan eksternal OCR dan LLM diisolasi dalam mock adapter berstandar kontrak (`DEC-05`, `DEC-06`).
- **Story Points:** Direncanakan 28 Poin | Terealisasi Terverifikasi: 6/6 Item (100%).
- **Pengujian:** `ep-jat-05.test.ts` (18 tests pass), `ep-jat-06.test.ts` (18 tests pass).

---

### Iterasi Sprint 6: Penjaminan Mutu Menyeluruh & Evaluasi Akhir
- **Backlog Ditugaskan:** `BLG-JAT-042` s/d `BLG-JAT-044` (EP-JAT-12).
- **Tujuan Iterasi:** Memvalidasi seluruh alur kerja dalam pengujian E2E 9-tahap, menguji regresi kasus batas/negatif, dan menyusun dokumentasi penjaminan mutu resmi.
- **Pencapaian Nyata:** Test suite E2E utuh tanpa mock internal, pengujian kasus batas/negatif komprehensif, penyusunan berkas rencana uji, hasil uji, matriks keterlacakan, dan evaluasi UAT resmi. Seluruh 12 test suite (97 pengujian) lulus 100%.
- **Story Points:** Direncanakan 13 Poin | Terealisasi Terverifikasi: 3/3 Item (100%).
- **Pengujian:** `src/test/ep-jat-12.test.tsx` (6 tests pass).

---

## 5. Ringkasan Kinerja & Deviasi Perencanaan

| Indikator Perencanaan | Nilai Teoretis (Planned) | Hasil Aktual (Actual Evidenced) | Keterangan Evaluasi |
|---|---|---|---|
| **Total Backlog Items** | 44 Item | 44 Item Terimplementasi & Teruji (100%) | Seluruh acceptance criteria terpenuhi. |
| **Total Test Suites** | 6 Rencana Test File | 12 Test Files Terimplementasi | Pemisahan test suite per Epic meningkatkan isolasi pengujian. |
| **Jumlah Kasus Uji Otomatis** | Tidak Dibatasi | 97 Automated Tests Passed | Mencakup pengujian unit, komponen, aturan bisnis, dan E2E. |
| **Tingkat Kelulusan Pengujian** | Ditargetkan 100% | **100% Passed (97/97)** | 0 Failed, 0 Blocked, 0 Skipped. |
| **Integrasi Cloud AI Produksi** | Direncanakan (Open) | **Mock Service Adapter (DEC-05, DEC-06)** | Diblokir secara sadar untuk melindungi privasi data & biaya. |
