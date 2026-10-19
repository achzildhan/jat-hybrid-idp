# Product Backlog — JAT Hybrid IDP

Semua Epic/Backlog di bawah adalah **rancangan awal** berdasarkan PRD dan artefak pengujian. ID `BLG-JAT-xxx`, sprint mapping, dan story points belum dikonfirmasi tim. Tanggal pelaksanaan tidak ditentukan di dokumen ini karena belum ada catatan sprint historis.

## 1. Epic

| Epic ID | PRD Requirement | Judul Epic | Priority |
|---|---|---|---|
| EP-JAT-01 | JAT-BL-01,JAT-BL-02,JAT-BL-03 | [JAT][Batch Management] Pengelolaan batch, fase, periode, dan target | High |
| EP-JAT-02 | JAT-BL-04 | [JAT][Participant Management] Pengelolaan peserta dan detail Student | High |
| EP-JAT-03 | JAT-BL-05 | [JAT][Student View] Penyajian batch, periode, target, dan progres Student | High |
| EP-JAT-04 | JAT-BL-06,JAT-BL-07 | [JAT][Application Submission] Pelaporan aktivitas lamaran dan validasi berkas | High |
| EP-JAT-05 | JAT-BL-08 | [JAT][Hybrid IDP Extraction] Pemrosesan gambar, OCR, dan ekstraksi informasi | High |
| EP-JAT-06 | JAT-BL-09 | [JAT][Hybrid IDP Validation] Validasi kesesuaian informasi dan bukti | High |
| EP-JAT-07 | JAT-BL-10 | [JAT][Validation Feedback] Penyajian status dan feedback | High |
| EP-JAT-08 | JAT-BL-11 | [JAT][Human-in-the-Loop] Pemeriksaan dan tindak lanjut Request | High |
| EP-JAT-09 | JAT-BL-12 | [JAT][Applied Jobs Management] Pengelolaan data lamaran dan filter | High |
| EP-JAT-10 | JAT-BL-13,JAT-BL-14,JAT-BL-15 | [JAT][Progress Monitoring] Sinkronisasi target, progres, dan monitoring | High |
| EP-JAT-11 | JAT-BL-16,JAT-BL-17 | [JAT][Access Control] Pembatasan hak akses dan pengamanan tindakan | High |
| EP-JAT-12 | JAT-BL-18 | [JAT][Quality Assurance] Pengujian kebutuhan dan integrasi sistem | High |

## 2. Backlog Tasks

Konvensi judul: `[JAT][Feature][Assignee] Deskripsi Tugas Ringkas`. Assignee adalah peran: UIUX, FE, BE, atau QA. Sprint ID hanya usulan grouping SP-01 sampai SP-06. Story points merupakan estimasi awal untuk membantu perencanaan dan harus dikonfirmasi ulang bersama tim.

| Backlog ID | Judul Backlog | Deskripsi Backlog | Assignee | Epic ID | Sprint ID (usulan) | Story Points (estimasi) | Start Date | End Date | PRD Link |
|---|---|---|---|---|---|---:|---|---|---|
| BLG-JAT-001 | `[JAT][Batch][UIUX] Merancang daftar dan formulir batch` | Rancang daftar batch/pencarian, form create/edit, fase, date range, target, dan jumlah peserta. | UIUX | EP-JAT-01 | SP-01 | 2 | TBD | TBD | JAT-BL-02 |
| BLG-JAT-002 | `[JAT][Batch][FE] Mengimplementasikan daftar dan formulir batch` | Bangun list, search, create/edit, Phase 1/opsional Phase 2, multi-range dan multi-target. | FE | EP-JAT-01 | SP-01 | 5 | TBD | TBD | JAT-BL-01,JAT-BL-02,JAT-BL-03 |
| BLG-JAT-003 | `[JAT][Batch][BE] Menangani penyimpanan dan validasi konfigurasi batch` | Simpan konfigurasi batch/fase/periode/target serta validasi nama wajib/unik dan range tanggal. | BE | EP-JAT-01 | SP-01 | 5 | TBD | TBD | JAT-BL-02,JAT-BL-03 |
| BLG-JAT-004 | `[JAT][Batch][QA] Menguji create/edit batch` | Uji field wajib, nama duplikat, Phase 2 opsional, multi-range/target, dan tanggal invalid. | QA | EP-JAT-01 | SP-01 | 2 | TBD | TBD | JAT-BL-02,JAT-BL-03 |
| BLG-JAT-005 | `[JAT][Participant][UIUX] Merancang daftar dan detail peserta` | Rancang daftar peserta, pencarian, add/remove, detail identitas, target dan progres. | UIUX | EP-JAT-02 | SP-01 | 2 | TBD | TBD | JAT-BL-04 |
| BLG-JAT-006 | `[JAT][Participant][FE] Mengimplementasikan pengelolaan peserta` | Bangun list peserta, search, tambah, detail, dan hapus dengan confirmation dialog. | FE | EP-JAT-02 | SP-01 | 3 | TBD | TBD | JAT-BL-04 |
| BLG-JAT-007 | `[JAT][Participant][BE] Menangani data dan relasi peserta` | Sediakan operasi peserta-batch dan konsistensi data turunan. | BE | EP-JAT-02 | SP-01 | 3 | TBD | TBD | JAT-BL-04 |
| BLG-JAT-008 | `[JAT][Participant][QA] Menguji pengelolaan peserta` | Uji search, add/remove, detail dan konsistensi target/progres. | QA | EP-JAT-02 | SP-01 | 2 | TBD | TBD | JAT-BL-04 |
| BLG-JAT-009 | `[JAT][Student View][UIUX] Merancang ringkasan batch dan progres Student` | Rancang daftar, detail batch, fase, periode, target, progres dan inactive states. | UIUX | EP-JAT-03 | SP-02 | 2 | TBD | TBD | JAT-BL-05 |
| BLG-JAT-010 | `[JAT][Student View][FE] Mengimplementasikan halaman batch dan progres` | Tampilkan daftar/detail fase, target/progres, akses sesuai periode dan hindari duplicate range. | FE | EP-JAT-03 | SP-02 | 4 | TBD | TBD | JAT-BL-05 |
| BLG-JAT-011 | `[JAT][Student View][BE] Menyediakan data fase dan periode Student` | Sediakan batch, phase, range, target dan progres memakai sumber tanggal konsisten. | BE | EP-JAT-03 | SP-02 | 3 | TBD | TBD | JAT-BL-05,JAT-BL-14 |
| BLG-JAT-012 | `[JAT][Student View][QA] Menguji akses fase dan periode` | Uji sebelum/di dalam/setelah range, batas start/end date, tampilan tanggal dan progres. | QA | EP-JAT-03 | SP-02 | 2 | TBD | TBD | JAT-BL-05,JAT-BL-14 |
| BLG-JAT-013 | `[JAT][Submission][UIUX] Merancang formulir pelaporan lamaran` | Rancang field pekerjaan, tanggal, URL, upload bukti, petunjuk dan error states. | UIUX | EP-JAT-04 | SP-02 | 2 | TBD | TBD | JAT-BL-06 |
| BLG-JAT-014 | `[JAT][Submission][FE] Mengimplementasikan formulir dan upload` | Bangun input, required-field validation, upload JPG/JPEG/PNG, error messages dan submit. | FE | EP-JAT-04 | SP-02 | 4 | TBD | TBD | JAT-BL-06,JAT-BL-07 |
| BLG-JAT-015 | `[JAT][Submission][BE] Memvalidasi dan menyimpan pengajuan` | Validasi tanggal masa depan/out-of-range, supported file type dan persist submission. | BE | EP-JAT-04 | SP-02 | 5 | TBD | TBD | JAT-BL-06,JAT-BL-07 |
| BLG-JAT-016 | `[JAT][Submission][QA] Menguji pelaporan dan input validation` | Uji valid, required fields, future dates, out-of-range dates, file types dan upload. | QA | EP-JAT-04 | SP-02 | 2 | TBD | TBD | JAT-BL-06,JAT-BL-07 |
| BLG-JAT-017 | `[JAT][IDP Extraction][BE] Mengimplementasikan preprocessing dan OCR` | Integrasikan pemrosesan gambar/OCR hanya setelah provider dan kontrak integrasi disetujui. | BE | EP-JAT-05 | SP-03 | 5 | TBD | TBD | JAT-BL-08 |
| BLG-JAT-018 | `[JAT][IDP Extraction][BE] Menyusun ekstraksi informasi terstruktur` | Ubah OCR result menjadi atribut job yang didukung bukti; unknown values jangan ditebak. | BE | EP-JAT-05 | SP-03 | 4 | TBD | TBD | JAT-BL-08 |
| BLG-JAT-019 | `[JAT][IDP Extraction][QA] Menguji ekstraksi pada variasi bukti` | Uji clear, blurry, cropped, incomplete, irrelevant; simpan expected/actual results. | QA | EP-JAT-05 | SP-03 | 3 | TBD | TBD | JAT-BL-08,JAT-BL-18 |
| BLG-JAT-020 | `[JAT][IDP Validation][BE] Mengimplementasikan rule-based validation` | Bandingkan input dengan extracted fields dan explicit rules, termasuk required attributes. | BE | EP-JAT-06 | SP-03 | 5 | TBD | TBD | JAT-BL-09 |
| BLG-JAT-021 | `[JAT][IDP Validation][BE] Mengintegrasikan semantic validation` | Integrasikan approved LLM only after provider/API/security decision; outputs schema-validated. | BE | EP-JAT-06 | SP-03 | 5 | TBD | TBD | JAT-BL-09 |
| BLG-JAT-022 | `[JAT][IDP Validation][QA] Menguji mismatch dan status validation` | Uji match/mismatch, cropped evidence, level-vs-experience, company/title mismatch dan random image. | QA | EP-JAT-06 | SP-03 | 4 | TBD | TBD | JAT-BL-09,JAT-BL-18 |
| BLG-JAT-023 | `[JAT][Validation Feedback][UIUX] Merancang status dan feedback` | Rancang status chips, detail hasil, validation reason dan waiting confirmation state. | UIUX | EP-JAT-07 | SP-04 | 2 | TBD | TBD | JAT-BL-10 |
| BLG-JAT-024 | `[JAT][Validation Feedback][FE] Menampilkan status dan feedback Student` | Tampilkan validation status terpisah dari recruitment status dan reason yang tersedia. | FE | EP-JAT-07 | SP-04 | 4 | TBD | TBD | JAT-BL-10 |
| BLG-JAT-025 | `[JAT][Validation Feedback][BE] Menyimpan status dan alasan validation` | Simpan status terakhir, hasil terstruktur dan alasan yang diperlukan. | BE | EP-JAT-07 | SP-04 | 3 | TBD | TBD | JAT-BL-10 |
| BLG-JAT-026 | `[JAT][Validation Feedback][QA] Menguji konsistensi status Student` | Uji Approved, Rejected, Waiting Confirmation pada list/detail dan feedback. | QA | EP-JAT-07 | SP-04 | 2 | TBD | TBD | JAT-BL-10 |
| BLG-JAT-027 | `[JAT][HITL Request][UIUX] Merancang Request list dan detail` | Rancang queue/filter, detail submission/evidence dan confirm/reject actions. | UIUX | EP-JAT-08 | SP-04 | 3 | TBD | TBD | JAT-BL-11 |
| BLG-JAT-028 | `[JAT][HITL Request][FE] Mengimplementasikan Request dan review action` | Bangun Waiting Confirmation queue, detail evidence, batch/phase/range dan tindakan review. | FE | EP-JAT-08 | SP-04 | 5 | TBD | TBD | JAT-BL-11 |
| BLG-JAT-029 | `[JAT][HITL Request][BE] Mengelola Waiting Confirmation dan review result` | Sediakan query queue, state transition dan rejection reason validation. | BE | EP-JAT-08 | SP-04 | 5 | TBD | TBD | JAT-BL-11 |
| BLG-JAT-030 | `[JAT][HITL Request][QA] Menguji konfirmasi dan penolakan Request` | Uji queue, detail, approve/reject, missing reason, status updates dan removal from queue. | QA | EP-JAT-08 | SP-04 | 3 | TBD | TBD | JAT-BL-11,JAT-BL-18 |
| BLG-JAT-031 | `[JAT][Applied Jobs][UIUX] Merancang filter Applied Jobs` | Rancang filter phase/date range/status dan empty states. | UIUX | EP-JAT-09 | SP-05 | 2 | TBD | TBD | JAT-BL-12 |
| BLG-JAT-032 | `[JAT][Applied Jobs][FE] Mengimplementasikan filter Applied Jobs` | Bangun tabel, search dan filter states sesuai desain yang disetujui. | FE | EP-JAT-09 | SP-05 | 4 | TBD | TBD | JAT-BL-12 |
| BLG-JAT-033 | `[JAT][Applied Jobs][BE] Menyediakan query filter data lamaran` | Filter data per phase/date range/status dan handle empty result. | BE | EP-JAT-09 | SP-05 | 4 | TBD | TBD | JAT-BL-12 |
| BLG-JAT-034 | `[JAT][Applied Jobs][QA] Menguji pencarian dan kombinasi filter` | Uji single and combined filters, reset dan no-result state. | QA | EP-JAT-09 | SP-05 | 2 | TBD | TBD | JAT-BL-12 |
| BLG-JAT-035 | `[JAT][Monitoring][UIUX] Merancang ringkasan progres/monitoring` | Rancang komponen target/progres yang membedakan validasi dan recruitment progress. | UIUX | EP-JAT-10 | SP-05 | 2 | TBD | TBD | JAT-BL-15 |
| BLG-JAT-036 | `[JAT][Monitoring][FE] Menampilkan progres dan recalculate control` | Tampilkan progress summary dan kontrol recalculate hanya untuk role yang ditetapkan. | FE | EP-JAT-10 | SP-05 | 3 | TBD | TBD | JAT-BL-13,JAT-BL-15 |
| BLG-JAT-037 | `[JAT][Monitoring][BE] Menyinkronkan target dan perhitungan progres` | Recalculate setelah perubahan relevan; pertahankan date source dan cegah duplicate ranges. | BE | EP-JAT-10 | SP-05 | 6 | TBD | TBD | JAT-BL-13,JAT-BL-14 |
| BLG-JAT-038 | `[JAT][Monitoring][QA] Menguji progres dan sinkronisasi` | Uji achieved/not-achieved/not-started serta dampak perubahan range/target/participant. | QA | EP-JAT-10 | SP-05 | 4 | TBD | TBD | JAT-BL-13,JAT-BL-14 |
| BLG-JAT-039 | `[JAT][Access Control][BE] Menegakkan permission di backend` | Enforce roles pada backend/service; jangan bergantung hanya pada hidden UI controls. | BE | EP-JAT-11 | SP-05 | 3 | TBD | TBD | JAT-BL-17 |
| BLG-JAT-040 | `[JAT][Access Control][FE] Menerapkan kontrol aksi dan confirmation` | Build delete confirmation, batch-name verification if required, disable unauthorized actions. | FE | EP-JAT-11 | SP-05 | 3 | TBD | TBD | JAT-BL-16,JAT-BL-17 |
| BLG-JAT-041 | `[JAT][Access Control][QA] Menguji permission dan destructive actions` | Uji role restrictions, cancel delete, wrong/empty/correct batch-name confirmation. | QA | EP-JAT-11 | SP-05 | 3 | TBD | TBD | JAT-BL-16,JAT-BL-17 |
| BLG-JAT-042 | `[JAT][Quality Assurance][QA] Menjalankan end-to-end test` | Verifikasi flow batch → Student submission → validation → review → progress. | QA | EP-JAT-12 | SP-06 | 5 | TBD | TBD | JAT-BL-18 |
| BLG-JAT-043 | `[JAT][Quality Assurance][QA] Menjalankan regression dan integration tests` | Run regression and integration tests after changes; preserve real results and evidence. | QA | EP-JAT-12 | SP-06 | 4 | TBD | TBD | JAT-BL-18 |
| BLG-JAT-044 | `[JAT][Quality Assurance][QA] Mendokumentasikan UAT dan evaluasi` | Dokumentasikan UAT actual, ground truth and evaluation metrics if measured, plus performance test evidence. | QA | EP-JAT-12 | SP-06 | 4 | TBD | TBD | JAT-BL-18 |

## 3. Prioritas awal

- High: fungsi inti, integrity, validasi bukti, HITL dan kualitas data.
- Medium: monitoring/dashboard terpisah atau enhancement yang dapat dijadwalkan setelah fungsi inti.
- Backlog besar dapat dipecah saat Sprint Planning. Jika ada ketergantungan API/provider yang belum diputuskan, tandai TBD alih-alih membuat endpoint palsu.

## 4. Definition of Done

1. Acceptance criteria terkait sudah diuji atau alasan belum teruji terdokumentasi.
2. Tidak ada error yang diketahui dan disembunyikan dalam status pass.
3. UI menangani loading, empty, success, error dan permission states sesuai kebutuhan.
4. Mock data diberi label dan terpisah dari service layer.
5. Perubahan logic dilindungi unit/integration/e2e tests yang sesuai.
6. Dokumentasi dan screenshot/bukti diperbarui bila relevan.
7. Release hanya dicatat bila ada bukti deployment/release aktual.
