# Sejarah Perkembangan Proyek — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-A-HIST-01
- **Versi:** 1.0.0
- **Status:** Complete / Evidence-Backed
- **Klasifikasi Bukti:** Gabungan `[Verified in Code]`, `[Verified by Test]`, `[Historical Record]`, dan `[Reconstructed Analysis]`
- **Penanggung Jawab:** Senior Product Manager & Technical Writer

---

## 1. Latar Belakang & Konteks Masalah

Proyek **Job Application Tracking (JAT) Hybrid IDP** lahir dari kebutuhan operasional platform edukasi dan penyaluran kerja (LMS Dibimbing.id) dalam memantau, memvalidasi, dan mendampingi ribuan siswa (*students*) yang sedang menjalani masa persiapan karir (*job seeking period*). 

### 1.1 Kondisi Awal (Proses Bisnis AS-IS)
Berdasarkan dokumen kebutuhan [`docs/PRD.md`](../PRD.md) dan catatan sistem [`docs/System-Requirements.md`](../System-Requirements.md), proses pelaporan aktivitas lamaran kerja siswa sebelumnya menghadapi kendala operasional yang signifikan:
- **Pelaporan Manual Rentan Manipulasi:** Siswa melaporkan aktivitas melamar pekerjaan melalui formulir mandiri tanpa verifikasi berkas bukti secara otomatis.
- **Beban Kerja Tim Talent Support Terlalu Tinggi (*Operational Bottleneck*):** Tim Talent Support harus memeriksa ribuan tangkapan layar (*screenshot*) bukti pengiriman lamaran (email balasan, notifikasi portal lowongan kerja seperti LinkedIn, Jobstreet, Glints) satu per satu secara manual.
- **Keterbatasan Validasi Kualitas Bukti:** Bukti yang diunggah seringkali terpotong (*cropped*), buram (*blurry*), tidak menampilkan nama kandidat/perusahaan, atau bahkan bukti palsu (gambar tidak relevan), namun tetap disetujui karena tidak ada mekanisme pembacaan konten otomatis.
- **Pencampuran Status Validasi dan Status Rekrutmen:** Sering terjadi kesalahpahaman di mana siswa menganggap status berkas "Disetujui" oleh admin berarti mereka telah "Diterima Bekerja" di perusahaan yang bersangkutan.

### 1.2 Tujuan Produk & Kemampuan Sistem yang Diharapkan (Proses Bisnis TO-BE)
Purwarupa mandiri JAT Hybrid IDP dirancang untuk memecahkan masalah di atas dengan memperkenalkan pendekatan **Hybrid Intelligent Document Processing (IDP)**:
1. **Otomatisasi Ekstraksi Berkas Bukti:** Menggunakan Optical Character Recognition (OCR) dan normalisasi data untuk membaca teks bukti lamaran secara terstruktur.
2. **Validasi Dua Jalur (*Hybrid Validation*):**
   - **Jalur Deterministik (Aturan Pasti):** Memeriksa format berkas (JPG/JPEG/PNG <= 5MB, *magic bytes* biner), batas tanggal (tidak boleh masa depan atau di luar jadwal batch), dan kemiripan nama perusahaan/role dengan batas toleransi ketat (>70%).
   - **Jalur Semantik Asistif (LLM):** Menganalisis konteks semantik dan relevansi bukti pekerjaan tanpa pernah membatalkan aturan deterministik (*Deterministic Non-Override Safeguard*).
3. **Mekanisme *Human-in-the-Loop* (HITL):** Bukti yang ambigu, buram, atau memiliki skor kesesuaian marjinal (60%–89%) secara otomatis dialihkan ke antrean verifikasi Admin (*Waiting Confirmation*) untuk peninjauan manusia, sehingga tidak ada keputusan keliru yang dieksekusi secara otomatis.
4. **Pemisahan Tegas Status Validasi vs Tahap Rekrutmen:** Memisahkan secara permanen Status Validasi JAT (`Approved`, `Rejected`, `Waiting Confirmation`) dari Tahap Rekrutmen Perusahaan (`Applied`, `HR Screening`, `User Interview`, `Offering`, `Hired`).

---

## 2. Metodologi Pengembangan Berbantuan AI (*AI-Assisted Development Workflow*)

Pengembangan purwarupa ini tidak menggunakan pendekatan konvensional ataupun menulis kode manual secara acak, melainkan menggunakan alur kerja modern berbasis instruksi AI terstruktur:

```
+-----------------------------------------------------------------------------------+
| 1. Google Stitch (Vibedesign Phase)                                              |
|    - Unggah aset potongan referensi desain PDF (design-reference/)                |
|    - Jalankan prompt terstruktur (prompts/stitch/)                                |
|    - Ekspor token desain, HTML, screenshot, dan DESIGN.md via Stitch MCP         |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. Workspace Setup & Scaffolding (Antigravity Phase)                              |
|    - Inisialisasi folder kosong: React 19 + TypeScript + Vite + Tailwind CSS      |
|    - Buat kontrak repositori mock terisolasi (batchRepository.ts)                 |
|    - Tetapkan AGENTS.md sebagai aturan perilaku permanen AI                      |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Implementasi Bertahap per Epic (EP-JAT-01 s/d EP-JAT-12)                      |
|    - Eksekusi prompt Epic satu per satu dengan pengujian unit mendampingi         |
|    - Refaktor deterministik dan penegakan Aturan Bisnis (BR-01 s/d BR-45)        |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. Audit Pasca Implementasi, Verifikasi Regresi, dan Dokumentasi                  |
|    - Eksekusi pengujian otomatis menyeluruh (97/97 tests pass)                   |
|    - Audit kejujuran real vs mock IDP (DEC-05, DEC-06)                           |
|    - Penyusunan dokumentasi teknis & akademik BAB IV KKL                          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Rincian Fase Perkembangan Sistem

### Fase 1: Persiapan Desain & Alih Kelola Google Stitch (*Design Handoff*)
- **Tujuan:** Menghasilkan antarmuka visual profesional yang konsisten dengan sistem desain Dibimbing LMS tanpa bergantung pada file Figma editable yang tidak tersedia.
- **Masukan (*Inputs*):** Cuplikan gambar desain PDF di `design-reference/student/`, `design-reference/admin/`, dan `design-reference/request/`.
- **Aktivitas Utama:**
  - Menjalankan urutan prompt di `prompts/stitch/` (Brief, Student screens, Admin screens, Review inspector, Design system audit).
  - Menghasilkan 52 node kanvas Stitch (20 layar UI aktif, 7 layar dasar/varian, 4 dokumen spesifikasi, dan 20 instance referensi).
  - Mengunduh artefak HTML, screenshot PNG resolusi tinggi, dan dokumen token desain melalui *Stitch MCP*.
- **Keluaran (*Outputs*):**
  - [`docs/DESIGN.md`](../DESIGN.md) (Rujukan token warna, tipografi, radius, dan komponen).
  - [`docs/SCREEN-INVENTORY.md`](../SCREEN-INVENTORY.md) (Inventaris lengkap seluruh layar Stitch).
  - Direktori aset lokal `design-reference/stitch/`.
- **Sumber Bukti:** `[Historical Record]` di `design-reference/stitch/manifest.json` dan `prompts/stitch/STITCH_WORKFLOW.md`.
- **Batasan & Catatan:** Desain Stitch menyertakan toolbar persetujuan massal (*bulk action*) pada antrean verifikasi yang kemudian diubah demi menjaga integritas validasi.

---

### Fase 2: *Scaffolding* Proyek & Landasan Arsitektur
- **Tujuan:** Membangun kerangka aplikasi frontend mandiri berbasis React dan TypeScript dari folder kosong.
- **Masukan (*Inputs*):** [`prompts/antigravity/02-scaffold-frontend.md`](../../prompts/antigravity/02-scaffold-frontend.md), [`planning/TECH-STACK-DECISION.md`](../../planning/TECH-STACK-DECISION.md).
- **Aktivitas Utama:**
  - Setup React v19, Vite v6, Tailwind CSS v4, dan React Router v7.
  - Pembuatan *Application Shell*: [`AdminShell.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/layout/AdminShell.tsx) dan [`StudentShell.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/layout/StudentShell.tsx).
  - Penyusunan domain models awal di [`src/types/jat.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/types/jat.ts).
  - Implementasi adapter repositori data sintetis di [`src/services/batchRepository.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) dengan dukungan `localStorage` fallback.
- **Keluaran (*Outputs*):** Struktur dasar `src/`, konfigurasi router di `src/App.tsx`, dan dataset awal `src/mocks/jatData.ts`.
- **Sumber Bukti:** `[Verified in Code]` di `package.json` dan commit fondasi awal.

---

### Fase 3: Implementasi Bertahap Fitur Bisnis (EP-JAT-01 s/d EP-JAT-11)
Pengembangan dilakukan secara inkremental, satu Epic pada satu waktu:

#### 1. EP-JAT-01: Batch Management (`BLG-JAT-001` s/d `004`)
- **Implementasi:** Halaman daftar batch Admin (`AdminBatchListPage.tsx`), form create/edit batch (`AdminBatchFormPage.tsx`), konfigurasi Phase 1 wajib & Phase 2 opsional (`BR-03`), multi-range tanggal (`BR-04`), multi-target job level (`BR-05`), validasi nama wajib & unik (`BR-01`, `BR-02`), serta modal konfirmasi hapus batch dengan ketik nama persis (`BR-09`, `DSN-TBD-05`).
- **Verifikasi:** [`src/test/ep-jat-01.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-01.test.tsx) (9 tes lulus).

#### 2. EP-JAT-02: Participant Management (`BLG-JAT-005` s/d `008`)
- **Implementasi:** Daftar peserta pada detail batch (`AdminBatchDetailPage.tsx`), pencarian & filter peserta, modal pendaftaran siswa baru (`AddStudentModal.tsx`), halaman detail peserta (`AdminStudentDetailPage.tsx`), serta modal hapus peserta yang mengarsipkan data lamaran (`BR-10`).
- **Verifikasi:** [`src/test/ep-jat-02.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-02.test.tsx) (7 tes lulus).

#### 3. EP-JAT-03: Student View & Period Gating (`BLG-JAT-009` s/d `012`)
- **Implementasi:** Tampilan daftar batch siswa (`StudentBatchListPage.tsx`), detail batch siswa (`StudentBatchDetailPage.tsx`), penyajian status jendela tanggal (`Active`, `Upcoming`, `Expired`), serta penguncian tombol submit saat periode tidak aktif (`BR-06`, `BR-07`, `BR-14`).
- **Verifikasi:** [`src/test/ep-jat-03.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-03.test.tsx) (7 tes lulus).

#### 4. EP-JAT-04: Application Submission (`BLG-JAT-013` s/d `016`)
- **Implementasi:** Laci formulir pelaporan lamaran (`StudentAddProofDrawer.tsx`), input 8 atribut lowongan wajib (`BR-13`), validasi berkas gambar JPG/JPEG/PNG <= 5MB (`BR-11`, `BR-12`), pencegahan tanggal masa depan (`BR-14`), dan peringatan otomatis jika melamar di luar tanggal aktif batch (`BR-45`, `DSN-TBD-04`).
- **Verifikasi:** [`src/test/ep-jat-04.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-04.test.tsx) (5 tes lulus).

#### 5. EP-JAT-07: Validation Feedback (`BLG-JAT-023` s/d `026`)
- **Implementasi:** Standardisasi 3 status validasi (`Approved`, `Waiting Confirmation`, `Rejected` — `BR-22`, `DSN-TBD-01`), laci detail lamaran siswa (`StudentApplicationDetailDrawer.tsx`), transparansi alasan penolakan (`BR-23`), pemisahan mutlak dari progres rekrutmen perusahaan (`BR-28`), dan label simulasi transparan (`BR-27`, `BR-37`).
- **Verifikasi:** [`src/test/ep-jat-07.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-07.test.tsx) (5 tes lulus).

#### 6. EP-JAT-08: Human-in-the-Loop Review (`BLG-JAT-027` s/d `030`)
- **Implementasi:** Antrean verifikasi khusus status `Waiting Confirmation` (`AdminRequestQueuePage.tsx`, `BR-32`), peniadaan tombol persetujuan massal demi akuntabilitas (`DSN-TBD-03`), filter multi-kriteria (`BR-31`), modal inspeksi bukti berdampingan (`AdminHitlInspectorModal.tsx`, `BR-39`), verifikasi persetujuan sekunder (`BR-29`), serta penolakan dengan alasan wajib (`BR-24`).
- **Verifikasi:** [`src/test/ep-jat-08.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-08.test.tsx) (6 tes lulus).

#### 7. EP-JAT-09: Applied Jobs Management (`BLG-JAT-031` s/d `034`)
- **Implementasi:** Tabel Applied Jobs pada profil siswa (`AdminAppliedJobsSection.tsx`), pencarian teks, filter terpadu (Fase, Date Range, Status Validasi JAT), penanganan *empty filter state* dengan aksi *reset*, dan sinkronisasi data seketika pasca aksi review HITL.
- **Verifikasi:** [`src/test/ep-jat-09.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-09.test.tsx) (5 tes lulus).

#### 8. EP-JAT-10: Progress Monitoring & Synchronization (`BLG-JAT-035` s/d `038`)
- **Implementasi:** Mesin kalkulasi progres terpusat tanpa angka statis (*zero hardcoded numbers*) di [`src/services/progressCalculator.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/progressCalculator.ts), distribusi status kecepatan siswa (*Pacing Distribution: On Track, Needs Reminder, Completed*), pratinjau dampak perubahan target di modal edit (`BR-08`), sinkronisasi batas tanggal (`BR-42`), dan kontrol `Recalculate Progress` dengan otorisasi peran (`BR-30`, `BR-43`, `DSN-TBD-02`).
- **Verifikasi:** [`src/test/ep-jat-10.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-10.test.tsx) (6 tes lulus).

#### 9. EP-JAT-11: Access Control & Destructive Safety (`BLG-JAT-039` s/d `041`)
- **Implementasi:** Penegakan izin pada tingkat layanan (*service layer*) di `batchRepository.ts` (`assertAdminAccess`), komponen pelindung antarmuka [`RoleGuard.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/components/common/RoleGuard.tsx), isolasi data antar-siswa, konfirmasi pengetikan nama persis untuk aksi destruktif (`ConfirmDestructiveModal.tsx`), dan pelindung klik ganda (*double-click guard*).
- **Verifikasi:** [`src/test/ep-jat-11.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-11.test.tsx) (5 tes lulus).

---

### Fase 4: Implementasi Inti Hybrid IDP (EP-JAT-05 & EP-JAT-06)
- **Tujuan:** Membangun *pipeline* ekstraksi dan validasi cerdas dokumen bukti lamaran kerja dengan arsitektur bersih (*clean architecture*).
- **Keputusan Arsitektur Kritis:**
  - Berdasarkan evaluasi privasi, biaya, dan dependensi lingkungan, tidak ada kredensial API mentah yang disematkan ke dalam repositori. Layanan eksternal OCR dan LLM Semantik diisolasi ke dalam modul *adapter* berstandar kontrak tipe data (`DEC-05`, `DEC-06`, `DEC-11`, `DEC-12`).
- **Aktivitas Utama:**
  1. **Preprocessing Gambar ([`imagePreprocessor.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/imagePreprocessor.ts)):** Validasi batas ukuran berkas 5MB (`BR-12`), tipe MIME gambar (`BR-11`), dan verifikasi biner *magic bytes* nyata (`0x89 0x50 0x4E 0x47` untuk PNG dan `0xFF 0xD8 0xFF` untuk JPEG) (`BR-34`).
  2. **Normalisasi Teks ([`textNormalizer.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/textNormalizer.ts)):** Pembersihan karakter kontrol tak terlihat (null bytes) (`BR-15`) dan deteksi otomatis frasa penutupan lowongan kerja (`BR-41`).
  3. **Ekstraksi Atribut Terstruktur ([`structuredAttributeExtractor.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/structuredAttributeExtractor.ts)):** Ekstraksi 7 atribut lowongan wajib (`BR-39`) dengan data asal (*provenance*) dan kebijakan nilai hilang tetap `null`/`unknown` tanpa rekayasa (`BR-18`).
  4. **Adapter OCR Terisolasi ([`ocrEngine.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/ocrEngine.ts)):** `MockOcrEngineAdapter` dengan metadata penanda status `BLOCKED_PENDING_DECISION`.
  5. **Validasi Aturan Deterministik ([`deterministicRuleValidator.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/deterministicRuleValidator.ts)):** Pencocokan leksikal token & bi-gram *Sørensen–Dice* dengan normalisasi badan hukum PT/CV/Tbk (`BR-16`, `BR-40`), ambang batas ketat >70% (`BR-17`), dan deteksi diskrepansi pengalaman vs level pekerjaan (`BR-19`).
  6. **Adapter Komparator Semantik ([`semanticComparator.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/semanticComparator.ts)):** `MockSemanticComparatorAdapter` sebagai komponen asistif dengan status `BLOCKED_PENDING_DECISION`.
  7. **Kebijakan Keputusan & Pengaman Non-Override ([`idpDecisionPolicy.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpDecisionPolicy.ts), [`idpValidationService.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpValidationService.ts)):** Menetapkan tingkatan keputusan: >=90% `Approved`, 60%–89% atau buram/terpotong `Waiting Confirmation`, dan format/tanggal salah `Rejected` (`BR-38`). Penegakan mutlak *Deterministic Non-Override Safeguard* di mana LLM dilarang menyetujui pelanggaran aturan deterministik (`BR-26`).
- **Verifikasi:** [`src/test/ep-jat-05.test.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-05.test.ts) (18 tes lulus) dan [`src/test/ep-jat-06.test.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-06.test.ts) (18 tes lulus).

---

### Fase 5: Penjaminan Mutu, Uji Integrasi E2E & Regresi (EP-JAT-12)
- **Tujuan:** Memvalidasi alur kerja utuh ujung-ke-ujung (*End-to-End*), menguji ketahanan terhadap kasus negatif ekstrem, mendokumentasikan hasil pengujian empiris, dan mengevaluasi penerimaan pengguna (UAT).
- **Aktivitas Utama:**
  - Menyusun dan mengeksekusi test suite [`src/test/ep-jat-12.test.tsx`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/test/ep-jat-12.test.tsx) yang mencakup alur utuh 9-langkah (`BLG-JAT-042`) serta pengujian regresi kasus negatif (`BLG-JAT-043`).
  - Menyusun dokumen rencana uji ([`docs/QA-TEST-PLAN.md`](../QA-TEST-PLAN.md)), hasil uji ([`docs/QA-TEST-RESULTS.md`](../QA-TEST-RESULTS.md)), matriks keterlacakan kebutuhan ([`docs/REQUIREMENTS-TRACEABILITY.md`](../REQUIREMENTS-TRACEABILITY.md)), dan evaluasi UAT ([`docs/UAT-EVALUATION.md`](../UAT-EVALUATION.md)).
- **Hasil Observasi:** Seluruh 12 test suite (97 tes) lulus 100% dan kompilasi `tsc -b` lulus tanpa galat.

---

### Fase 6: Audit Pasca Implementasi & Stabilisasi Sistem
- **Tujuan:** Melakukan audit independen terhadap seluruh kode, keterlacakan kebutuhan, fidelitas visual Stitch, dan kesiapan operasional sistem.
- **Hasil Audit:**
  - Mengidentifikasi batasan arsitektur prototipe (penyimpanan lokal vs RDBMS cloud, mock AI vs live cloud APIs).
  - Memverifikasi kepatuhan 100% terhadap 45 Aturan Bisnis.
  - Menetapkan rencana remediasi teknis prioritas (optimasi ukuran bundel JS di bawah 500 kB melalui *code-splitting*).

---

## 4. Status Sistem Saat Ini & Arah Pengembangan Selanjutnya

### 4.1 Status Saat Ini (Current State)
Purwarupa frontend telah selesai secara penuh (*Feature-Complete Prototype*). Seluruh interaksi pengguna Student dan Admin dapat dijalankan, diuji, dan didemonstrasikan secara interaktif melalui browser lokal menggunakan data sintetis yang realistis.

### 4.2 Arah Pengembangan Selanjutnya (Proposed Future Work)
1. **Penyedia OCR Produksi (`DEC-05`):** Menentukan dan mengintegrasikan layanan OCR cloud (seperti Google Cloud Document AI) setelah analisis biaya dan evaluasi akurasi teks Bahasa Indonesia.
2. **Penyedia LLM Produksi (`DEC-06`):** Menetapkan model LLM multimodal (seperti Google Gemini 1.5 Flash) dengan konfigurasi skema JSON terstruktur (*structured outputs*).
3. **Backend & Database Relasional (`DEC-02`, `DEC-03`):** Membangun layanan REST API berbasis Node.js/Go dengan basis data PostgreSQL untuk menggantikan `batchRepository` berbasis memori/lokal.
4. **Otentikasi & Otorisasi Nyata (`DEC-10`):** Mengintegrasikan sistem autentikasi SSO Dibimbing (JWT/OAuth2) dengan penegakan izin berbasis peran (RBAC) pada sisi server.
