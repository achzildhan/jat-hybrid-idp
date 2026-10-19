# QA Test Plan — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Versi:** 1.0.0
- **Status:** Approved / Active
- **Tanggal:** 2026-10-19
- **Penanggung Jawab:** Senior QA Engineer
- **Cakupan Epic:** EP-JAT-01 s/d EP-JAT-12 (`BLG-JAT-001` s/d `BLG-JAT-044`)
- **Traceability PRD:** `JAT-BL-01` s/d `JAT-BL-18`
- **Business Rules:** `BR-01` s/d `BR-45`

---

## 1. Pendahuluan & Tujuan Pengujian

Rencana pengujian (*QA Test Plan*) ini merinci strategi, cakupan, lingkungan, metodologi, dan kriteria keberhasilan pengujian untuk sistem **Job Application Tracking (JAT) Hybrid IDP Prototype**.

Tujuan pengujian adalah memastikan:
1. **Fungsionalitas Lengkap:** Seluruh alur kerja (*End-to-End*) dari konfigurasi batch Admin, manajemen peserta, pengajuan lamaran Student, ekstraksi bukti IDP, validasi hibrida (deterministik + semantik), peninjauan *Human-in-the-Loop* (HITL), hingga pembaruan progres batch berjalan secara mulus tanpa diskrepansi data.
2. **Integritas Aturan Bisnis (*Business Rules Integrity*):** Memastikan seluruh 45 aturan bisnis (`BR-01` s/d `BR-45`) ditegakkan secara ketat dan konsisten baik pada *client-side* maupun *service layer*.
3. **Ketahanan Kasus Negatif & Batas (*Negative & Edge Case Robustness*):** Menguji ketahanan sistem terhadap input kosong, tanggal di luar rentang, tanggal masa depan, berkas tidak didukung/rusak/kosong, bukti gambar buram/terpotong/tidak relevan, serta kegagalan *provider* AI.
4. **Keamanan & Pembatasan Peran (*Role-Based Access Control*):** Menegakkan pemisahan tegas peran Student dan Admin/Talent Support, mencegah eskalasi hak akses atau tindakan destruktif tanpa konfirmasi eksplisit.
5. **Transparansi Integritas Data:** Menjaga isolasi data *mock synthetic* tanpa menggunakan data pribadi siswa nyata atau screenshot produksi Dibimbing.id.

---

## 2. Cakupan Pengujian (*Test Scope*)

### 2.1 Dalam Cakupan (*In Scope*)
- **EP-JAT-01 (Batch Management):** Pembuatan, pengeditan, penghapusan batch, multi-fase (Phase 1 & Phase 2), konfigurasi *date range*, penetapan target per *job level*, validasi nama unik (`BR-01` s/d `BR-05`, `BR-09`).
- **EP-JAT-02 (Participant Management):** Pendaftaran peserta sintetis, pencarian, penghapusan peserta dengan modal konfirmasi, integritas preservasi arsip pengajuan (`BR-04`, `BR-10`).
- **EP-JAT-03 (Student View):** Penyajian daftar batch, rincian fase, matriks target, status jendela periode (*Active*, *Upcoming*, *Expired*), dan pembatasan aksi tombol submit sesuai batas tanggal (`BR-06`, `BR-07`, `BR-14`).
- **EP-JAT-04 (Application Submission):** Formulir pengajuan lamaran Student, validasi 8 atribut pekerjaan, unggah bukti gambar (JPG, JPEG, PNG <= 5MB), pembatalan laci/form, pencegahan tanggal masa depan dan tanggal di luar rentang aktif (`BR-11`, `BR-12`, `BR-13`, `BR-14`, `BR-34`, `BR-45`).
- **EP-JAT-05 (Hybrid IDP Extraction):** *Preprocessing* gambar (ukuran, tipe MIME, *magic bytes*), normalisasi teks, deteksi lowongan tutup (*closed vacancy*), ekstraksi 7 atribut terstruktur dengan penanda *provenance*, kebijakan *nullable/unknown* tanpa halusinasi, dan *mock adapter* terisolasi pending keputusan stakeholder (`BR-15`, `BR-18`, `BR-34`, `BR-39`, `BR-41`).
- **EP-JAT-06 (Hybrid IDP Validation):** Validasi deterministik aturan ketat, pencocokan leksikal (*Sørensen–Dice* > 70%), *mock semantic comparator*, kebijakan keputusan berjenjang (*Approved*, *Waiting Confirmation*, *Rejected*), dan perlindungan mutlak non-override aturan deterministik (`BR-17`, `BR-19`, `BR-20`, `BR-21`, `BR-26`, `BR-38`, `BR-40`).
- **EP-JAT-07 (Validation Feedback):** Penyajian status validasi Student (*Approved*, *Waiting Confirmation*, *Rejected*), transparansi alasan penolakan/rekomendasi HITL, pemisahan mutlak dari status rekrutmen perusahaan (`BR-22`, `BR-23`, `BR-27`, `BR-28`, `BR-37`).
- **EP-JAT-08 (Human-in-the-Loop Review):** Antrean verifikasi *Waiting Confirmation*, filter multi-kriteria, inspeksi bukti visual dan atribut IDP, konfirmasi persetujuan dengan verifikasi sekunder, penolakan dengan alasan wajib (*mandatory rejection reason*), riwayat audit terlacak (`BR-24`, `BR-25`, `BR-29`, `BR-31`, `BR-32`).
- **EP-JAT-09 (Applied Jobs Management):** Tabel lamaran Admin, filter tunggal dan terpadu (Fase, *Date Range*, Status Validasi, Pencarian kata kunci), pemulihan *empty state*, sinkronisasi data seketika (`BR-28`, `BR-31`).
- **EP-JAT-10 (Progress Monitoring):** Sumber kebenaran tanggal/target/partisipan, kalkulasi progres otomatis dan terpusat (*zero hardcoded numbers*), *impact preview* sebelum simpan perubahan target, kontrol *Recalculate Progress* berbasis otorisasi peran (`BR-08`, `BR-28`, `BR-30`, `BR-42`).
- **EP-JAT-11 (Access Control & Safety):** Penegakan hak akses peran `Admin (Talent Support)` vs `Student`, pembatasan mutasi data pada level *service*, konfirmasi pengetikan nama persis untuk aksi destruktif hapus batch, pencegahan *double-click* (`BR-09`, `BR-33`, `BR-43`, `DSN-TBD-05`).
- **EP-JAT-12 (Quality Assurance):** Pengujian integrasi E2E lengkap, pengujian regresi kasus negatif & *edge cases*, dokumentasi UAT, dan evaluasi metrik akurasi IDP (`BLG-JAT-042`, `BLG-JAT-043`, `BLG-JAT-044`, `JAT-BL-18`).

### 2.2 Di Luar Cakupan (*Out of Scope*)
- Koneksi ke database produksi atau repositori eksisting Dibimbing.id (proyek sengaja dibuat *standalone prototype* dari nol).
- *Live third-party OCR API* (misal Google Cloud Document AI, AWS Textract) dan *Live LLM API* (Google Gemini 1.5, OpenAI GPT-4o) sebelum keputusan formal arsitektur dan anggaran disetujui (`DEC-05`, `DEC-06`, `DEC-11`, `DEC-12`). Keduanya saat ini diisolasi menggunakan *mock adapter* berstandar typed contracts.
- Pengujian beban (*Stress Testing*) multi-server konkurensi tinggi (prototype berjalan pada *client-side browser runtime*).

---

## 3. Lingkungan Pengujian & Data Uji

### 3.1 Lingkungan Pengujian (*Test Environments*)
- **Test Runner:** Vitest v3.2.7 (DOM environment via `jsdom` v26.0.0)
- **UI Framework:** React v19.0.0, React Router v7.2.0
- **TypeScript:** v5.7.2 (Strict Mode, `tsc -b`)
- **Bundler:** Vite v6.4.4
- **OS Platform:** Windows / Cross-platform POSIX compatible

### 3.2 Isolasi Data Uji (*Test Data & Fixtures*)
Semua data uji bersifat sintetis murni (*100% synthetic fixtures*):
- **Peserta Sintetis:** Mahasiswa fiktif (`stu-1`, `stu-2`, `stu-3`, `stu-unassigned`).
- **Perusahaan & Lowongan Sintetis:** Entitas buatan (`PT Tech Nusantara Indonesia`, `Fintech Digital Solusindo`, `PT Kreatif Studio`).
- **Berkas Bukti Sintetis (`syntheticExtractionFixtures.ts`):**
  - `CLEAR_READABLE`: Gambar PNG jelas dengan seluruh atribut cocok.
  - `BLURRY_UNREADABLE`: Gambar buram dengan skor kepercayaan rendah (0.42).
  - `CROPPED_EDGE`: Gambar terpotong yang menghilangkan atribut penting (*job level*).
  - `INCOMPLETE_METADATA`: Bukti hanya menampilkan konfirmasi kirim tanpa tanggal/posisi.
  - `IRRELEVANT_MEME`: Gambar tidak berkaitan (kucing/meme) dengan teks non-rekrutmen.
  - `CLOSED_VACANCY`: Bukti berisi penanda eksplisit lowongan ditutup ("lowongan ini sudah ditutup").
  - `EMPTY_FILE`: Berkas 0 byte.
  - `CORRUPT_BYTES`: Berkas dengan *magic bytes* cacat/rusak.
  - `PROVIDER_FAILURE`: Simulasi kegagalan timeout/jaringan adapter OCR/LLM.

---

## 4. Tingkatan & Strategi Pengujian

```
+-------------------------------------------------------+
|  Level 4: End-to-End Workflow & Regresi (ep-jat-12)    |  -> 6 tests
+-------------------------------------------------------+
|  Level 3: Fitur & Modul UI (ep-jat-01..04, 07..11)    |  -> 55 tests
+-------------------------------------------------------+
|  Level 2: IDP Pipeline, Extraction & Rules (05..06)   |  -> 36 tests
+-------------------------------------------------------+
|  Level 1: Type Checking & Build Verification          |  -> tsc -b & vite
+-------------------------------------------------------+
```

1. **Static Analysis & Type Verification:**
   Menjalankan `tsc -b` untuk memastikan tidak ada pelanggaran kontrak tipe data, properti liar (*unknown properties*), atau *type mismatch*.
2. **IDP Service Unit & Contract Tests (`ep-jat-05.test.ts`, `ep-jat-06.test.ts`):**
   Memvalidasi fungsionalitas murni *pipeline*: *magic byte validation*, normalisasi teks, kemiripan *Sørensen-Dice*, perbandingan deterministik, dan isolasi *mock adapter*.
3. **UI Integration Tests (`ep-jat-01` s/d `ep-jat-11`):**
   Menggunakan `@testing-library/react` dan `@testing-library/user-event` untuk menguji interaksi pengguna nyata: pengisian formulir, penekanan tombol, laci (*drawer*), dialog konfirmasi, filter tabel, dan tampilan status.
4. **End-to-End Workflow & Regression Suite (`ep-jat-12.test.tsx`):**
   - **BLG-JAT-042:** Pengujian alur utuh 9-tahap tanpa pemutusan state.
   - **BLG-JAT-043:** Pengujian komprehensif kasus negatif, *edge cases*, validasi berkas cacat, penolakan alasan kosong, dan pembatasan peran.

---

## 5. Kriteria Penerimaan & Evaluasi (*Evaluation Criteria*)

### 5.1 Kriteria Kelulusan Pengujian Fungsional
- Seluruh tes otomatis berstatus `Passed` (0 `Failed`, 0 `Blocked`).
- Kompilasi TypeScript `tsc -b` dan *production build* `vite build` selesai dengan exit code 0.
- Tidak ada *silent override* di mana LLM/AI membatalkan aturan deterministik format berkas atau rentang tanggal (`BR-26`).
- Tindakan destruktif (penghapusan batch atau peserta) tidak pernah dieksekusi saat pengguna menekan tombol *Batal* / *Cancel*.

### 5.2 Status Pengujian yang Digunakan
Setiap skenario uji diklasifikasikan ke dalam 4 status resmi:
- **`Passed`**: Skenario telah diuji secara aktual melalui test runner / verifikasi manual dan memenuhi 100% kriteria penerimaan.
- **`Failed`**: Skenario diuji namun menghasilkan *assertion failure* atau perilaku di luar spesifikasi.
- **`Blocked`**: Skenario tidak dapat diuji karena adanya dependensi prasyarat yang belum terpenuhi atau keputusan eksternal yang belum diambil.
- **`Not Run`**: Skenario yang dirancang namun belum dieksekusi pada iterasi pengujian saat ini.

### 5.3 Kebijakan Evaluasi Metrik AI/IDP
- Karena *adapter* OCR dan LLM Semantik saat ini dioperasikan melalui *Mock Adapter* terisolasi berstatus `BLOCKED_PENDING_DECISION` (`DEC-05`, `DEC-06`), metrik akurasi, presisi, *recall*, dan F1-Score **tidak direkayasa atau difabrikasi**.
- Metrik produksi dicatat resmi sebagai **`Not Measured (Pending Live Provider Benchmarking)`**, dilengkapi dengan rumusan evaluasi matematis standar untuk diimplementasikan saat dataset *ground truth* berlabel produksi tersedia.
