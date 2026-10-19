# Tinjauan Sprint & Retrospektif (Sprint Review & Retrospective) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-F-REV-06
- **Versi:** 1.0.0
- **Status:** Complete / Evidence-Backed Retrospective
- **Klasifikasi Bukti:** Gabungan `[Verified by Test]`, `[Historical Record]`, dan `[Reconstructed Analysis]`
- **Penanggung Jawab:** Agile Coach, QA Lead & AI Systems Engineer

---

## 1. Pendahuluan & Batasan Metodologis

Dokumen ini menyajikan evaluasi pencapaian fitur (**Sprint Review**) dan refleksi proses rekayasa perangkat lunak (**Retrospective**) untuk setiap iterasi pengembangan purwarupa JAT Hybrid IDP.

> [!NOTE]
> **Transparansi Rekonstruksi:** Dokumen ini **tidak merekayasa** kehadiran peserta rapat fiktif atau notulen rapat formal tim manusia. Seluruh temuan, keberhasilan, kegagalan teknis, dan tindakan perbaikan direkonstruksi secara jujur dari:
> 1. Hasil eksekusi pengujian otomatis dan pesan kegagalan (*assertion errors*);
> 2. Perubahan kode sumber dan *refactor log*;
> 3. Catatan keputusan arsitektural ([`docs/DECISION-LOG.md`](../DECISION-LOG.md));
> 4. Interaksi prompt dan klarifikasi batasan aturan bisnis.

---

## 2. Rincian Review & Retrospektif per Iterasi Pengembangan

### 2.1 Iterasi 1: Batch & Participant Management (EP-JAT-01 & EP-JAT-02)

#### A. Sprint Review
- **Hasil yang Diharapkan:** Admin dapat membuat batch dengan multi-fase, multi-range, menetapkan target lamaran, dan mendaftarkan siswa.
- **Implementasi yang Didemonstrasikan:** Halaman `AdminBatchManagementPage`, `AdminBatchFormPage`, `AdminBatchDetailPage`, dan `AdminStudentDetailPage`.
- **Kriteria Penerimaan:** 100% terpenuhi (`BR-01` s/d `BR-05`, `BR-09`, `BR-10`).
- **Hasil Pengujian:** 16 pengujian lulus (`ep-jat-01.test.tsx` 9 tes, `ep-jat-02.test.tsx` 7 tes).
- **Isu yang Ditemukan:** Aksi hapus batch pada desain awal terlalu mudah terpicu tanpa proteksi nama persis.
- **Perubahan yang Diminta:** Menambahkan modal konfirmasi pengetikan nama persis (`DSN-TBD-05`, `BR-09`).

#### B. Retrospektif
- **Apa yang Berjalan Baik:** Struktur modular formulir dinamis memudahkan penambahan rentang tanggal dan target level pekerjaan tanpa merusak state React.
- **Apa yang Kurang Berjalan Baik:** Penanganan validasi nama duplikat awalnya bersifat *case-sensitive*, sehingga nama seperti `"jat batch 1"` dan `"JAT Batch 1"` sempat diizinkan.
- **Akar Masalah:** Kurangnya normalisasi `.trim().toLowerCase()` pada fungsi pengecekan nama batch di repository.
- **Tindakan Perbaikan:** Menambahkan normalisasi string pada `batchRepository.createBatch` dan `batchRepository.updateBatch`.

---

### 2.2 Iterasi 2: Student Experience & Application Submission (EP-JAT-03 & EP-JAT-04)

#### A. Sprint Review
- **Hasil yang Diharapkan:** Siswa dapat melihat jadwal batch, mengetahui status aktif jendela tanggal, dan melaporkan aktivitas lamaran beserta berkas bukti.
- **Implementasi yang Didemonstrasikan:** Halaman `StudentBatchListPage`, `StudentBatchDetailPage`, dan laci `StudentAddProofDrawer`.
- **Kriteria Penerimaan:** 100% terpenuhi (`BR-06`, `BR-07`, `BR-11` s/d `BR-14`, `BR-45`).
- **Hasil Pengujian:** 12 pengujian lulus (`ep-jat-03.test.tsx` 7 tes, `ep-jat-04.test.tsx` 5 tes).
- **Isu yang Ditemukan:** Ketidakjelasan penanganan jika siswa melamar pada tanggal di luar rentang aktif batch (`BR-14` vs `BR-45`).
- **Perubahan yang Diminta:** Menerapkan keputusan `DSN-TBD-04`: tanggal di luar rentang diizinkan submit namun diberi peringatan bahwa sistem akan otomatis menetapkan status `Rejected`.

#### B. Retrospektif
- **Apa yang Berjalan Baik:** Komponen laci geser 580px dengan latar belakang buram (`backdrop-blur-md`) mereplikasi desain Stitch secara presisi dan nyaman digunakan.
- **Apa yang Kurang Berjalan Baik:** State formulir pada dropzone berkas sempat hilang ketika pengguna tidak sengaja menutup laci sebelum submit.
- **Akar Masalah:** Belum ada mekanisme konfirmasi penutupan (*unsaved changes guard*) pada laci formulir.
- **Pelajaran Teknis:** Form kompleks berukuran besar pada drawer memerlukan dialog peringatan pembatalan jika ada field yang telah terisi.

---

### 2.3 Iterasi 3: Validation Feedback & HITL Review Queue (EP-JAT-07 & EP-JAT-08)

#### A. Sprint Review
- **Hasil yang Diharapkan:** Penyajian status validasi transparan kepada siswa dan antrean verifikasi terpusat bagi Admin untuk berkas Waiting Confirmation.
- **Implementasi yang Didemonstrasikan:** Laci `StudentApplicationDetailDrawer`, antrean `AdminRequestQueuePage`, dan modal `AdminHitlInspectorModal`.
- **Kriteria Penerimaan:** 100% terpenuhi (`BR-22` s/d `BR-25`, `BR-28`, `BR-29`, `BR-31`, `BR-32`).
- **Hasil Pengujian:** 11 pengujian lulus (`ep-jat-07.test.tsx` 5 tes, `ep-jat-08.test.tsx` 6 tes).
- **Isu yang Ditemukan:** Terdapat toolbar persetujuan massal (*bulk action*) pada desain Stitch `9df4e619` yang melanggar prinsip kehati-hatian verifikasi berkas.
- **Perubahan yang Diminta:** Menghapus toolbar aksi massal (`DSN-TBD-03`) dan mewajibkan review per berkas melalui modal inspektor.

#### B. Retrospektif
- **Apa yang Berjalan Baik:** Modal inspeksi berdampingan (*side-by-side split view*) sangat memudahkan Admin membandingkan teks formulir pelamar langsung dengan gambar tangkapan layar asli.
- **Apa yang Kurang Berjalan Baik:** Teks tombol pada desain Stitch menggunakan istilah `Accepted` dan `Declined`, yang menimbulkan inkonsistensi dengan aturan PRD `Approved` dan `Rejected`.
- **Tindakan Perbaikan:** Normalisasi seluruh badge status di tingkat komponen `StatusBadge.tsx` (`DSN-TBD-01`).

---

### 2.4 Iterasi 4: Applied Jobs, Monitoring & Access Control (EP-JAT-09, 10, 11)

#### A. Sprint Review
- **Hasil yang Diharapkan:** Pengelolaan data lamaran siswa dengan multi-filter, kalkulasi progres objektif tanpa angka statis, dan penegakan pembatasan hak akses peran.
- **Implementasi yang Didemonstrasikan:** Komponen `AdminAppliedJobsSection`, mesin `progressCalculator.ts`, dan modul keamanan `RoleGuard.tsx`.
- **Kriteria Penerimaan:** 100% terpenuhi (`BR-08`, `BR-28`, `BR-30`, `BR-31`, `BR-33`, `BR-42`, `BR-43`).
- **Hasil Pengujian:** 16 pengujian lulus (`ep-jat-09` 5 tes, `ep-jat-10` 6 tes, `ep-jat-11` 5 tes).
- **Isu yang Ditemukan:** Tombol `Recalculate Progress` pada desain bertuliskan *"Super Admin Only"*, sementara kebutuhan bisnis menghendaki peran Admin Talent Support juga memiliki wewenang.
- **Perubahan yang Diminta:** Penyelarasan wewenang Admin dan Super Admin untuk pemicuan kalkulasi ulang progres (`DSN-TBD-02`).

#### B. Retrospektif
- **Apa yang Berjalan Baik:** Pemisahan mesin kalkulasi progres ke berkas tersendiri (`progressCalculator.ts`) menghilangkan seluruh duplikasi logika perhitungan di antarmuka.
- **Apa yang Kurang Berjalan Baik:** Pengujian mutasi data Admin awalnya hanya mengandalkan penyembunyian tombol di UI (*hidden controls*).
- **Akar Masalah:** Kurangnya pemeriksaan hak akses pada level logika layanan data.
- **Tindakan Perbaikan:** Menambahkan assertion service `assertAdminAccess` di `batchRepository.ts` yang secara ketat melempar error saat Student mencoba memanggil operasi Admin.

---

### 2.5 Iterasi 5: Hybrid IDP Extraction & Validation Engine (EP-JAT-05 & EP-JAT-06)

#### A. Sprint Review
- **Hasil yang Diharapkan:** Membangun pipeline pemrosesan berkas, verifikasi biner magic bytes, normalisasi teks, ekstraksi 7 atribut terstruktur, dan validasi leksikal hibrida.
- **Implementasi yang Didemonstrasikan:** Modul `imagePreprocessor.ts`, `textNormalizer.ts`, `structuredAttributeExtractor.ts`, `deterministicRuleValidator.ts`, `lexicalSimilarity.ts`, dan `idpValidationService.ts`.
- **Kriteria Penerimaan:** 100% terpenuhi (`BR-11`, `BR-12`, `BR-15` s/d `BR-21`, `BR-26`, `BR-34`, `BR-38` s/d `BR-41`).
- **Hasil Pengujian:** 36 pengujian unit & integrasi IDP lulus 100% (`ep-jat-05` 18 tes, `ep-jat-06` 18 tes).
- **Isu yang Ditemukan:** Risiko pengiriman data bukti siswa ke API publik pihak ketiga dan ketiadaan kunci API produksi di repositori mandiri.
- **Keputusan Arsitektur:** Mengisolasi OCR dan LLM Semantik ke dalam *Mock Service Adapter* berstandar kontrak tipe data (`DEC-05`, `DEC-06`, `DEC-11`, `DEC-12`).

#### B. Retrospektif
- **Apa yang Berjalan Baik:** Penerapan *Deterministic Non-Override Safeguard* (`BR-26`) memberikan jaminan keamanan mutlak: apapun keluaran atau skor kepercayaan AI, kegagalan tanggal atau format berkas tidak pernah bisa diloloskan.
- **Apa yang Kurang Berjalan Baik:** Sempat terjadi ketidakpastian mengenai format pengembalian atribut OCR yang tidak ditemukan pada gambar.
- **Pelajaran Teknis:** Atribut yang tidak terbukti secara visual wajib diset `null` atau `unknown` (`BR-18`), tidak boleh ditebak atau disimulasikan seolah-olah ditemukan.

---

### 2.6 Iterasi 6: Penjaminan Mutu E2E & Stabilisasi (EP-JAT-12)

#### A. Sprint Review
- **Hasil yang Diharapkan:** Memvalidasi seluruh skenario dalam alur E2E 9-tahap yang bersambung dan memastikan sistem kebal terhadap kasus batas negatif.
- **Implementasi yang Didemonstrasikan:** Berkas test suite `ep-jat-12.test.tsx` dan 4 dokumen resmi QA/UAT di direktori `docs/`.
- **Kriteria Penerimaan:** 100% terpenuhi (`JAT-BL-18`, `BLG-JAT-042` s/d `044`).
- **Hasil Pengujian:** Seluruh 12 test files (97 pengujian) lulus 100% tanpa kegagalan.

#### B. Retrospektif
- **Apa yang Berjalan Baik:** Pengujian E2E mendeteksi diskrepansi penamaan properti agregat monitoring sebelum rilis final, sehingga dapat diselaraskan ke `summary.validationBreakdown.Approved`.
- **Apa yang Kurang Berjalan Baik:** Sempat muncul diskrepansi kecil pada penamaan properti di objek input batch (`notes` yang tidak terdaftar di interface `CreateOrUpdateBatchInput`).
- **Akar Masalah:** Penggunaan properti opsional tanpa merujuk ke definisi antarmuka TypeScript yang ketat.
- **Tindakan Perbaikan:** Menjalankan kompilasi `tsc -b` secara disiplin sebelum pengujian akhir guna mendeteksi galat tipe lebih awal.

---

## 3. Retrospektif Lintas-Epic: Pembelajaran Metodologi AI-Assisted Engineering

Berdasarkan keseluruhan proses pengembangan dari EP-JAT-01 hingga EP-JAT-12, diidentifikasi beberapa pola penting dalam rekayasa perangkat lunak berbantuan AI (*AI-Assisted Engineering Patterns*):

1. **Bahaya Asumsi Eksplisit (*The Assumption Trap*):**
   - Agen AI memiliki kecenderungan untuk merekayasa data atau mempermudah aturan jika prompt bersifat umum.
   - *Solusi Terbukti:* Menetapkan dokumen aturan permanen ([`AGENTS.md`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/AGENTS.md)) dan instruksi eksplisit seperti *"Do not invent endpoints, database schema names, or production credentials"* terbukti 100% efektif menjaga disiplin arsitektur.
2. **Kekuatan Pengujian Berkelanjutan (*Test-Driven Verification*):**
   - Kode yang dihasilkan AI tidak boleh diterima begitu saja hanya karena terlihat meyakinkan secara visual.
   - *Solusi Terbukti:* Memasangkan setiap prompt implementasi dengan pengujian otomatis Vitest (`@testing-library/react`) memastikan bahwa setiap fitur benar-benar berfungsi secara fungsional.
3. **Pemisahan Desain Visual (Stitch) dan Logika Bisnis (Antigravity):**
   - Upaya menghasilkan logika bisnis yang rumit secara langsung di dalam alat perancang antarmuka (UI design tools) seringkali menghasilkan kode spaghetti.
   - *Solusi Terbukti:* Menggunakan Google Stitch khusus untuk menghasilkan sistem desain, token warna, dan layout HTML, lalu menerjemahkannya ke dalam komponen React modular dan arsitektur repositori terpisah di Antigravity, menghasilkan kode yang bersih, mudah dirawat, dan teruji secara ketat.
