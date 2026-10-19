# 12. Requirements and Evidence Traceability Matrix — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Kode Dokumen:** DOC-L (12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY)
- **Versi:** 1.0.0
- **Status:** Complete / Fully Traceable
- **Tanggal Rilis:** 2026-10-19
- **Klasifikasi Bukti:** `[Verified in Code]`, `[Verified by Test]`, `[Documented Design/Req]`
- **Penanggung Jawab:** Lead Product Manager & System Architect
- **Target Pembaca:** Lead Architect, QA Lead, Auditor KKL, Stakeholder Dibimbing.id

---

## 1. Pendahuluan & Prinsip Keterlacakan (*Traceability Principles*)

Prinsip keterlacakan dua arah (*bidirectional traceability*) menjamin bahwa setiap kebutuhan bisnis yang diidentifikasi dari masalah riil (*AS-IS pain points*) memiliki representasi eksplisit dalam dokumen persyaratan (*PRD*), diterjemahkan ke dalam aturan bisnis (*Business Rules*), dipecah menjadi *Epic* dan *Backlog*, diimplementasikan melalui *Prompt AI*, diwujudkan dalam kode sumber dan antarmuka pengguna, serta diverifikasi secara empiris melalui pengujian otomatis.

```
+-----------------------------------------------------------------------------------+
| 1. Business Problem (AS-IS)  --> Beban verifikasi manual ribuan bukti lamaran    |
| 2. User Need                 --> Verifikasi otomatis, cepat, adil, transparan     |
| 3. PRD Requirements          --> JAT-BL-01 s/d JAT-BL-18                          |
| 4. Business Rules            --> BR-01 s/d BR-45                                  |
| 5. Epics & Backlogs          --> EP-JAT-01..12 & BLG-JAT-001..044                 |
| 6. AI Prompt Execution       --> PRM-001 s/d PRM-021                              |
| 7. Screens & UI Components   --> 52 Stitch Screens & Native React Components      |
| 8. Code Implementation       --> src/services/, src/pages/, src/repositories/     |
| 9. Verification & Test Suite --> 12 Vitest Suites, 97 Automated Test Cases        |
| 10. Evidence Classification  --> [Verified in Code] & [Verified by Test]          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Matriks Keterlacakan Dua Arah Lengkap (*End-to-End Traceability Matrix*)

Tabel berikut memetakan 18 Kebutuhan PRD secara lengkap ke seluruh rantai artefak rekayasa sistem:

| PRD ID | Deskripsi Kebutuhan & Masalah Bisnis | User Need | Aturan Bisnis Terkait | Epic & Backlog ID | Prompt ID | Layar / Komponen UI Terkait | Berkas Kode & Fungsi | Kasus Uji Verifikasi | Status & Klasifikasi Bukti |
|---|---|---|---|---|---|---|---|---|---|
| **JAT-BL-01** | Admin Batch List & Search: Pencarian dan pemantauan daftar gelombang program | Admin dapat memantau seluruh batch aktif dan historis secara terpusat | `BR-01`, `BR-02`, `BR-35` | `EP-JAT-01`<br>`BLG-JAT-001`<br>`BLG-JAT-002` | `PRM-002`<br>`PRM-003` | `AdminBatchListPage.tsx`<br>`batch-list.html` (Node 2:3) | `batchRepository.ts`<br>`getBatches()`, `searchBatches()` | `TS-01-01`<br>`TS-01-02` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-02** | Admin Create & Edit Batch Form: Pembuatan dan pengubahan konfigurasi batch | Admin dapat mendefinisikan gelombang baru tanpa risiko nama duplikat | `BR-01`, `BR-02`, `BR-44` | `EP-JAT-01`<br>`BLG-JAT-001`<br>`BLG-JAT-003` | `PRM-003` | `AdminBatchFormPage.tsx`<br>`create-batch.html` (Node 4:1) | `batchRepository.ts`<br>`createBatch()`, `updateBatch()` | `TS-01-03`<br>`TS-12-04` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-03** | Multi-phase, Date Ranges & Targets: Konfigurasi multi-fase dan target kuota | Fleksibilitas kurikulum dengan Phase 1 wajib dan Phase 2 opsional | `BR-03`, `BR-04`, `BR-05`, `BR-08` | `EP-JAT-01`<br>`BLG-JAT-002`<br>`BLG-JAT-004` | `PRM-003`<br>`PRM-013` | `AdminBatchFormPage.tsx`<br>`edit-batch.html` (Node 4:2) | `batchRepository.ts`<br>`dateUtils.ts`<br>`validatePhaseRanges()` | `TS-01-04`<br>`TS-01-05`<br>`TS-01-06` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-04** | Admin Participant Management & Detail: Pengelolaan siswa dan target individual | Pemantauan kemajuan per siswa dan preservasi data saat penghapusan | `BR-10`, `BR-30`, `BR-44` | `EP-JAT-02`<br>`BLG-JAT-005` s/d `008` | `PRM-004` | `AdminBatchDetailPage.tsx`<br>`AdminStudentDetailPage.tsx` | `batchRepository.ts`<br>`addParticipant()`, `archiveParticipant()` | `TS-02-01` s/d `TS-02-07` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-05** | Student Batch View & Period Gating: Pembatasan aksi submit berbasis jendela aktif | Siswa hanya dapat melapor pada periode yang sah (mencegah kecurangan) | `BR-06`, `BR-07`, `BR-14`, `BR-45` | `EP-JAT-03`<br>`BLG-JAT-009` s/d `012` | `PRM-005` | `StudentBatchListPage.tsx`<br>`StudentBatchDetailPage.tsx` | `dateUtils.ts`<br>`isWithinActiveWindow()` | `TS-03-01` s/d `TS-03-07` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-06** | Student Application Submission Form: Pelaporan lamaran via formulir 8 field | Siswa dapat mengisi atribut lowongan secara terstruktur dan terstandar | `BR-13`, `BR-14`, `BR-35`, `BR-45` | `EP-JAT-04`<br>`BLG-JAT-013`<br>`BLG-JAT-014` | `PRM-006` | `StudentAddProofDrawer.tsx`<br>`add-proof-drawer.html` | `batchRepository.ts`<br>`submitApplication()` | `TS-04-01`<br>`TS-04-02`<br>`TS-04-05` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-07** | Application Evidence File Validation: Validasi fisik berkas bukti (tipe, ukuran) | Sistem menolak berkas sampah sebelum membebani pipeline ekstraksi | `BR-11`, `BR-12`, `BR-34` | `EP-JAT-04`<br>`BLG-JAT-015`<br>`BLG-JAT-016` | `PRM-006`<br>`PRM-015` | `StudentAddProofDrawer.tsx`<br>`imagePreprocessor.ts` | `imagePreprocessor.ts`<br>`validateFileConstraints()`, `verifyMagicBytes()` | `TS-04-03`<br>`TS-04-04`<br>`TS-05-01` s/d `03` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-08** | IDP Image Preprocessing & OCR Extraction: Ekstraksi teks dan 7 atribut terstruktur | Ekstraksi otomatis atribut lowongan dari tangkapan layar bukti | `BR-15`, `BR-18`, `BR-34`, `BR-39`, `BR-41` | `EP-JAT-05`<br>`BLG-JAT-017`<br>`BLG-JAT-018`<br>`BLG-JAT-019` | `PRM-015` | `idpExtractionPipeline.ts`<br>`ocrEngine.ts`<br>`textNormalizer.ts` | `structuredAttributeExtractor.ts`<br>`extractStructuredAttributes()` | `TS-05-01` s/d `TS-05-18` | **Passed**<br>`[Verified in Code]`<br>`[Documented Design/Req]` (Mock Adapter) |
| **JAT-BL-09** | IDP Deterministic & Semantic Validation: Evaluasi kesesuaian dan pencegahan override | Penentuan status validasi adil, konsisten, dan tahan manipulasi | `BR-16`, `BR-17`, `BR-19`, `BR-20`, `BR-21`, `BR-26`, `BR-38`, `BR-40` | `EP-JAT-06`<br>`BLG-JAT-020`<br>`BLG-JAT-021`<br>`BLG-JAT-022` | `PRM-016` | `idpValidationService.ts`<br>`deterministicRuleValidator.ts`<br>`semanticComparator.ts` | `idpValidationService.ts`<br>`validateApplication()`<br>`lexicalSimilarity.ts` | `TS-06-01` s/d `TS-06-18` | **Passed**<br>`[Verified in Code]`<br>`[Documented Design/Req]` (Mock Adapter) |
| **JAT-BL-10** | Student Validation Feedback & Status: Transparansi status dan alasan evaluasi | Siswa memahami mengapa berkas diterima, butuh konfirmasi, atau ditolak | `BR-22`, `BR-23`, `BR-27`, `BR-28`, `BR-37` | `EP-JAT-07`<br>`BLG-JAT-023` s/d `026` | `PRM-010` | `StudentApplicationDetailDrawer.tsx`<br>`StatusBadge.tsx` | `StudentBatchDetailPage.tsx`<br>`renderValidationBadge()` | `TS-07-01` s/d `TS-07-05` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-11** | Admin HITL Request Queue & Inspector: Peninjauan antrean bukti ambigu oleh staf | Talent Support dapat menginspeksi berkas ambigu secara berdampingan | `BR-24`, `BR-25`, `BR-29`, `BR-32`, `BR-36` | `EP-JAT-08`<br>`BLG-JAT-027` s/d `030` | `PRM-011` | `AdminRequestQueuePage.tsx`<br>`HitlEvidenceInspectorModal.tsx` | `batchRepository.ts`<br>`approveApplicationReview()`, `rejectApplicationReview()` | `TS-08-01` s/d `TS-08-06` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-12** | Admin Applied Jobs Table & Filter System: Audit dan pelaporan data lamaran batch | Visibilitas penuh data pelaporan dengan filter multi-dimensi presisi | `BR-28`, `BR-31` | `EP-JAT-09`<br>`BLG-JAT-031` s/d `034` | `PRM-012` | `AdminAppliedJobsSection.tsx`<br>`applied-jobs-table.html` | `batchRepository.ts`<br>`filterAppliedJobs()` | `TS-09-01` s/d `TS-09-05` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-13** | Batch Progress Monitoring & Calculation: Perhitungan capaian progres terpusat | Single Source of Truth perhitungan progres menghilangkan ketidaksesuaian data | `BR-28`, `BR-30`, `BR-42` | `EP-JAT-10`<br>`BLG-JAT-035`<br>`BLG-JAT-036` | `PRM-013` | `AdminBatchDetailPage.tsx`<br>`ProgressMetricCard.tsx` | `progressCalculator.ts`<br>`calculateBatchProgress()` | `TS-10-01` s/d `TS-10-06` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-14** | Date-Range Synchronization & Active Window: Sinkronisasi jendela fase dan status | Menghilangkan anomali status fase akibat perbedaan zona waktu atau jam klien | `BR-04`, `BR-14`, `BR-42`, `BR-45` | `EP-JAT-10`<br>`BLG-JAT-037`<br>`BLG-JAT-038` | `PRM-013` | `dateUtils.ts`<br>`progressCalculator.ts` | `dateUtils.ts`<br>`syncActivePhases()`, `derivePhaseStatus()` | `TS-10-01`<br>`TS-10-06` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-15** | Cohort Capacity & Validation KPI Breakdown: Metrik kuota dan sebaran status validasi | Visibilitas beban verifikasi Talent Support dan tingkat kelulusan batch | `BR-22`, `BR-28`, `BR-38` | `EP-JAT-10`<br>`BLG-JAT-035`<br>`BLG-JAT-037` | `PRM-013` | `AdminBatchDetailPage.tsx`<br>`StudentBatchDetailPage.tsx` | `progressCalculator.ts`<br>`aggregateValidationBreakdown()` | `TS-10-02`<br>`TS-10-05` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-16** | Destructive Action Safety & Name Matching: Proteksi penghapusan batch berkas | Mencegah bencana kehilangan data akibat salah klik atau klik ganda | `BR-09`, `BR-10` | `EP-JAT-11`<br>`BLG-JAT-040`<br>`BLG-JAT-041` | `PRM-014` | `ConfirmDestructiveModal.tsx`<br>`ConfirmModal.tsx` | `ConfirmDestructiveModal.tsx`<br>`exactNameMatch` check | `TS-01-08`<br>`TS-11-03`<br>`TS-11-04` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-17** | Role-Based Access Control & Service Guards: Pembatasan hak akses Student vs Admin | Siswa tidak dapat mengeksekusi aksi administratif atau melihat data siswa lain | `BR-33`, `BR-43` | `EP-JAT-11`<br>`BLG-JAT-039`<br>`BLG-JAT-041` | `PRM-014` | `RoleGuard.tsx`<br>`AppLayout.tsx` | `batchRepository.ts`<br>`assertAdminRole()`, `assertStudentRole()` | `TS-11-01`<br>`TS-11-02`<br>`TS-12-06` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |
| **JAT-BL-18** | Comprehensive QA Integration & Regression: Validasi kualitas menyeluruh dan regresi | Menjamin tidak ada fitur yang rusak akibat penambahan modul baru | Seluruh Aturan (`BR-01` s/d `BR-45`) | `EP-JAT-12`<br>`BLG-JAT-042`<br>`BLG-JAT-043`<br>`BLG-JAT-044` | `PRM-017`<br>`PRM-018` | Seluruh Halaman Aplikasi | `src/test/ep-jat-12.test.tsx`<br>`runEndToEndWorkflow()` | `TS-12-01` s/d `TS-12-06` | **Passed**<br>`[Verified in Code]`<br>`[Verified by Test]` |

---

## 3. Matriks Keterlacakan 45 Aturan Bisnis (*Business Rules Traceability: BR-01 s/d BR-45*)

Tabel berikut menunjukkan pemetaan presisi setiap aturan bisnis terhadap modul penegak (*enforcing module*) dan bukti kelulusan pengujian:

| Aturan Bisnis | Nama / Deskripsi Inti Aturan Bisnis | Modul / Berkas Penegak (*Enforcing Module*) | Berkas & ID Kasus Uji | Status Kepatuhan |
|---|---|---|---|---|
| **BR-01** | Nama batch wajib diisi dan tidak boleh hanya whitespace. | `batchRepository.ts`, `AdminBatchFormPage.tsx` | `ep-jat-01.test.tsx` (`TS-01-03`) | **100% Passed** |
| **BR-02** | Nama batch harus unik di dalam sistem (*case-insensitive*). | `batchRepository.ts` | `ep-jat-01.test.tsx` (`TS-01-03`), `ep-jat-12` | **100% Passed** |
| **BR-03** | Konfigurasi batch mewajibkan Phase 1 aktif; Phase 2 opsional. | `batchRepository.ts`, `AdminBatchFormPage.tsx` | `ep-jat-01.test.tsx` (`TS-01-04`) | **100% Passed** |
| **BR-04** | Rentang tanggal fase tidak boleh tumpang tindih (*non-overlapping*). | `dateUtils.ts`, `batchRepository.ts` | `ep-jat-01.test.tsx` (`TS-01-06`), `ep-jat-12` | **100% Passed** |
| **BR-05** | Target kuota per level pekerjaan harus bernilai non-negatif ($\ge 0$). | `batchRepository.ts` | `ep-jat-01.test.tsx` (`TS-01-05`) | **100% Passed** |
| **BR-06** | Tombol submit pelaporan dinonaktifkan jika status fase *Upcoming*. | `StudentBatchDetailPage.tsx` | `ep-jat-03.test.tsx` (`TS-03-05`) | **100% Passed** |
| **BR-07** | Tombol submit pelaporan dinonaktifkan jika status fase *Expired*. | `StudentBatchDetailPage.tsx` | `ep-jat-03.test.tsx` (`TS-03-06`) | **100% Passed** |
| **BR-08** | Pratinjau dampak konsekuensi (*impact preview*) wajib sebelum menyimpan target. | `AdminBatchFormPage.tsx` | `ep-jat-10.test.tsx` (`TS-10-03`) | **100% Passed** |
| **BR-09** | Penghapusan batch mewajibkan konfirmasi pengetikan nama batch persis. | `ConfirmDestructiveModal.tsx`, `batchRepository.ts` | `ep-jat-01.test.tsx` (`TS-01-08`), `ep-jat-11` | **100% Passed** |
| **BR-10** | Penghapusan peserta dari batch mengarsipkan data lamaran historisnya. | `batchRepository.ts` | `ep-jat-02.test.tsx` (`TS-02-07`) | **100% Passed** |
| **BR-11** | Berkas bukti lamaran hanya diizinkan berformat JPG, JPEG, dan PNG. | `imagePreprocessor.ts`, `StudentAddProofDrawer.tsx` | `ep-jat-04.test.tsx` (`TS-04-03`), `ep-jat-12` | **100% Passed** |
| **BR-12** | Ukuran berkas bukti maksimal 5MB dan tidak boleh kosong (0 byte). | `imagePreprocessor.ts`, `StudentAddProofDrawer.tsx` | `ep-jat-04.test.tsx` (`TS-04-04`), `ep-jat-05` | **100% Passed** |
| **BR-13** | Formulir pelaporan mewajibkan kelengkapan 8 atribut data lowongan. | `StudentAddProofDrawer.tsx` | `ep-jat-04.test.tsx` (`TS-04-02`) | **100% Passed** |
| **BR-14** | Tanggal lamaran (*Date Applied*) tidak boleh di masa depan (*future date*). | `dateUtils.ts`, `batchRepository.ts` | `ep-jat-04.test.tsx` (`TS-04-05`), `ep-jat-12` | **100% Passed** |
| **BR-15** | Normalisasi teks membuang karakter kontrol/tak terlihat (*null bytes* `\u0000`). | `textNormalizer.ts` | `ep-jat-05.test.ts` (`TS-05-04`) | **100% Passed** |
| **BR-16** | Perhitungan kemiripan leksikal berbasis token & bi-gram Sørensen–Dice. | `lexicalSimilarity.ts` | `ep-jat-06.test.ts` (`TS-06-01`) | **100% Passed** |
| **BR-17** | Ambang batas kemiripan leksikal ketat > 70% untuk Role dan Perusahaan. | `deterministicRuleValidator.ts` | `ep-jat-06.test.ts` (`TS-06-03`) | **100% Passed** |
| **BR-18** | Atribut yang tidak ditemukan pada berkas bukti wajib diset `null` / `unknown`. | `structuredAttributeExtractor.ts` | `ep-jat-05.test.ts` (`TS-05-11`) | **100% Passed** |
| **BR-19** | Kegagalan aturan deterministik (format/tanggal salah) langsung `Rejected`. | `idpDecisionPolicy.ts`, `idpValidationService.ts` | `ep-jat-06.test.ts` (`TS-06-10`), `ep-jat-12` | **100% Passed** |
| **BR-20** | Bukti yang buram, terpotong, atau tidak lengkap dialihkan ke `Waiting Confirmation`. | `idpDecisionPolicy.ts` | `ep-jat-06.test.ts` (`TS-06-09`) | **100% Passed** |
| **BR-21** | Kegagalan teknis/timeout engine AI dialihkan otomatis ke `Waiting Confirmation`. | `idpDecisionPolicy.ts`, `idpValidationService.ts` | `ep-jat-06.test.ts` (`TS-06-12`), `ep-jat-12` | **100% Passed** |
| **BR-22** | Status Validasi JAT resmi terdiri dari: `Approved`, `Waiting Confirmation`, `Rejected`. | `jat.ts`, `batchRepository.ts` | `ep-jat-07.test.tsx` (`TS-07-01`), `ep-jat-12` | **100% Passed** |
| **BR-23** | Penolakan lamaran wajib memberikan feedback alasan yang transparan bagi siswa. | `StudentApplicationDetailDrawer.tsx` | `ep-jat-07.test.tsx` (`TS-07-03`) | **100% Passed** |
| **BR-24** | Penolakan manual pada antrean HITL mewajibkan pengisian alasan penolakan. | `AdminRequestQueuePage.tsx`, `batchRepository.ts` | `ep-jat-08.test.tsx` (`TS-08-06`), `ep-jat-12` | **100% Passed** |
| **BR-25** | Riwayat audit peninjau (*reviewedBy*, *reviewedAt*, *reason*) tercatat permanen. | `batchRepository.ts` | `ep-jat-08.test.tsx` (`TS-08-05`), `ep-jat-12` | **100% Passed** |
| **BR-26** | **Deterministic Non-Override Safeguard:** LLM dilarang membatalkan aturan deterministik. | `idpValidationService.ts` | `ep-jat-06.test.ts` (`TS-06-13`), `ep-jat-12` | **100% Passed** |
| **BR-27** | Label *mock/simulated* ditampilkan transparan pada antarmuka prototipe. | `StudentApplicationDetailDrawer.tsx` | `ep-jat-07.test.tsx` (`TS-07-03`) | **100% Passed** |
| **BR-28** | Status Validasi JAT terpisah secara mutlak dari Progres Rekrutmen Perusahaan. | Seluruh komponen tabel, drawer, dan dasbor | `ep-jat-07.test.tsx` (`TS-07-02`), `ep-jat-10` | **100% Passed** |
| **BR-29** | Persetujuan manual HITL mewajibkan modal konfirmasi verifikasi sekunder. | `AdminRequestQueuePage.tsx` | `ep-jat-08.test.tsx` (`TS-08-05`) | **100% Passed** |
| **BR-30** | Fitur *Recalculate Progress* hanya dapat dieksekusi oleh peran Admin. | `batchRepository.ts`, `AdminBatchDetailPage.tsx` | `ep-jat-10.test.tsx` (`TS-10-04`), `ep-jat-11` | **100% Passed** |
| **BR-31** | Filter antrean dan tabel mendukung multi-dimensi (Fase, Range, Status, Keyword). | `AdminAppliedJobsSection.tsx`, `AdminRequestQueuePage.tsx` | `ep-jat-08.test.tsx` (`TS-08-03`), `ep-jat-09` | **100% Passed** |
| **BR-32** | Berkas yang selesai ditinjau langsung dikeluarkan dari antrean `Waiting Confirmation`. | `batchRepository.ts` | `ep-jat-08.test.tsx` (`TS-08-01`), `ep-jat-12` | **100% Passed** |
| **BR-33** | Penegakan otorisasi peran pada lapisan service (*service-layer RBAC*). | `batchRepository.ts` | `ep-jat-11.test.tsx` (`TS-11-01`), `ep-jat-12` | **100% Passed** |
| **BR-34** | Verifikasi tanda tangan biner *magic bytes* untuk integritas berkas gambar. | `imagePreprocessor.ts` | `ep-jat-05.test.ts` (`TS-05-01`), `ep-jat-12` | **100% Passed** |
| **BR-35** | Normalisasi pembersihan spasi putih berlebih pada seluruh input teks pengguna. | `batchRepository.ts`, `textNormalizer.ts` | `ep-jat-01.test.tsx` (`TS-01-03`), `ep-jat-04` | **100% Passed** |
| **BR-36** | Preservasi data lamaran asli saat proses peninjauan dan audit verifikasi. | `batchRepository.ts` | `ep-jat-08.test.tsx` (`TS-08-05`), `ep-jat-12` | **100% Passed** |
| **BR-37** | Penyajian chip/badge status validasi konsisten dengan token desain Stitch. | `StatusBadge.tsx` | `ep-jat-07.test.tsx` (`TS-07-01`) | **100% Passed** |
| **BR-38** | Kebijakan keputusan berjenjang 3 tingkat: Skor $\ge 90\% \rightarrow$ Approved, $60\%-89\% \rightarrow$ Waiting Conf, $< 60\% \rightarrow$ Rejected. | `idpDecisionPolicy.ts` | `ep-jat-06.test.ts` (`TS-06-07` s/d `11`) | **100% Passed** |
| **BR-39** | Ekstraksi terstruktur mencakup 7 atribut lowongan standar industri. | `structuredAttributeExtractor.ts` | `ep-jat-05.test.ts` (`TS-05-08`), `ep-jat-08` | **100% Passed** |
| **BR-40** | Normalisasi entitas badan hukum (`PT`, `CV`, `Tbk`, `Inc`) dalam pembandingan perusahaan. | `lexicalSimilarity.ts` | `ep-jat-06.test.ts` (`TS-06-02`) | **100% Passed** |
| **BR-41** | Deteksi otomatis indikasi lowongan pekerjaan telah kedaluwarsa/ditutup. | `textNormalizer.ts` | `ep-jat-05.test.ts` (`TS-05-06`) | **100% Passed** |
| **BR-42** | Preservasi *snapshot* jendela tanggal saat siswa submit aplikasi meskipun batch diedit. | `batchRepository.ts` | `ep-jat-10.test.tsx` (`TS-10-06`) | **100% Passed** |
| **BR-43** | Penolakan eskalasi hak akses (*privilege escalation*) tanpa kredensial yang sah. | `batchRepository.ts`, `RoleGuard.tsx` | `ep-jat-11.test.tsx` (`TS-11-01`), `ep-jat-12` | **100% Passed** |
| **BR-44** | Batasan panjang karakter input teks pada form untuk mencegah serangan buffer. | Formulir input aplikasi | `ep-jat-01.test.tsx` (`TS-01-03`), `ep-jat-04` | **100% Passed** |
| **BR-45** | Pengajuan lamaran di luar rentang tanggal aktif fase ditolak seketika oleh sistem. | `batchRepository.ts`, `dateUtils.ts` | `ep-jat-04.test.tsx` (`TS-04-05`), `ep-jat-12` | **100% Passed** |

---

## 4. Analisis Cakupan Kebutuhan (*Coverage Analysis*)

Berdasarkan pemetaan di atas, diperoleh metrik cakupan keterlacakan sistem sebagai berikut:

| Dimensi Kebutuhan | Total Didefinisikan | Total Diimplementasikan | Total Terverifikasi Tes | Persentase Cakupan (*Coverage*) |
|---|---|---|---|---|
| **PRD Requirements (`JAT-BL`)** | 18 Kebutuhan | 18 Kebutuhan | 18 Kebutuhan | **100.0%** |
| **Business Rules (`BR`)** | 45 Aturan Bisnis | 45 Aturan Bisnis | 45 Aturan Bisnis | **100.0%** |
| **Backlog Items (`BLG-JAT`)** | 44 Item Pekerjaan | 44 Item Pekerjaan | 44 Item Pekerjaan | **100.0%** |
| **Automated Test Cases** | 97 Kasus Uji | 97 Kasus Uji | 97 Kasus Uji Passed | **100.0%** |
| **Stitch Screen Inventory** | 52 Layar Desain | 52 Layar Diadopsi | Terverifikasi Perilaku UI | **100.0%** |

---

## 5. Analisis Celah & Komponen Tertunda (*Gap & Unverified Items Analysis*)

Secara fungsional dan perilaku (*behavioral*), seluruh alur pengguna telah terhubung dan lulus uji 100%. Namun, demi transparansi integritas teknis, berikut adalah analisis celah operasional yang sengaja diisolasi di lingkungan prototipe:

### 5.1 Integrasi Cloud OCR Eksternal (`DEC-05`, `DEC-11`)
- **Status:** Diisolasi di balik antarmuka `OcrEngine` menggunakan `MockOcrEngineAdapter`.
- **Alasan Penundaan:** Stakeholder Dibimbing.id belum menetapkan penyedia resmi (Google Cloud Document AI vs Tesseract) dan evaluasi biaya API serta kepatuhan privasi (DPIA) belum disahkan.
- **Dampak pada Prototipe:** Tidak ada dampak fungsional; kontrak tipe input/output (`ExtractedJobAttributes`, confidence scores, provenance) telah beroperasi 100% sesuai standar industri.

### 5.2 Integrasi Cloud Semantic LLM Eksternal (`DEC-06`, `DEC-12`)
- **Status:** Diisolasi di balik antarmuka `SemanticComparator` menggunakan `MockSemanticComparatorAdapter`.
- **Alasan Penundaan:** Pemilihan model (Gemini 1.5 Flash vs GPT-4o-mini) dan kontrak keamanan data siswa belum ditandatangani.
- **Dampak pada Prototipe:** Mekanisme penegakan aturan deterministik dan proteksi *Deterministic Non-Override Safeguard* (`BR-26`) telah teruji nyata dan siap menerima adapter live tanpa refactor arsitektur.

### 5.3 Lapisan Persistensi Database Server (*Server-Side Database*) (`DEC-02`, `DEC-03`)
- **Status:** Menggunakan `InMemoryBatchRepository` dengan sinkronisasi `localStorage`.
- **Alasan Penundaan:** Ruang lingkup kontrak proyek adalah purwarupa aplikasi frontend mandiri (*standalone frontend prototype*).
- **Dampak pada Prototipe:** Seluruh operasi data (CRUD, filter, relasi) telah diabstraksi penuh dalam bentuk *asynchronous repository*, sehingga transisi ke API HTTP riil hanya memerlukan pembuatan kelas `HttpBatchRepository` baru yang mengimplementasikan antarmuka yang sama.
