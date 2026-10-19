# Log Perubahan Per Epic (Changelog) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-C-CHG-03
- **Versi:** 1.0.0
- **Status:** Complete / Evidence-Backed
- **Klasifikasi Bukti:** Gabungan `[Verified in Code]`, `[Verified by Test]`, dan `[Historical Record]`
- **Penanggung Jawab:** Software Architect & QA Lead

---

## 1. Ringkasan Kronologis Perubahan Tingkat Tinggi (*High-Level Changelog*)

| Versi / Rilis | Tanggal | Cakupan Epic / Modul | Ringkasan Inti Perubahan | Status Verifikasi |
|---|---|---|---|---|
| **v0.1.0-alpha** | 2026-10-15 | Inisialisasi & Scaffolding | Setup proyek React 19 + TypeScript + Vite + Tailwind CSS v4. Struktur folder, tipe data awal, dan repositori mock sintetis. | `[Verified in Code]` |
| **v0.2.0-beta** | 2026-10-16 | EP-JAT-01 & EP-JAT-02 | Manajemen Batch JAT (multi-fase, multi-range, multi-target, modal hapus persis) dan Manajemen Peserta Siswa. | `[Verified by Test]` (16 tests pass) |
| **v0.3.0-beta** | 2026-10-17 | EP-JAT-03 & EP-JAT-04 | Tampilan Siswa (daftar batch, gating jendela periode aktif/upcoming/expired) dan Laci Formulir Pengajuan Bukti Lamaran. | `[Verified by Test]` (12 tests pass) |
| **v0.4.0-beta** | 2026-10-17 | EP-JAT-07 & EP-JAT-08 | Umpan Balik Validasi Siswa (alasan penolakan transparan) dan Antrean Verifikasi Admin HITL (inspeksi bukti berdampingan). | `[Verified by Test]` (11 tests pass) |
| **v0.5.0-beta** | 2026-10-18 | EP-JAT-09, 10, 11 | Pengelolaan Data Applied Jobs, Mesin Kalkulasi Progres Batch Terpusat (*Zero Hardcoding*), dan Pembatasan Peran Layanan. | `[Verified by Test]` (16 tests pass) |
| **v0.6.0-rc1** | 2026-10-19 | EP-JAT-05 & EP-JAT-06 | Arsitektur Inti Hybrid IDP: Preprocessing gambar, verifikasi magic bytes, ekstraksi 7 atribut, aturan leksikal Sørensen-Dice, dan non-override guard. | `[Verified by Test]` (36 tests pass) |
| **v0.7.0-rc2** | 2026-10-19 | EP-JAT-12 | Penjaminan Mutu Penuh: Test suite E2E 9-langkah, regresi kasus negatif, rencana uji, matriks keterlacakan, dan laporan evaluasi UAT. | `[Verified by Test]` (97 tests pass) |
| **v1.0.0-final** | 2026-10-19 | Audit & Dokumentasi | Audit pasca implementasi, verifikasi kesiapan sistem, penyusunan dokumentasi teknis dan akademik BAB IV KKL. | `[Verified in Code]` (Build Clean) |

---

## 2. Rincian Perubahan per Epic (EP-JAT-01 s/d EP-JAT-12)

### 2.1 EP-JAT-01 — Batch Management: Pengelolaan Batch, Fase, Periode, dan Target
- **Tujuan Epic:** Memungkinkan Admin mengonfigurasi batch program JAT, mengaitkan cohort bootcamp, mengatur multi-fase dan rentang tanggal pelaksanaan, serta menetapkan target lamaran per level pekerjaan.
- **Masalah yang Diatasi:** Ketiadaan struktur jadwal terstandar yang menyebabkan kerancuan batas waktu pelaporan siswa dan ketidakjelasan target kelulusan.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-001` s/d `BLG-JAT-004`. Kriteria: Nama batch wajib diisi (`BR-01`), nama batch unik case-insensitive (`BR-02`), Phase 1 wajib & Phase 2 opsional (`BR-03`), rentang tanggal tidak tumpang tindih (`BR-04`), target non-negatif (`BR-05`), konfirmasi hapus mewajibkan ketik nama persis (`BR-09`, `DSN-TBD-05`).
- **Berkas yang Diubah:**
  - [`src/pages/admin/AdminBatchManagementPage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/admin/AdminBatchManagementPage.tsx)
  - [`src/pages/admin/AdminBatchFormPage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/admin/AdminBatchFormPage.tsx)
  - [`src/services/batchRepository.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) (`createBatch`, `updateBatch`, `deleteBatch`)
  - [`src/test/ep-jat-01.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-01.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Tabel daftar batch dengan statistik agregat, formulir dinamis penambahan *Date Range* dan *Target Job Level*, modal pratinjau dampak sebelum simpan (`cf1165af`), serta modal dialog hapus batch terproteksi.
- **Verifikasi Pengujian:** `ep-jat-01.test.tsx` (9 pengujian lulus 100%).
- **Deviasi dari Desain Awal:** Modal hapus batch pada desain awal hanya konfirmasi tombol biasa; disempurnakan dengan kewajiban mengetik nama persis (`DSN-TBD-05`).

---

### 2.2 EP-JAT-02 — Participant Management: Pengelolaan Peserta dan Detail Student
- **Tujuan Epic:** Memungkinkan Admin mengelola peserta yang terdaftar pada batch tertentu, memantau rincian identitas, dan melihat capaian target siswa secara individual.
- **Masalah yang Diatasi:** Kesulitan Admin dalam memonitor kemajuan siswa secara personal dan risiko hilangnya rekam jejak lamaran saat siswa dipindahkan/dihapus dari batch.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-005` s/d `BLG-JAT-008`. Kriteria: Pencarian dan filter peserta, pendaftaran peserta sintetis baru via modal, tampilan matriks capaian target per rentang tanggal, penghapusan peserta dengan konfirmasi aman dan preservasi arsip lamaran (`BR-10`).
- **Berkas yang Diubah:**
  - [`src/pages/admin/AdminBatchDetailPage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/admin/AdminBatchDetailPage.tsx)
  - [`src/pages/admin/AdminStudentDetailPage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/admin/AdminStudentDetailPage.tsx)
  - [`src/components/admin/AddStudentModal.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/admin/AddStudentModal.tsx)
  - [`src/test/ep-jat-02.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-02.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Tabel peserta batch dengan dual progress bar (Phase 1 & Phase 2), modal seleksi multisiswa dengan pencarian nama/email, tampilan rincian peserta dengan matriks target per level pekerjaan, dan dialog konfirmasi hapus peserta.
- **Verifikasi Pengujian:** `ep-jat-02.test.tsx` (7 pengujian lulus 100%).

---

### 2.3 EP-JAT-03 — Student View: Penyajian Batch, Periode, Target, dan Progres Student
- **Tujuan Epic:** Menyediakan antarmuka khusus siswa untuk melihat batch yang diikutinya, batas tanggal aktif, target kelulusan lamaran kerja, serta capaian progres pribadinya.
- **Masalah yang Diatasi:** Siswa tidak mengetahui jadwal aktif pengiriman lamaran dan tidak memiliki visibilitas terhadap batas akhir periode pelaporan.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-009` s/d `BLG-JAT-012`. Kriteria: Daftar batch siswa terdaftar, kartu fase dan rincian target per level pekerjaan, penentuan status jendela tanggal deterministik (`Active`, `Upcoming`, `Expired` — `BR-06`, `BR-07`), serta penguncian tombol submit saat periode tidak aktif (`BR-14`).
- **Berkas yang Diubah:**
  - [`src/pages/student/StudentBatchListPage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/student/StudentBatchListPage.tsx)
  - [`src/pages/student/StudentBatchDetailPage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/student/StudentBatchDetailPage.tsx)
  - [`src/services/batchRepository.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) (`getStudentBatchView`, `computePeriodWindowStatus`)
  - [`src/test/ep-jat-03.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-03.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Kartu ringkasan KPI (Target Keseluruhan, Approved, Waiting Confirmation, Rejected), kartu fase dengan indikator status jendela, tampilan state siswa belum terdaftar batch, dan tombol submit dinamis berbasis batas tanggal.
- **Verifikasi Pengujian:** `ep-jat-03.test.tsx` (7 pengujian lulus 100%).

---

### 2.4 EP-JAT-04 — Application Submission: Formulir Pelaporan Lamaran dan Validasi Berkas
- **Tujuan Epic:** Menyediakan laci geser interaktif bagi siswa untuk menginput data aktivitas melamar kerja dan mengunggah berkas tangkapan layar bukti lamaran.
- **Masalah yang Diatasi:** Siswa mengirimkan berkas bukti sembarangan (dokumen PDF berlembar-lembar, format tidak didukung, atau tanggal yang tidak sesuai dengan jadwal program).
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-013` s/d `BLG-JAT-016`. Kriteria: Input 8 field atribut lowongan kerja wajib (`BR-13`), batasan berkas hanya JPG/JPEG/PNG dengan ukuran maksimal 5MB dan tidak boleh 0 byte (`BR-11`, `BR-12`), pencegahan tanggal di masa depan (`BR-14`), serta peringatan otomatis *Rejected* bila tanggal berada di luar rentang aktif batch (`BR-45`, `DSN-TBD-04`).
- **Berkas yang Diubah:**
  - [`src/components/student/StudentAddProofDrawer.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/student/StudentAddProofDrawer.tsx)
  - [`src/services/idp/imagePreprocessor.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/imagePreprocessor.ts)
  - [`src/test/ep-jat-04.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-04.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Laci geser 580px dengan backdrop blur, area dropzone berkas dengan pembacaan metadata instan, validasi format inline, dan tombol submit yang memicu transisi status ke `Waiting Confirmation`.
- **Verifikasi Pengujian:** `ep-jat-04.test.tsx` (5 pengujian lulus 100%).

---

### 2.5 EP-JAT-05 — Hybrid IDP Extraction: Pemrosesan Gambar, OCR, dan Ekstraksi Informasi
- **Tujuan Epic:** Membangun *pipeline* penerimaan berkas, validasi keabsahan biner gambar (*magic bytes*), normalisasi teks, dan ekstraksi 7 atribut terstruktur lowongan kerja.
- **Masalah yang Diatasi:** Ketergantungan pada klaim teks siswa tanpa verifikasi keaslian berkas dan kerentanan terhadap manipulasi berkas palsu (misal: dokumen PDF atau biner rusak yang sengaja dinamai `.png`).
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-017` s/d `BLG-JAT-019`. Kriteria: Validasi biner *magic bytes* nyata (`BR-34`), pembersihan karakter kontrol/null (`BR-15`), ekstraksi 7 atribut lowongan standar (`BR-39`), kebijakan atribut hilang tetap `null`/`unknown` tanpa halusinasi (`BR-18`), deteksi frasa penutupan lowongan (`BR-41`), dan isolasi mock adapter OCR pending keputusan stakeholder (`DEC-05`, `DEC-11`).
- **Berkas yang Diubah:**
  - [`src/services/idp/idpExtractionTypes.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpExtractionTypes.ts)
  - [`src/services/idp/imagePreprocessor.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/imagePreprocessor.ts)
  - [`src/services/idp/textNormalizer.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/textNormalizer.ts)
  - [`src/services/idp/structuredAttributeExtractor.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/structuredAttributeExtractor.ts)
  - [`src/services/idp/ocrEngine.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/ocrEngine.ts)
  - [`src/services/idp/syntheticExtractionFixtures.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/syntheticExtractionFixtures.ts)
  - [`src/services/idp/idpExtractionPipeline.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpExtractionPipeline.ts)
  - [`src/test/ep-jat-05.test.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-05.test.ts)
- **Fitur Utama yang Diimplementasikan:** *Pipeline orchestrator* ekstraksi IDP, verifikasi tanda tangan biner JPEG (`0xFF 0xD8 0xFF`) dan PNG (`0x89 0x50 0x4E 0x47`), parser teks normalisasi, dan 9 set *fixture* sintetis variasi kualitas gambar.
- **Verifikasi Pengujian:** `ep-jat-05.test.ts` (18 pengujian lulus 100%).

---

### 2.6 EP-JAT-06 — Hybrid IDP Validation: Validasi Kesesuaian Informasi dan Bukti
- **Tujuan Epic:** Menjalankan pembandingan deterministik antara input formulir dengan hasil ekstraksi bukti, memanfaatkan kemiripan leksikal, serta menerapkan kebijakan keputusan status validasi berjenjang.
- **Masalah yang Diatasi:** Risiko persetujuan otomatis terhadap berkas yang terpotong, bukti tidak relevan, atau diskrepansi level pekerjaan (misal pelamar melamar posisi Senior namun bukti hanya menampilkan posisi Magang).
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-020` s/d `BLG-JAT-022`. Kriteria: Kemiripan leksikal Sørensen–Dice dengan normalisasi badan hukum (`BR-16`, `BR-40`), ambang batas kecocokan ketat >70% (`BR-17`), deteksi ketidaksesuaian level pekerjaan vs pengalaman (`BR-19`), pengalihan bukti buram/cacat ke `Waiting Confirmation` (`BR-20`), kebijakan keputusan berjenjang 90/60/0 (`BR-38`), pengalihan kegagalan AI ke review manusia (`BR-21`), dan perlindungan *Deterministic Non-Override Safeguard* di mana LLM dilarang membatalkan kegagalan aturan deterministik (`BR-26`).
- **Berkas yang Diubah:**
  - [`src/services/idp/idpValidationTypes.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpValidationTypes.ts)
  - [`src/services/idp/lexicalSimilarity.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/lexicalSimilarity.ts)
  - [`src/services/idp/deterministicRuleValidator.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/deterministicRuleValidator.ts)
  - [`src/services/idp/semanticComparator.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/semanticComparator.ts)
  - [`src/services/idp/idpDecisionPolicy.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpDecisionPolicy.ts)
  - [`src/services/idp/idpValidationService.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpValidationService.ts)
  - [`src/test/ep-jat-06.test.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-06.test.ts)
- **Fitur Utama yang Diimplementasikan:** Mesin pembanding kesesuaian leksikal, validator aturan deterministik ketat, mock adapter pembanding semantik AI, dan pengaman non-override aturan deterministik.
- **Verifikasi Pengujian:** `ep-jat-06.test.ts` (18 pengujian lulus 100%).

---

### 2.7 EP-JAT-07 — Validation Feedback: Penyajian Status Validasi dan Feedback kepada Student
- **Tujuan Epic:** Menyajikan hasil keputusan validasi secara transparan kepada siswa, menyertakan alasan penolakan yang dapat ditindaklanjuti, dan memisahkan status JAT dari progres rekrutmen.
- **Masalah yang Diatasi:** Siswa frustrasi ketika pengajuan ditolak tanpa alasan yang jelas, atau salah mengira berkas lamaran disetujui berarti telah diterima bekerja.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-023` s/d `BLG-JAT-026`. Kriteria: Standardisasi tiga status validasi (`Approved`, `Waiting Confirmation`, `Rejected` — `BR-22`), penyajian alasan penolakan dan feedback peninjau (`BR-23`), pemisahan permanen status validasi dari tahap rekrutmen perusahaan (`BR-28`), serta label simulasi transparan (`BR-27`, `BR-37`).
- **Berkas yang Diubah:**
  - [`src/components/student/StudentApplicationDetailDrawer.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/student/StudentApplicationDetailDrawer.tsx)
  - [`src/components/common/StatusBadge.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/common/StatusBadge.tsx)
  - [`src/test/ep-jat-07.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-07.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Laci detail pengajuan siswa 560px dengan panel status dinamis (hijau untuk Approved, kuning untuk Waiting Confirmation, merah untuk Rejected disertai rincian feedback penolakan), badge tahap rekrutmen terpisah, serta dialog konfirmasi hapus bukti yang belum disetujui.
- **Verifikasi Pengujian:** `ep-jat-07.test.tsx` (5 pengujian lulus 100%).

---

### 2.8 EP-JAT-08 — Human-in-the-Loop: Pemeriksaan dan Tindak Lanjut Request
- **Tujuan Epic:** Menyediakan antrean terpusat bagi Admin/Talent Support untuk meninjau pengajuan yang memerlukan verifikasi manual dan melakukan tindakan persetujuan/penolakan dengan akuntabel.
- **Masalah yang Diatasi:** Beban admin yang tidak terorganisir, persetujuan massal tanpa memeriksa bukti visual (*rubber-stamping*), serta penolakan sepihak tanpa alasan tercatat.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-027` s/d `BLG-JAT-030`. Kriteria: Antrean Request hanya memuat item berstatus `Waiting Confirmation` (`BR-32`), peniadaan toolbar persetujuan massal (`DSN-TBD-03`), filter multi-kriteria (`BR-31`), inspektor bukti visual berdampingan dengan 7 atribut IDP (`BR-39`, `DSN-TBD-06`), verifikasi persetujuan sekunder (`BR-29`), penolakan wajib menyertakan alasan minimal 10 karakter (`BR-24`), dan pencatatan riwayat audit peninjau (`BR-25`).
- **Berkas yang Diubah:**
  - [`src/pages/admin/AdminRequestQueuePage.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/pages/admin/AdminRequestQueuePage.tsx)
  - [`src/components/admin/AdminHitlInspectorModal.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/admin/AdminHitlInspectorModal.tsx)
  - [`src/test/ep-jat-08.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-08.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Halaman antrean verifikasi dengan counter dinamis, popover filter (Batch, Fase, Range, Job Level), modal inspeksi terbelah dua (kiri: data form; kanan: preview gambar & checklist 7 atribut IDP), toggle keputusan `Iya`/`Tidak`, dan dialog konfirmasi sekunder persetujuan.
- **Verifikasi Pengujian:** `ep-jat-08.test.tsx` (6 pengujian lulus 100%).

---

### 2.9 EP-JAT-09 — Applied Jobs Management: Pengelolaan Data Lamaran dan Filter
- **Tujuan Epic:** Menyediakan tabel pelaporan aktivitas lamaran yang komprehensif pada profil siswa bagi Admin dengan dukungan pencarian cepat dan kombinasi filter dimensi.
- **Masalah yang Diatasi:** Kesulitan Admin dalam menelusuri riwayat lamaran spesifik seorang siswa ketika jumlah pengajuan telah mencapai puluhan data.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-031` s/d `BLG-JAT-034`. Kriteria: Tabel Applied Jobs dengan status validasi dan progres rekrutmen terpisah (`BR-28`), filter independen (Fase, Date Range, Status Validasi JAT), filter kombinasi terpadu dengan pencarian teks (`BR-31`), dan penanganan *filter empty state* dengan tombol pemulihan *Reset Filter*.
- **Berkas yang Diubah:**
  - [`src/components/admin/AdminAppliedJobsSection.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/admin/AdminAppliedJobsSection.tsx)
  - [`src/test/ep-jat-09.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-09.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Komponen tabel Applied Jobs terstandarisasi, popover multi-filter terpadu, penghitung dinamis jumlah data yang difilter, dan sinkronisasi data seketika pasca aksi review HITL.
- **Verifikasi Pengujian:** `ep-jat-09.test.tsx` (5 pengujian lulus 100%).

---

### 2.10 EP-JAT-10 — Progress Monitoring: Sinkronisasi Target, Progres, dan Monitoring
- **Tujuan Epic:** Mengintegrasikan seluruh kalkulasi target dan kemajuan siswa ke dalam satu mesin kalkulasi terpusat yang objektif dan bebas dari angka statis (*zero hardcoded numbers*).
- **Masalah yang Diatasi:** Ketidakkonsistenan angka progres antara tampilan Admin dan Student, serta risiko rusaknya validitas lamaran historis saat Admin mengubah rentang tanggal batch.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-035` s/d `BLG-JAT-038`. Kriteria: Sumber kebenaran tanggal/target terpusat, preservasi validitas snapshot tanggal lamaran saat submit (`BR-42`), pemisahan perhitungan capaian dari status rekrutmen (`BR-28`), pratinjau dampak konsekuensi di modal sebelum perubahan target disimpan (`BR-08`), distribusi status kecepatan siswa (*pacing distribution*), dan kontrol `Recalculate Progress` dengan otorisasi peran (`BR-30`, `BR-43`, `DSN-TBD-02`).
- **Berkas yang Diubah:**
  - [`src/services/progressCalculator.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/progressCalculator.ts)
  - [`src/services/batchRepository.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) (`recalculateBatchProgress`, `getBatchMonitoringSummary`)
  - [`src/test/ep-jat-10.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-10.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Fungsi kalkulasi `calculateParticipantProgress`, agregator monitoring `computeBatchMonitoringSummary`, pelindung snapshot jendela tanggal pengajuan `submittedDateRangeWindow`, dan pelaporan status eksekusi kalkulasi ulang (`Updated` vs `No-Op`).
- **Verifikasi Pengujian:** `ep-jat-10.test.tsx` (6 pengujian lulus 100%).

---

### 2.11 EP-JAT-11 — Access Control: Pembatasan Hak Akses dan Pengamanan Tindakan
- **Tujuan Epic:** Menegakkan pembatasan wewenang antara peran Student dan Admin pada tingkat antarmuka maupun tingkat layanan data, serta mengamankan seluruh aksi destruktif.
- **Masalah yang Diatasi:** Risiko siswa mengakses fitur administratif (seperti menyetujui pengajuannya sendiri atau menghapus batch), serta kecelakaan penghapusan data akibat klik ganda atau salah tekan.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-039` s/d `BLG-JAT-041`. Kriteria: Penegakan izin pada service layer (`BR-33`, `BR-43`), isolasi data antar-siswa, banner penolakan akses di antarmuka, verifikasi pengetikan nama persis untuk penghapusan batch (`BR-09`, `DSN-TBD-05`), dan pelindung klik ganda beruntun (*double-click guard*).
- **Berkas yang Diubah:**
  - [`src/components/common/RoleGuard.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/common/RoleGuard.tsx)
  - [`src/components/common/ConfirmDestructiveModal.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/common/ConfirmDestructiveModal.tsx)
  - [`src/services/batchRepository.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) (`assertAdminAccess`)
  - [`src/test/ep-jat-11.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-11.test.tsx)
- **Fitur Utama yang Diimplementasikan:** Komponen pelindung rute dan aksi `RoleGuard`, assertion service `assertAdminAccess` yang melempar exception saat peran Student mencoba memanggil method Admin, modal verifikasi teks nama batch persis, dan state `isProcessing` untuk mencegah mutasi ganda.
- **Verifikasi Pengujian:** `ep-jat-11.test.tsx` (5 pengujian lulus 100%).

---

### 2.12 EP-JAT-12 — Quality Assurance: Pengujian Kebutuhan, Integrasi, Regresi, dan Evaluasi
- **Tujuan Epic:** Mengintegrasikan seluruh skenario ke dalam alur pengujian End-to-End utuh 9-langkah, menguji regresi kasus negatif dan batas sistem, serta menyusun dokumentasi penjaminan mutu dan UAT resmi.
- **Masalah yang Diatasi:** Ketiadaan pengujian yang memvalidasi interaksi antar-modul secara bersambung dari pembuatan batch hingga pembaruan progres pasca review HITL.
- **Backlog & Kriteria Penerimaan:** `BLG-JAT-042` s/d `BLG-JAT-044`, `JAT-BL-18`. Kriteria: Alur utuh E2E 9-tahap tanpa mock internal, pengujian kasus batas/negatif lengkap, penyusunan berkas rencana uji, hasil uji, matriks keterlacakan, dan evaluasi UAT.
- **Berkas yang Diubah / Dibuat:**
  - [`src/test/ep-jat-12.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-12.test.tsx)
  - [`docs/QA-TEST-PLAN.md`](../QA-TEST-PLAN.md)
  - [`docs/QA-TEST-RESULTS.md`](../QA-TEST-RESULTS.md)
  - [`docs/REQUIREMENTS-TRACEABILITY.md`](../REQUIREMENTS-TRACEABILITY.md)
  - [`docs/UAT-EVALUATION.md`](../UAT-EVALUATION.md)
  - [`planning/TRACEABILITY.md`](../../planning/TRACEABILITY.md)
- **Fitur Utama yang Diimplementasikan:** Test suite integrasi E2E komprehensif, regresi kegagalan provider AI, regresi format berkas cacat/rusak, dan dokumentasi keterlacakan 100% persyaratan PRD.
- **Verifikasi Pengujian:** `ep-jat-12.test.tsx` (6 pengujian lulus); seluruh rangkaian 12 berkas tes (97 pengujian) lulus 100%.

---

## 3. Matriks Keterlacakan Perubahan Lengkap

Matriks berikut menghubungkan setiap tahapan eksekusi:

$$\text{Prompt Execution} \longrightarrow \text{Epic} \longrightarrow \text{Backlog Item} \longrightarrow \text{Source Files} \longrightarrow \text{Test Suite} \longrightarrow \text{Outcome}$$

| Exec ID | Epic ID | Backlog Items | File Sumber Utama | Test Suite Pembuktian | Hasil Akhir & Status |
|---|---|---|---|---|---|
| **PRM-007** | `EP-JAT-01` | `BLG-JAT-001`–`004` | `AdminBatchFormPage.tsx`, `batchRepository.ts` | `ep-jat-01.test.tsx` (9 tests) | **Passed** — Batch lifecycle & exact-name delete verified. |
| **PRM-008** | `EP-JAT-02` | `BLG-JAT-005`–`008` | `AdminBatchDetailPage.tsx`, `AdminStudentDetailPage.tsx` | `ep-jat-02.test.tsx` (7 tests) | **Passed** — Participant roster & safe archiving verified. |
| **PRM-009** | `EP-JAT-03` | `BLG-JAT-009`–`012` | `StudentBatchListPage.tsx`, `StudentBatchDetailPage.tsx` | `ep-jat-03.test.tsx` (7 tests) | **Passed** — Student batch view & period gating verified. |
| **PRM-010** | `EP-JAT-04` | `BLG-JAT-013`–`016` | `StudentAddProofDrawer.tsx`, `imagePreprocessor.ts` | `ep-jat-04.test.tsx` (5 tests) | **Passed** — 8-field form & evidence upload verified. |
| **PRM-016** | `EP-JAT-05` | `BLG-JAT-017`–`019` | `imagePreprocessor.ts`, `structuredAttributeExtractor.ts` | `ep-jat-05.test.ts` (18 tests) | **Passed** — Magic bytes & structured extraction verified. |
| **PRM-017** | `EP-JAT-06` | `BLG-JAT-020`–`022` | `deterministicRuleValidator.ts`, `idpValidationService.ts` | `ep-jat-06.test.ts` (18 tests) | **Passed** — Sørensen-Dice & non-override guard verified. |
| **PRM-011** | `EP-JAT-07` | `BLG-JAT-023`–`026` | `StudentApplicationDetailDrawer.tsx`, `StatusBadge.tsx` | `ep-jat-07.test.tsx` (5 tests) | **Passed** — 3 validation statuses & feedback verified. |
| **PRM-012** | `EP-JAT-08` | `BLG-JAT-027`–`030` | `AdminRequestQueuePage.tsx`, `AdminHitlInspectorModal.tsx` | `ep-jat-08.test.tsx` (6 tests) | **Passed** — Waiting queue & HITL inspector verified. |
| **PRM-013** | `EP-JAT-09` | `BLG-JAT-031`–`034` | `AdminAppliedJobsSection.tsx`, `batchRepository.ts` | `ep-jat-09.test.tsx` (5 tests) | **Passed** — Multi-filters & empty recovery verified. |
| **PRM-014** | `EP-JAT-10` | `BLG-JAT-035`–`038` | `progressCalculator.ts`, `batchRepository.ts` | `ep-jat-10.test.tsx` (6 tests) | **Passed** — Zero hardcoding progress & date sync verified. |
| **PRM-015** | `EP-JAT-11` | `BLG-JAT-039`–`041` | `RoleGuard.tsx`, `ConfirmDestructiveModal.tsx` | `ep-jat-11.test.tsx` (5 tests) | **Passed** — Service-level RBAC & destructive safety verified. |
| **PRM-018** | `EP-JAT-12` | `BLG-JAT-042`–`044` | `ep-jat-12.test.tsx`, `docs/QA-*.md` | `ep-jat-12.test.tsx` (6 tests) | **Passed** — Full E2E flow & negative regressions verified. |
