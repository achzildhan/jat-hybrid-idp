# QA Test Results — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Versi:** 1.0.0
- **Status:** Complete / Passed
- **Tanggal Eksekusi:** 2026-10-19
- **Lingkungan Eksekusi:** Node.js v22.12.0, Vitest v3.2.7, jsdom v26.0.0, Vite v6.4.4
- **Penanggung Jawab:** Senior QA Engineer
- **Cakupan Pengujian:** EP-JAT-01 s/d EP-JAT-12 (`BLG-JAT-001` s/d `BLG-JAT-044`)

---

## 1. Ringkasan Eksekusi Pengujian (*Executive Summary*)

Pengujian otomatis komprehensif telah dijalankan di seluruh repositori proyek. Seluruh 12 berkas *test suite* dan 97 kasus uji berhasil diselesaikan dengan tingkat kelulusan 100%.

| Metrik Pengujian | Nilai Aktual | Keterangan |
|---|---|---|
| **Total Test Suites** | 12 | Mencakup EP-JAT-01 s/d EP-JAT-12 |
| **Total Test Cases** | 97 | 100% lulus tanpa kegagalan |
| **Passed** | 97 | 100.0% |
| **Failed** | 0 | 0.0% |
| **Blocked** | 0 | 0.0% |
| **Not Run** | 0 | 0.0% |
| **TypeScript Typecheck (`tsc -b`)** | Passed | 0 error (Strict Mode) |
| **Vite Production Build** | Passed | Sukses membuat bundel `dist/` |
| **Waktu Eksekusi Total** | ~16.24 detik | Vitest in-memory runner |

---

## 2. Rincian Hasil per Berkas Test Suite

```
✓ src/test/ep-jat-01.test.tsx (9 tests)  — EP-JAT-01: Batch Management
✓ src/test/ep-jat-02.test.tsx (7 tests)  — EP-JAT-02: Participant Management
✓ src/test/ep-jat-03.test.tsx (7 tests)  — EP-JAT-03: Student View & Period Gating
✓ src/test/ep-jat-04.test.tsx (5 tests)  — EP-JAT-04: Application Submission & Evidence
✓ src/test/ep-jat-05.test.ts (18 tests)  — EP-JAT-05: IDP Image Preprocessing & OCR
✓ src/test/ep-jat-06.test.ts (18 tests)  — EP-JAT-06: IDP Deterministic & Semantic Validation
✓ src/test/ep-jat-07.test.tsx (5 tests)  — EP-JAT-07: Validation Feedback & Student UI
✓ src/test/ep-jat-08.test.tsx (6 tests)  — EP-JAT-08: Human-in-the-Loop Review Queue
✓ src/test/ep-jat-09.test.tsx (5 tests)  — EP-JAT-09: Applied Jobs Management & Filters
✓ src/test/ep-jat-10.test.tsx (6 tests)  — EP-JAT-10: Progress Monitoring & Sync
✓ src/test/ep-jat-11.test.tsx (5 tests)  — EP-JAT-11: Access Control & Destructive Safety
✓ src/test/ep-jat-12.test.tsx (6 tests)  — EP-JAT-12: End-to-End & Negative Regressions
-----------------------------------------------------------------------------------------
Total: 12 Test Files Passed (12) | 97 Tests Passed (97)
```

---

## 3. Rincian Kasus Uji per Epic

### 3.1 EP-JAT-01: Batch Management (`ep-jat-01.test.tsx` — 9 Tests)
- `[Passed]` Render daftar batch, filter pencarian teks, dan pemulihan dari state pencarian kosong.
- `[Passed]` Validasi field wajib formulir batch dan cegah pembuatan nama batch duplikat (`BR-01`, `BR-02`).
- `[Passed]` Pembuatan batch baru dengan Phase 1 aktif dan Phase 2 opsional (`BR-03`).
- `[Passed]` Multi-range tanggal dan multi-target per job level valid (`BR-04`, `BR-05`).
- `[Passed]` Validasi error saat tanggal akhir mendahului tanggal mulai.
- `[Passed]` Recalculate progress batch trigger dan status update.
- `[Passed]` Modal konfirmasi hapus batch dengan verifikasi pengetikan nama persis (`BR-09`).
- `[Passed]` Pembatalan modal hapus batch mempertahankan data batch.
- `[Passed]` Penghapusan batch sukses saat nama yang diketik cocok persis.

### 3.2 EP-JAT-02: Participant Management (`ep-jat-02.test.tsx` — 7 Tests)
- `[Passed]` Render daftar peserta batch dan dukungan pencarian peserta.
- `[Passed]` Pemulihan dari filter peserta kosong kembali ke daftar lengkap.
- `[Passed]` Tambah peserta sintetis baru via modal ke dalam batch.
- `[Passed]` Render halaman detail peserta dengan matriks target dan progres per fase/range.
- `[Passed]` Tampilkan tabel Applied Jobs terstandarisasi pada detail peserta.
- `[Passed]` Pembatalan hapus peserta mempertahankan peserta di batch (`BR-10`).
- `[Passed]` Konfirmasi eksplisit hapus peserta menghapus peserta namun mengarsipkan riwayat lamarannya.

### 3.3 EP-JAT-03: Student View (`ep-jat-03.test.tsx` — 7 Tests)
- `[Passed]` Menampilkan daftar batch yang diikuti oleh akun Student sintetis aktif.
- `[Passed]` Tampilan empty state yang informatif bila Student belum terdaftar di batch manapun.
- `[Passed]` Pemulihan tampilan saat berpindah ke akun Student yang memiliki batch terdaftar.
- `[Passed]` Menampilkan detail Phase 1, Phase 2, target per job level, dan progres capaian.
- `[Passed]` Pembatasan tombol "+ Tambah Bukti Lamaran" saat periode statusnya *Upcoming* (`BR-06`).
- `[Passed]` Pembatasan tombol "+ Tambah Bukti Lamaran" saat periode statusnya *Expired* (`BR-07`).
- `[Passed]` Izin submit aktif penuh saat tanggal referensi berada di dalam rentang *Active* (`BR-14`).

### 3.4 EP-JAT-04: Application Submission (`ep-jat-04.test.tsx` — 5 Tests)
- `[Passed]` Pembukaan laci formulir pelaporan lamaran dari konteks fase yang aktif.
- `[Passed]` Validasi kelengkapan 8 field form wajib (Role, Perusahaan, Lokasi, Posisi, Level, Sistem Kerja, Pengalaman, Bukti).
- `[Passed]` Validasi pencegahan unggah berkas selain JPG/JPEG/PNG (`BR-11`).
- `[Passed]` Validasi pencegahan unggah berkas kosong (0 byte) atau berkas melebihi 5MB (`BR-12`, `BR-13`).
- `[Passed]` Pencegahan pemilihan tanggal lamaran di masa depan atau di luar rentang aktif (`BR-14`, `BR-45`).

### 3.5 EP-JAT-05: IDP Extraction (`ep-jat-05.test.ts` — 18 Tests)
- `[Passed]` Validasi header magic bytes untuk PNG (`0x89 0x50 0x4E 0x47`) dan JPEG (`0xFF 0xD8 0xFF`) (`BR-34`).
- `[Passed]` Penolakan berkas dengan ekstensi gambar namun berkas aslinya PDF atau file biner palsu.
- `[Passed]` Normalisasi teks, pembersihan karakter kontrol tak terlihat (null bytes).
- `[Passed]` Deteksi otomatis frasa penutupan lowongan kerja ("lowongan ditutup", dsb) (`BR-41`).
- `[Passed]` Ekstraksi 7 atribut terstruktur (`role`, `company`, `location`, `position`, `jobLevel`, `workSystem`, `dateApplied`) (`BR-39`).
- `[Passed]` Penetapan *provenance* dan skor keyakinan (*confidence score*) pada setiap atribut.
- `[Passed]` Kebijakan atribut tidak ditemukan diset `null` / `unknown`, tidak merekayasa data (`BR-18`).
- `[Passed]` Ekstraksi pada variasi berkas bukti: Clear, Blurry, Cropped, Incomplete, Irrelevant, Empty, Corrupt.
- `[Passed]` Verifikasi isolasi *Mock OCR Engine Adapter* berstatus `BLOCKED_PENDING_DECISION` (`DEC-05`, `DEC-11`).

### 3.6 EP-JAT-06: IDP Validation (`ep-jat-06.test.ts` — 18 Tests)
- `[Passed]` Algoritma kemiripan leksikal Sørensen-Dice dengan normalisasi badan hukum (`PT`, `Tbk`, `CV`) (`BR-40`).
- `[Passed]` Aturan pencocokan ketat untuk Role dan Perusahaan (ambang batas > 70%).
- `[Passed]` Validasi deterministik format berkas dan rentang tanggal tanpa pengecualian.
- `[Passed]` Deteksi mismatch level pekerjaan vs tahun pengalaman (misal: Senior Level dengan pengalaman < 1 tahun).
- `[Passed]` Kebijakan keputusan berjenjang: skor >= 90% -> `Approved`, 60%-89% atau buram -> `Waiting Confirmation`, format/tanggal salah atau gambar tidak relevan -> `Rejected` (`BR-38`).
- `[Passed]` Pencegahan pembatalan aturan deterministik oleh LLM semantik (*Deterministic Non-Override Safeguard*, `BR-26`).
- `[Passed]` Verifikasi isolasi *Mock Semantic Comparator Adapter* berstatus `BLOCKED_PENDING_DECISION` (`DEC-06`, `DEC-12`).

### 3.7 EP-JAT-07: Validation Feedback (`ep-jat-07.test.tsx` — 5 Tests)
- `[Passed]` Penyajian konsisten 3 status validasi: `Approved`, `Waiting Confirmation`, dan `Rejected` (`BR-22`).
- `[Passed]` Pemisahan mutlak visual dan data antara Status Validasi JAT dan Progres Rekrutmen Perusahaan (`BR-28`).
- `[Passed]` Penjelasan transparan alasan penolakan dan feedback peninjau pada laci rincian lamaran (`BR-23`).
- `[Passed]` Sinkronisasi instan pembaruan status validasi ke tabel Student dan ringkasan KPI.
- `[Passed]` Konfirmasi sekunder sebelum menghapus lamaran yang belum disetujui.

### 3.8 EP-JAT-08: Human-in-the-Loop Review (`ep-jat-08.test.tsx` — 6 Tests)
- `[Passed]` Antrean Request hanya memuat lamaran berstatus `Waiting Confirmation` (`BR-32`).
- `[Passed]` Peniadaan tombol persetujuan massal (*bulk actions*) demi menjaga akuntabilitas peninjauan per berkas (`DSN-TBD-03`).
- `[Passed]` Filter antrean berdasarkan Batch, Fase, Rentang Tanggal, dan Job Level (`BR-31`).
- `[Passed]` Inspektor bukti menampilkan berkas visual asli, data input form, dan 7 atribut hasil ekstraksi IDP (`BR-39`).
- `[Passed]` Alur persetujuan manual (Approved) dengan modal konfirmasi sekunder dan riwayat peninjau tercatat (`BR-25`, `BR-29`).
- `[Passed]` Alur penolakan manual (Rejected) mewajibkan alasan penolakan dan menghapus item dari antrean (`BR-24`, `BR-32`).

### 3.9 EP-JAT-09: Applied Jobs Management (`ep-jat-09.test.tsx` — 5 Tests)
- `[Passed]` Penyajian seluruh lamaran siswa tanpa filter dengan penghitung dinamis.
- `[Passed]` Filter independen per dimensi: Fase, Date Range, dan Status Validasi JAT (`BR-31`).
- `[Passed]` Filter kombinasi (Fase + Range + Status + Pencarian Teks) bekerja presisi.
- `[Passed]` Perbedaan jelas antara *empty state* akibat filter aktif vs siswa yang belum pernah melamar.
- `[Passed]` Sinkronisasi data seketika setelah siswa submit atau Admin menyelesaikan review HITL.

### 3.10 EP-JAT-10: Progress Monitoring (`ep-jat-10.test.tsx` — 6 Tests)
- `[Passed]` Sumber kebenaran tanggal dan target terpusat (`PROGRESS_CALCULATION_POLICY`).
- `[Passed]` Pemisahan status lamaran validasi (Approved) dari progres rekrutmen perusahaan (`BR-28`).
- `[Passed]` Pratinjau dampak konsekuensi (*impact preview*) di modal sebelum menyimpan perubahan target batch (`BR-08`).
- `[Passed]` Penegakan kontrol *Recalculate Progress* hanya untuk peran Admin (`BR-30`, `BR-43`).
- `[Passed]` Pelaporan status eksekusi kalkulasi ulang: `No-Op` (data sudah mutakhir) dan `Updated` (ada perubahan).
- `[Passed]` Preservasi *snapshot* jendela tanggal saat siswa submit aplikasi meskipun Admin mengubah rentang batch di kemudian hari (`BR-42`).

### 3.11 EP-JAT-11: Access Control (`ep-jat-11.test.tsx` — 5 Tests)
- `[Passed]` Penegakan otorisasi peran pada service layer: Student dilarang menghapus batch, mengedit target, atau mereview HITL (`BR-33`, `BR-43`).
- `[Passed]` Banner peringatan akses tidak sah saat peran Student membuka antarmuka Admin.
- `[Passed]` Validasi konfirmasi pengetikan nama batch persis sebelum eksekusi hapus (`BR-09`, `DSN-TBD-05`).
- `[Passed]` Perlindungan terhadap klik ganda beruntun (*double-click guard*) pada tombol aksi destruktif.
- `[Passed]` Pembatalan aksi destruktif mengembalikan sistem ke kondisi utuh tanpa perubahan data.

### 3.12 EP-JAT-12: End-to-End & Negative Regressions (`ep-jat-12.test.tsx` — 6 Tests)
- `[Passed]` **BLG-JAT-042 (Alur Utuh 9-Langkah E2E):**
  1. Admin membuat dan mengonfigurasi batch baru (`JAT Batch 99 QA E2E`).
  2. Admin menambahkan peserta sintetis (`stu-1`).
  3. Simulasi akun Student: membuka batch, memverifikasi fase aktif dan jendela periode *Active*.
  4. Student mengajukan lamaran lengkap dengan berkas bukti gambar PNG valid.
  5. Pipeline ekstraksi IDP memproses berkas secara otomatis via mock adapter berstandar typed contracts.
  6. Pipeline validasi IDP mengevaluasi bukti dan merekomendasikan status `Waiting Confirmation`.
  7. Student melihat status `Waiting Confirmation` dan transparansi feedback sistem.
  8. Admin meninjau berkas di antrean Request HITL, menginspeksi perbandingan atribut, dan menyetujui (*Approve*) lamaran dengan verifikasi sekunder.
  9. Data Applied Jobs dan progres batch terbarui secara konsisten (capaian bertambah, antrean HITL kosong).
- `[Passed]` **BLG-JAT-043 (Pengujian Kasus Negatif & Regresi):**
  - Validasi penolakan nama batch duplikat (case-insensitive) dan nama batch kosong.
  - Validasi penolakan rentang tanggal fase yang tumpang tindih (*overlapping date ranges*) (`BR-04`).
  - Validasi penolakan tanggal lamaran di masa depan (*future date*) (`BR-14`).
  - Validasi penolakan berkas bukti dengan tipe tidak didukung (PDF, GIF) (`BR-11`).
  - Validasi penolakan berkas 0 byte (*empty file*) dan berkas dengan header biner rusak (*corrupt bytes*) (`BR-12`, `BR-34`).
  - Ketahanan *pipeline* saat adapter OCR/LLM mengalami kegagalan/timeout: dialihkan otomatis ke `Waiting Confirmation` untuk tinjauan manusia tanpa *crash* sistem (`BR-21`).
  - Perlindungan *Deterministic Non-Override*: aturan tanggal dan format berkas tidak dapat dibatalkan oleh LLM (`BR-26`).
  - Validasi penolakan review HITL tanpa alasan penolakan (*mandatory rejection reason*) (`BR-24`).
  - Pemulihan pembatalan aksi destruktif (hapus peserta, hapus batch dengan nama salah) (`BR-09`, `BR-10`).
  - Penolakan mutasi data Admin oleh peran Student pada level service (`BR-33`, `BR-43`).

---

## 4. Kesimpulan Kualitas

Berdasarkan hasil eksekusi pengujian di atas:
1. Tidak ada regresi atau cacat fungsional yang ditemukan.
2. Integritas aturan bisnis dan keamanan data berada pada kepatuhan 100%.
3. Sistem siap untuk pengujian penerimaan pengguna (*User Acceptance Testing*) dan evaluasi komparatif lanjutan.
