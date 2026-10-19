# Requirements Traceability Matrix (RTM) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Versi:** 1.0.0
- **Status:** Complete / Fully Traceable
- **Tanggal:** 2026-10-19
- **Penanggung Jawab:** Senior QA Engineer & System Architect
- **Cakupan:** PRD (`JAT-BL-01` s/d `JAT-BL-18`), Backlog (`BLG-JAT-001` s/d `BLG-JAT-044`), Aturan Bisnis (`BR-01` s/d `BR-45`), Desain Stitch, Kode Sumber, dan Berkas Uji.

---

## 1. Matriks Keterlacakan Kebutuhan Utama (PRD to Code & Test)

| PRD ID | Deskripsi Kebutuhan | Epic ID | Backlog ID | Komponen UI / Service Sumber | Berkas Uji Terkait | Status Implementasi | Status Uji |
|---|---|---|---|---|---|---|---|
| **JAT-BL-01** | Admin Batch List & Search | EP-JAT-01 | BLG-JAT-001, BLG-JAT-002 | `AdminBatchListPage.tsx`, `batchRepository.ts` | `ep-jat-01.test.tsx` | Implemented | **Passed** |
| **JAT-BL-02** | Admin Create & Edit Batch Form | EP-JAT-01 | BLG-JAT-001, BLG-JAT-002, BLG-JAT-003 | `AdminBatchFormPage.tsx`, `batchRepository.ts` | `ep-jat-01.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-03** | Multi-phase, Date Ranges & Targets | EP-JAT-01 | BLG-JAT-002, BLG-JAT-003, BLG-JAT-004 | `AdminBatchFormPage.tsx`, `batchRepository.ts` | `ep-jat-01.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-04** | Admin Participant Management & Detail | EP-JAT-02 | BLG-JAT-005, BLG-JAT-006, BLG-JAT-007, BLG-JAT-008 | `AdminBatchDetailPage.tsx`, `AdminStudentDetailPage.tsx` | `ep-jat-02.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-05** | Student Batch View & Period Gating | EP-JAT-03 | BLG-JAT-009, BLG-JAT-010, BLG-JAT-011, BLG-JAT-012 | `StudentBatchListPage.tsx`, `StudentBatchDetailPage.tsx` | `ep-jat-03.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-06** | Student Application Submission Form | EP-JAT-04 | BLG-JAT-013, BLG-JAT-014, BLG-JAT-015, BLG-JAT-016 | `StudentAddProofDrawer.tsx`, `batchRepository.ts` | `ep-jat-04.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-07** | Application Evidence File Validation | EP-JAT-04 | BLG-JAT-014, BLG-JAT-015, BLG-JAT-016 | `StudentAddProofDrawer.tsx`, `imagePreprocessor.ts` | `ep-jat-04.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-08** | IDP Image Preprocessing & OCR Extraction | EP-JAT-05 | BLG-JAT-017, BLG-JAT-018, BLG-JAT-019 | `idpExtractionPipeline.ts`, `ocrEngine.ts`, `structuredAttributeExtractor.ts` | `ep-jat-05.test.ts`, `ep-jat-12.test.tsx` | Implemented (Mock Adapter) | **Passed** |
| **JAT-BL-09** | IDP Deterministic & Semantic Validation | EP-JAT-06 | BLG-JAT-020, BLG-JAT-021, BLG-JAT-022 | `idpValidationService.ts`, `deterministicRuleValidator.ts`, `semanticComparator.ts` | `ep-jat-06.test.ts`, `ep-jat-12.test.tsx` | Implemented (Mock Adapter) | **Passed** |
| **JAT-BL-10** | Student Validation Feedback & Status | EP-JAT-07 | BLG-JAT-023, BLG-JAT-024, BLG-JAT-025, BLG-JAT-026 | `StudentApplicationDetailDrawer.tsx`, `StudentBatchDetailPage.tsx` | `ep-jat-07.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-11** | Admin HITL Request Queue & Evidence Inspector | EP-JAT-08 | BLG-JAT-027, BLG-JAT-028, BLG-JAT-029, BLG-JAT-030 | `AdminRequestQueuePage.tsx`, `HitlEvidenceInspectorModal.tsx` | `ep-jat-08.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-12** | Admin Applied Jobs Table & Filter System | EP-JAT-09 | BLG-JAT-031, BLG-JAT-032, BLG-JAT-033, BLG-JAT-034 | `AdminAppliedJobsSection.tsx`, `batchRepository.ts` | `ep-jat-09.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-13** | Batch Progress Monitoring & Calculation | EP-JAT-10 | BLG-JAT-035, BLG-JAT-036, BLG-JAT-037, BLG-JAT-038 | `progressCalculator.ts`, `AdminBatchDetailPage.tsx` | `ep-jat-10.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-14** | Date-Range Synchronization & Active Window | EP-JAT-10 | BLG-JAT-037, BLG-JAT-038 | `progressCalculator.ts`, `batchRepository.ts` | `ep-jat-10.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-15** | Cohort Capacity & Validation KPI Breakdown | EP-JAT-10 | BLG-JAT-035, BLG-JAT-036, BLG-JAT-037, BLG-JAT-038 | `progressCalculator.ts`, `AdminBatchDetailPage.tsx` | `ep-jat-10.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-16** | Destructive Action Safety & Name Matching | EP-JAT-11 | BLG-JAT-040, BLG-JAT-041 | `ConfirmDestructiveModal.tsx`, `batchRepository.ts` | `ep-jat-11.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-17** | Role-Based Access Control & Service Guards | EP-JAT-11 | BLG-JAT-039, BLG-JAT-040, BLG-JAT-041 | `RoleGuard.tsx`, `batchRepository.ts` | `ep-jat-11.test.tsx`, `ep-jat-12.test.tsx` | Implemented | **Passed** |
| **JAT-BL-18** | Comprehensive QA Integration & Regression | EP-JAT-12 | BLG-JAT-042, BLG-JAT-043, BLG-JAT-044 | `src/test/ep-jat-12.test.tsx`, `docs/QA-*.md` | `ep-jat-12.test.tsx` (6 tests) | Implemented | **Passed** |

---

## 2. Pemetaan Aturan Bisnis (*Business Rules Traceability: BR-01 s/d BR-45*)

| Aturan Bisnis | Deskripsi Singkat | Komponen Penegak | Kasus Uji Verifikasi | Status |
|---|---|---|---|---|
| **BR-01** | Nama batch wajib diisi | `batchRepository.ts` | `ep-jat-01`, `ep-jat-12` | **Passed** |
| **BR-02** | Nama batch harus unik (case-insensitive) | `batchRepository.ts` | `ep-jat-01`, `ep-jat-12` | **Passed** |
| **BR-03** | Phase 1 wajib aktif, Phase 2 opsional | `batchRepository.ts`, `AdminBatchFormPage.tsx` | `ep-jat-01` | **Passed** |
| **BR-04** | Tanggal rentang tidak boleh tumpang tindih | `batchRepository.ts`, `dateUtils.ts` | `ep-jat-01`, `ep-jat-12` | **Passed** |
| **BR-05** | Target per level pekerjaan non-negatif | `batchRepository.ts` | `ep-jat-01` | **Passed** |
| **BR-06** | Tombol submit dinonaktifkan pada fase Upcoming | `StudentBatchDetailPage.tsx` | `ep-jat-03` | **Passed** |
| **BR-07** | Tombol submit dinonaktifkan pada fase Expired | `StudentBatchDetailPage.tsx` | `ep-jat-03` | **Passed** |
| **BR-08** | Pratinjau dampak konsekuensi sebelum simpan target | `AdminBatchFormPage.tsx` | `ep-jat-10` | **Passed** |
| **BR-09** | Hapus batch mewajibkan ketik nama persis | `ConfirmDestructiveModal.tsx`, `batchRepository.ts` | `ep-jat-01`, `ep-jat-11`, `ep-jat-12` | **Passed** |
| **BR-10** | Hapus peserta mengarsipkan data lamaran | `batchRepository.ts` | `ep-jat-02`, `ep-jat-12` | **Passed** |
| **BR-11** | Format bukti hanya JPG, JPEG, PNG | `imagePreprocessor.ts`, `StudentAddProofDrawer.tsx` | `ep-jat-04`, `ep-jat-05`, `ep-jat-12` | **Passed** |
| **BR-12** | Ukuran berkas maksimal 5MB dan tidak boleh 0 byte | `imagePreprocessor.ts`, `StudentAddProofDrawer.tsx` | `ep-jat-04`, `ep-jat-05`, `ep-jat-12` | **Passed** |
| **BR-13** | 8 atribut form lamaran wajib diisi | `StudentAddProofDrawer.tsx` | `ep-jat-04` | **Passed** |
| **BR-14** | Tanggal lamaran tidak boleh di masa depan | `batchRepository.ts`, `dateUtils.ts` | `ep-jat-04`, `ep-jat-12` | **Passed** |
| **BR-15** | Normalisasi teks membuang karakter kontrol/null | `textNormalizer.ts` | `ep-jat-05` | **Passed** |
| **BR-16** | Skor kemiripan leksikal berbasis token & bi-gram | `lexicalSimilarity.ts` | `ep-jat-06` | **Passed** |
| **BR-17** | Ambang batas kemiripan leksikal ketat > 70% | `deterministicRuleValidator.ts` | `ep-jat-06` | **Passed** |
| **BR-18** | Atribut tidak ditemukan diset null/unknown | `structuredAttributeExtractor.ts` | `ep-jat-05` | **Passed** |
| **BR-19** | Kesalahan deterministik format langsung Rejected | `idpDecisionPolicy.ts` | `ep-jat-06`, `ep-jat-12` | **Passed** |
| **BR-20** | Bukti buram/terpotong dialihkan ke Waiting Conf | `idpDecisionPolicy.ts` | `ep-jat-06` | **Passed** |
| **BR-21** | Kegagalan provider AI dialihkan ke Waiting Conf | `idpDecisionPolicy.ts`, `idpValidationService.ts` | `ep-jat-06`, `ep-jat-12` | **Passed** |
| **BR-22** | 3 Status Validasi resmi: Approved, Waiting, Rejected | `jat.ts`, `batchRepository.ts` | `ep-jat-07`, `ep-jat-12` | **Passed** |
| **BR-23** | Penjelasan alasan penolakan transparan | `StudentApplicationDetailDrawer.tsx` | `ep-jat-07`, `ep-jat-12` | **Passed** |
| **BR-24** | Penolakan HITL wajib menyertakan alasan | `AdminRequestQueuePage.tsx`, `batchRepository.ts` | `ep-jat-08`, `ep-jat-12` | **Passed** |
| **BR-25** | Riwayat audit peninjau tercatat lengkap | `batchRepository.ts` | `ep-jat-08`, `ep-jat-12` | **Passed** |
| **BR-26** | Rule Non-Override: LLM dilarang batalkan aturan deterministik | `idpValidationService.ts` | `ep-jat-06`, `ep-jat-12` | **Passed** |
| **BR-27** | Label mock/simulated ditampilkan transparan | `StudentApplicationDetailDrawer.tsx` | `ep-jat-07` | **Passed** |
| **BR-28** | Status Validasi JAT terpisah dari Recruitment Stage | Seluruh tabel, drawer, dan monitoring | `ep-jat-07`, `ep-jat-09`, `ep-jat-10` | **Passed** |
| **BR-29** | Persetujuan HITL memerlukan verifikasi sekunder | `AdminRequestQueuePage.tsx` | `ep-jat-08`, `ep-jat-12` | **Passed** |
| **BR-30** | Recalculate Progress dibatasi hanya untuk Admin | `batchRepository.ts`, `AdminBatchDetailPage.tsx` | `ep-jat-10`, `ep-jat-11` | **Passed** |
| **BR-31** | Filter terpadu (Fase, Range, Status, Keyword) | `AdminAppliedJobsSection.tsx`, `AdminRequestQueuePage.tsx` | `ep-jat-08`, `ep-jat-09` | **Passed** |
| **BR-32** | Item ditinjau otomatis keluar dari antrean HITL | `batchRepository.ts` | `ep-jat-08`, `ep-jat-12` | **Passed** |
| **BR-33** | Penegakan izin Student vs Admin pada service layer | `batchRepository.ts` | `ep-jat-11`, `ep-jat-12` | **Passed** |
| **BR-34** | Verifikasi magic bytes berkas gambar | `imagePreprocessor.ts` | `ep-jat-05`, `ep-jat-12` | **Passed** |
| **BR-35** | Pembersihan spasi berlebih pada input | `batchRepository.ts` | `ep-jat-01`, `ep-jat-04` | **Passed** |
| **BR-36** | Preservasi data lamaran asli saat diverifikasi | `batchRepository.ts` | `ep-jat-08`, `ep-jat-12` | **Passed** |
| **BR-37** | Chip status validasi konsisten dengan desain Stitch | `StatusBadge.tsx` | `ep-jat-07` | **Passed** |
| **BR-38** | Kebijakan keputusan berjenjang (90/60/0) | `idpDecisionPolicy.ts` | `ep-jat-06` | **Passed** |
| **BR-39** | Ekstraksi 7 atribut lowongan standar | `structuredAttributeExtractor.ts` | `ep-jat-05`, `ep-jat-08` | **Passed** |
| **BR-40** | Normalisasi entitas badan hukum dalam pembandingan | `lexicalSimilarity.ts` | `ep-jat-06` | **Passed** |
| **BR-41** | Deteksi frasa lowongan ditutup | `textNormalizer.ts` | `ep-jat-05` | **Passed** |
| **BR-42** | Snapshot jendela tanggal saat submit lamaran | `batchRepository.ts` | `ep-jat-10` | **Passed** |
| **BR-43** | Penolakan eskalasi peran tanpa otorisasi | `batchRepository.ts`, `RoleGuard.tsx` | `ep-jat-11`, `ep-jat-12` | **Passed** |
| **BR-44** | Batas panjang karakter input teks | Form components | `ep-jat-01`, `ep-jat-04` | **Passed** |
| **BR-45** | Tanggal lamaran di luar rentang aktif ditolak | `batchRepository.ts` | `ep-jat-04`, `ep-jat-12` | **Passed** |

---

## 3. Kesimpulan Keterlacakan

Seluruh 18 kebutuhan PRD dan 45 Aturan Bisnis telah terpetakan secara utuh (*100% Traceability Coverage*), memiliki implementasi kode konkret, dan diverifikasi oleh rangkaian tes otomatis yang lulus tanpa pengecualian.
