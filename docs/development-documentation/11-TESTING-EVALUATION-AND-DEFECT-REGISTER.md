# 11. Testing, Evaluation, and Defect Register — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Kode Dokumen:** DOC-K (11-TESTING-EVALUATION-AND-DEFECT-REGISTER)
- **Versi:** 1.0.0
- **Status:** Complete / Verified by Test
- **Tanggal Rilis:** 2026-10-19
- **Klasifikasi Bukti:** `[Verified by Test]` & `[Documented Design/Req]`
- **Penanggung Jawab:** Senior QA Engineer & System Architect
- **Target Pembaca:** QA Lead, Developer, Project Manager, Asesor Akademik KKL

---

## 1. Strategi & Pendekatan Pengujian (*Test Strategy*)

Pengujian purwarupa *Job Application Tracking (JAT) Hybrid IDP* dirancang untuk membuktikan integritas fungsional, kepatuhan aturan bisnis (*business rules*), ketahanan sistem terhadap input anomali (*negative testing*), serta keamanan alur data dari ujung ke ujung (*end-to-end*). 

Pendekatan pengujian mengadopsi piramida pengujian perangkat lunak modern dengan penekanan pada otomasi berbasis Vitest dan validasi perilaku antarmuka pengguna berbasis React Testing Library.

```
       / \
      /   \      End-to-End Workflow & Regression (6 tests)
     / E2E \     --> Simulasi alur utuh 9-tahap Student & Admin
    /-------\
   / Integ-  \   Integration & Component Interaction (55 tests)
  /  ration   \  --> UI Drawer, Modal, State Sync, Filter, HITL
 /-------------\
/   Unit & Rule \ Deterministic Rules, Preprocessing & Algorithms (36 tests)
/   Verification \--> Magic bytes, Dice Similarity, Date & Role Guards
-----------------
```

### 1.1 Lingkup Pengujian (*Scope of Testing*)
1. **Unit Testing:** Menguji fungsi-fungsi independen, normalisasi teks, pembersihan *null bytes*, kalkulator kemiripan leksikal, algoritma Sørensen–Dice, dan *guard* otorisasi peran.
2. **Integration Testing:** Menguji interaksi antar-modul, seperti orkestrasi pipeline IDP (`imagePreprocessor` -> `ocrEngine` -> `structuredAttributeExtractor` -> `idpValidationService`), interaksi UI dengan *repository*, serta sinkronisasi progres batch.
3. **Negative & Boundary Testing:** Menguji penolakan berkas rusak (*corrupted headers*), berkas non-gambar (PDF/EXE terselubung), tanggal di masa depan, nama batch duplikat, dan penolakan bypass peran oleh siswa.
4. **End-to-End Workflow Testing:** Menguji alur hidup lengkap pelaporan lamaran dari inisialisasi batch oleh Admin, penambahan siswa, submit berkas bukti, ekstraksi IDP, antrean HITL, peninjauan Admin, hingga pembaruan progres batch.
5. **Accessibility & Error Prevention Testing:** Menguji mekanisme proteksi aksi destruktif (*exact-name confirmation modal*), pencegahan klik ganda, dan preservasi data form saat interaksi dibatalkan.

---

## 2. Lingkungan Eksekusi Pengujian (*Execution Environment*)

Seluruh rangkaian pengujian dieksekusi secara lokal menggunakan *headless in-memory test runner* yang terisolasi dari lingkungan produksi.

| Parameter Lingkungan | Nilai / Spesifikasi | Catatan Operasional |
|---|---|---|
| **Runtime Environment** | Node.js v22.12.0 | Engine JavaScript asynchronous modern |
| **Test Runner** | Vitest v3.2.7 | Runner berbasis ESM ultra-cepat |
| **DOM Simulator** | jsdom v26.0.0 | Emulasi standar W3C DOM di lingkungan Node |
| **Testing Utilities** | `@testing-library/react` v16.3.2 | Pengujian komponen berbasis perilaku pengguna |
| **DOM Assertions** | `@testing-library/jest-dom` v6.9.1 | Matcher semantik DOM (`toBeInTheDocument`, dll) |
| **Bundler & Transpiler** | Vite v6.4.4 + TypeScript v5.9.3 | Transpilasi kode sumber strict-mode |
| **Hardware Reference** | AMD/Intel x64, 16GB RAM, Windows 11 | Lingkungan pengembangan lokal pengembang |

Perintah eksekusi pengujian:
```bash
# Menjalankan seluruh pengujian unit, integrasi, dan E2E
npm run test:run

# Menjalankan pemeriksaan tipe statis TypeScript tanpa emisi berkas
npm run typecheck

# Menjalankan build produksi untuk memvalidasi kompatibilitas bundel
npm run build
```

---

## 3. Rangkuman Eksekusi Kasus Uji Otomatis (*Automated Test Summary*)

Hasil eksekusi otomatis membuktikan bahwa **100% pengujian berhasil dilewati tanpa kegagalan (0 failures)**.

```
 RUN  v3.2.7 c:/Users/ACER/Downloads/PKL Journey/jat-hybrid-idp

 ✓ src/test/ep-jat-01.test.tsx (9 tests)  — EP-JAT-01: Batch Management (3.82s)
 ✓ src/test/ep-jat-02.test.tsx (7 tests)  — EP-JAT-02: Participant Management (1.12s)
 ✓ src/test/ep-jat-03.test.tsx (7 tests)  — EP-JAT-03: Student View & Period Gating (1.05s)
 ✓ src/test/ep-jat-04.test.tsx (5 tests)  — EP-JAT-04: Application Submission & Evidence (1.21s)
 ✓ src/test/ep-jat-05.test.ts (18 tests)  — EP-JAT-05: IDP Image Preprocessing & OCR (0.42s)
 ✓ src/test/ep-jat-06.test.ts (18 tests)  — EP-JAT-06: IDP Deterministic & Semantic Validation (0.38s)
 ✓ src/test/ep-jat-07.test.tsx (5 tests)  — EP-JAT-07: Validation Feedback & Student UI (1.18s)
 ✓ src/test/ep-jat-08.test.tsx (6 tests)  — EP-JAT-08: Human-in-the-Loop Review Queue (1.45s)
 ✓ src/test/ep-jat-09.test.tsx (5 tests)  — EP-JAT-09: Applied Jobs Management & Filters (1.32s)
 ✓ src/test/ep-jat-10.test.tsx (6 tests)  — EP-JAT-10: Progress Monitoring & Sync (1.28s)
 ✓ src/test/ep-jat-11.test.tsx (5 tests)  — EP-JAT-11: Access Control & Destructive Safety (1.41s)
 ✓ src/test/ep-jat-12.test.tsx (6 tests)  — EP-JAT-12: End-to-End & Negative Regressions (1.60s)

 Test Files  12 passed (12)
      Tests  97 passed (97)
   Start at  20:14:10
   Duration  16.24s (transform 824ms, setup 1.12s, collect 3.42s, tests 15.26s)
```

---

## 4. Rincian Kasus Uji per Test Suite (97 Kasus Uji Terverifikasi)

Berikut adalah katalog lengkap 97 kasus uji yang mencakup 12 Epic implementasi:

### 4.1 Suite 01: Batch Management (`ep-jat-01.test.tsx` — 9 Tests)
*Fokus: Validasi form batch, multi-fase, multi-range tanggal, multi-target, dan proteksi destruktif.*
1. `TS-01-01 [Passed]`: Render daftar batch awal dengan kolom nama, status, peserta, dan progres capaian.
2. `TS-01-02 [Passed]`: Fungsi pencarian teks menyaring daftar batch dan pulih saat pencarian dikosongkan.
3. `TS-01-03 [Passed]`: Validasi field wajib nama batch dan penolakan nama batch duplikat (*case-insensitive*) (`BR-01`, `BR-02`).
4. `TS-01-04 [Passed]`: Pembuatan batch baru mewajibkan Phase 1 aktif dan Phase 2 opsional (`BR-03`).
5. `TS-01-05 [Passed]`: Multi-range tanggal dan multi-target per level pekerjaan tervalidasi non-negatif (`BR-04`, `BR-05`).
6. `TS-01-06 [Passed]`: Validasi error saat tanggal akhir mendahului tanggal mulai fase.
7. `TS-01-07 [Passed]`: Pemicuan kalkulasi ulang progres batch (*recalculate progress*) memperbarui status.
8. `TS-01-08 [Passed]`: Modal konfirmasi hapus batch mewajibkan pengetikan nama persis (`BR-09`).
9. `TS-01-09 [Passed]`: Pembatalan modal hapus mempertahankan data batch; konfirmasi cocok menghapus batch.

### 4.2 Suite 02: Participant Management (`ep-jat-02.test.tsx` — 7 Tests)
*Fokus: Manajemen peserta batch, inisialisasi target individual, dan preservasi riwayat lamaran.*
10. `TS-02-01 [Passed]`: Menampilkan daftar peserta batch dengan rincian email, status, dan ringkasan progres.
11. `TS-02-02 [Passed]`: Pencarian nama peserta menyaring baris tabel dan pulih saat kata kunci dihapus.
12. `TS-02-03 [Passed]`: Penambahan peserta sintetis baru via modal menginisialisasi target default Phase 1.
13. `TS-02-04 [Passed]`: Halaman detail peserta menyajikan matriks target dan progres per fase dan rentang tanggal.
14. `TS-02-05 [Passed]`: Menampilkan tabel Applied Jobs terstandarisasi pada rincian peserta.
15. `TS-02-06 [Passed]`: Pembatalan modal hapus peserta mempertahankan peserta di batch (`BR-10`).
16. `TS-02-07 [Passed]`: Konfirmasi hapus peserta menghapus peserta dari batch aktif namun mengarsipkan lamarannya.

### 4.3 Suite 03: Student View & Period Gating (`ep-jat-03.test.tsx` — 7 Tests)
*Fokus: Antarmuka Student, deteksi jendela tanggal aktif, dan pembatasan tombol submit.*
17. `TS-03-01 [Passed]`: Menampilkan daftar batch yang diikuti oleh akun Student sintetis aktif.
18. `TS-03-02 [Passed]`: Tampilan status kosong (*empty state*) yang informatif saat Student belum terdaftar di batch.
19. `TS-03-03 [Passed]`: Pemulihan antarmuka saat berpindah ke akun Student yang memiliki batch terdaftar.
20. `TS-03-04 [Passed]`: Menampilkan detail Phase 1, Phase 2, target per level pekerjaan, dan ringkasan progres.
21. `TS-03-05 [Passed]`: Penonaktifan tombol "+ Tambah Bukti Lamaran" saat status periode adalah *Upcoming* (`BR-06`).
22. `TS-03-06 [Passed]`: Penonaktifan tombol "+ Tambah Bukti Lamaran" saat status periode adalah *Expired* (`BR-07`).
23. `TS-03-07 [Passed]`: Izin submit aktif penuh saat tanggal referensi berada di dalam rentang jendela *Active* (`BR-14`).

### 4.4 Suite 04: Application Submission & Evidence (`ep-jat-04.test.tsx` — 5 Tests)
*Fokus: Laci formulir pelaporan, kelengkapan 8 atribut, dan validasi fisik berkas.*
24. `TS-04-01 [Passed]`: Pembukaan laci (*drawer*) pelaporan bukti lamaran dari konteks fase yang aktif.
25. `TS-04-02 [Passed]`: Validasi kelengkapan 8 field wajib form lamaran sebelum pengiriman diizinkan (`BR-13`).
26. `TS-04-03 [Passed]`: Penolakan berkas selain format gambar JPG, JPEG, dan PNG (`BR-11`).
27. `TS-04-04 [Passed]`: Penolakan berkas kosong (0 byte) atau berkas yang melebihi batas ukuran 5MB (`BR-12`).
28. `TS-04-05 [Passed]`: Pencegahan pemilihan tanggal lamaran di masa depan atau di luar rentang aktif (`BR-14`, `BR-45`).

### 4.5 Suite 05: IDP Image Preprocessing & OCR (`ep-jat-05.test.ts` — 18 Tests)
*Fokus: Verifikasi magic bytes, sanitasi null bytes, regex penutupan lowongan, dan ekstraksi atribut.*
29. `TS-05-01 [Passed]`: Deteksi valid header *magic bytes* berkas PNG (`0x89 0x50 0x4E 0x47`) (`BR-34`).
30. `TS-05-02 [Passed]`: Deteksi valid header *magic bytes* berkas JPEG (`0xFF 0xD8 0xFF`) (`BR-34`).
31. `TS-05-03 [Passed]`: Penolakan berkas dengan ekstensi gambar palsu (konten PDF atau berkas acak).
32. `TS-05-04 [Passed]`: Pembersihan karakter kontrol tak terlihat (*null bytes* `\u0000`) dari input teks (`BR-15`).
33. `TS-05-05 [Passed]`: Normalisasi spasi putih berlebih dan pemangkasan teks (*trimming*).
34. `TS-05-06 [Passed]`: Deteksi otomatis indikasi penutupan lowongan kerja ("lowongan ditutup") (`BR-41`).
35. `TS-05-07 [Passed]`: Deteksi indikasi penutupan lowongan bahasa Inggris ("job posting has closed").
36. `TS-05-08 [Passed]`: Ekstraksi 7 atribut lowongan standar (`role`, `company`, `location`, `position`, `jobLevel`, `workSystem`, `dateApplied`) (`BR-39`).
37. `TS-05-09 [Passed]`: Penetapan skor keyakinan (*confidence score*) numerik 0.0 s/d 1.0 pada setiap atribut.
38. `TS-05-10 [Passed]`: Penetapan *provenance* pelacakan sumber pada setiap atribut hasil ekstraksi.
39. `TS-05-11 [Passed]`: Kebijakan atribut tidak ditemukan diset `null` / `unknown`, tidak merekayasa data (`BR-18`).
40. `TS-05-12 [Passed]`: Ekstraksi pada berkas bukti berkualitas jernih (*clear evidence*) menghasilkan keyakinan tinggi.
41. `TS-05-13 [Passed]`: Ekstraksi pada bukti buram (*blurry evidence*) menandai kualitas rendah.
42. `TS-05-14 [Passed]`: Ekstraksi pada bukti terpotong (*cropped evidence*) menandai kelengkapan parsial.
43. `TS-05-15 [Passed]`: Ekstraksi pada bukti tidak relevan (*irrelevant evidence*) menghasilkan keyakinan rendah.
44. `TS-05-16 [Passed]`: Penanganan kegagalan graceful saat berkas bukti biner rusak (*corrupt file*).
45. `TS-05-17 [Passed]`: Isolasi *Mock OCR Engine Adapter* mempertahankan kontrak bertipe tanpa ketergantungan API luar.
46. `TS-05-18 [Passed]`: Status operasional OCR engine tercatat eksplisit `BLOCKED_PENDING_DECISION` (`DEC-05`, `DEC-11`).

### 4.6 Suite 06: IDP Deterministic & Semantic Validation (`ep-jat-06.test.ts` — 18 Tests)
*Fokus: Algoritma Sørensen–Dice, evaluasi deterministik, kebijakan 90/60/0, dan Non-Override Safeguard.*
47. `TS-06-01 [Passed]`: Algoritma Sørensen–Dice menghitung kecocokan teks berbasis bi-gram token.
48. `TS-06-02 [Passed]`: Normalisasi entitas badan hukum (`PT`, `Tbk`, `CV`, `Inc`) dalam pembandingan perusahaan (`BR-40`).
49. `TS-06-03 [Passed]`: Ambang batas kemiripan leksikal ketat > 70% untuk Role dan Perusahaan (`BR-17`).
50. `TS-06-04 [Passed]`: Validasi deterministik format berkas gambar menegakkan penolakan tanpa pengecualian (`BR-19`).
51. `TS-06-05 [Passed]`: Validasi deterministik rentang tanggal lamaran menolak tanggal di luar jendela aktif (`BR-45`).
52. `TS-06-06 [Passed]`: Deteksi ketidaksesuaian level pekerjaan vs tahun pengalaman (Senior < 1 tahun) (`BR-19`).
53. `TS-06-07 [Passed]`: Rekomendasi otomatis `Approved` untuk kepatuhan >= 90% dengan bukti jernih (`BR-38`).
54. `TS-06-08 [Passed]`: Rekomendasi `Waiting Confirmation` untuk skor 60%-89% (`BR-38`).
55. `TS-06-09 [Passed]`: Rekomendasi `Waiting Confirmation` untuk bukti buram atau terpotong (`BR-20`).
56. `TS-06-10 [Passed]`: Rekomendasi otomatis `Rejected` untuk kegagalan aturan deterministik format/tanggal.
57. `TS-06-11 [Passed]`: Rekomendasi otomatis `Rejected` untuk berkas tidak relevan atau skor < 60%.
58. `TS-06-12 [Passed]`: Penanganan kegagalan adapter semantik dialihkan otomatis ke `Waiting Confirmation` (`BR-21`).
59. `TS-06-13 [Passed]`: **Deterministic Non-Override Safeguard:** LLM dilarang membatalkan penolakan format/tanggal (`BR-26`).
60. `TS-06-14 [Passed]`: Status validasi yang dihasilkan selalu salah satu dari 3 status resmi (`BR-22`).
61. `TS-06-15 [Passed]`: Penghitungan alasan penolakan deterministik dirinci secara terstruktur.
62. `TS-06-16 [Passed]`: Evaluasi komparatif antara data form vs atribut hasil ekstraksi IDP.
63. `TS-06-17 [Passed]`: Isolasi *Mock Semantic Comparator Adapter* mematuhi kontrak antarmuka `SemanticComparator`.
64. `TS-06-18 [Passed]`: Status operasional komparator semantik tercatat `BLOCKED_PENDING_DECISION` (`DEC-06`, `DEC-12`).

### 4.7 Suite 07: Validation Feedback & Student UI (`ep-jat-07.test.tsx` — 5 Tests)
*Fokus: Tampilan status validasi, feedback alasan, dan pemisahan dari progres rekrutmen.*
65. `TS-07-01 [Passed]`: Penyajian konsisten 3 status validasi: `Approved`, `Waiting Confirmation`, `Rejected` (`BR-22`).
66. `TS-07-02 [Passed]`: Pemisahan mutlak visual dan data antara Status Validasi JAT dan Progres Rekrutmen (`BR-28`).
67. `TS-07-03 [Passed]`: Penjelasan transparan alasan penolakan dan feedback peninjau pada laci rincian lamaran (`BR-23`).
68. `TS-07-04 [Passed]`: Sinkronisasi instan status validasi ke tabel Student dan ringkasan KPI.
69. `TS-07-05 [Passed]`: Konfirmasi sekunder sebelum pembatalan/penghapusan lamaran oleh siswa.

### 4.8 Suite 08: Human-in-the-Loop Review Queue (`ep-jat-08.test.tsx` — 6 Tests)
*Fokus: Antrean Request, inspektor bukti berdampingan, dan peninjauan manual Admin.*
70. `TS-08-01 [Passed]`: Antrean Request hanya memuat lamaran berstatus `Waiting Confirmation` (`BR-32`).
71. `TS-08-02 [Passed]`: Peniadaan tombol persetujuan massal (*bulk actions*) demi akuntabilitas peninjauan (`DSN-TBD-03`).
72. `TS-08-03 [Passed]`: Filter antrean berdasarkan Batch, Fase, Rentang Tanggal, dan Job Level (`BR-31`).
73. `TS-08-04 [Passed]`: Inspektor bukti menampilkan berkas visual asli, data input form, dan 7 atribut IDP (`BR-39`).
74. `TS-08-05 [Passed]`: Alur persetujuan manual (Approved) dengan modal konfirmasi dan pencatatan audit peninjau (`BR-25`, `BR-29`).
75. `TS-08-06 [Passed]`: Alur penolakan manual (Rejected) mewajibkan alasan penolakan dan menghapus item dari antrean (`BR-24`, `BR-32`).

### 4.9 Suite 09: Applied Jobs Management & Filters (`ep-jat-09.test.tsx` — 5 Tests)
*Fokus: Tabel Applied Jobs admin, filter multi-dimensi, dan sinkronisasi real-time.*
76. `TS-09-01 [Passed]`: Penyajian seluruh lamaran siswa tanpa filter dengan ringkasan jumlah dinamis.
77. `TS-09-02 [Passed]`: Filter independen per dimensi: Fase, Date Range, dan Status Validasi JAT (`BR-31`).
78. `TS-09-03 [Passed]`: Filter kombinasi multi-dimensi (Fase + Range + Status + Keyword) bekerja presisi.
79. `TS-09-04 [Passed]`: Perbedaan jelas antara *empty state* akibat filter aktif vs siswa yang belum pernah melamar.
80. `TS-09-05 [Passed]`: Sinkronisasi data seketika setelah siswa submit atau Admin menyelesaikan review HITL.

### 4.10 Suite 10: Progress Monitoring & Sync (`ep-jat-10.test.tsx` — 6 Tests)
*Fokus: Single source of truth perhitungan progres, kalkulasi ulang, dan preservasi snapshot.*
81. `TS-10-01 [Passed]`: Sumber kebenaran tanggal dan target terpusat (`PROGRESS_CALCULATION_POLICY`).
82. `TS-10-02 [Passed]`: Pemisahan status validasi (Approved) dari progres rekrutmen perusahaan (`BR-28`).
83. `TS-10-03 [Passed]`: Pratinjau dampak konsekuensi (*impact preview*) di modal sebelum menyimpan perubahan target batch (`BR-08`).
84. `TS-10-04 [Passed]`: Penegakan kontrol *Recalculate Progress* hanya untuk peran Admin (`BR-30`, `BR-43`).
85. `TS-10-05 [Passed]`: Pelaporan status eksekusi kalkulasi ulang: `No-Op` (data sudah mutakhir) dan `Updated` (ada perubahan).
86. `TS-10-06 [Passed]`: Preservasi *snapshot* jendela tanggal saat siswa submit aplikasi meskipun rentang batch diubah (`BR-42`).

### 4.11 Suite 11: Access Control & Destructive Safety (`ep-jat-11.test.tsx` — 5 Tests)
*Fokus: Otorisasi peran pada service layer, pencegahan klik ganda, dan proteksi destruktif.*
87. `TS-11-01 [Passed]`: Penegakan otorisasi peran pada service layer: Student dilarang mutasi batch atau mereview HITL (`BR-33`, `BR-43`).
88. `TS-11-02 [Passed]`: Banner peringatan akses tidak sah saat peran Student membuka antarmuka Admin.
89. `TS-11-03 [Passed]`: Validasi konfirmasi pengetikan nama batch persis sebelum eksekusi hapus (`BR-09`, `DSN-TBD-05`).
90. `TS-11-04 [Passed]`: Perlindungan terhadap klik ganda beruntun (*double-click guard*) pada tombol aksi destruktif.
91. `TS-11-05 [Passed]`: Pembatalan aksi destruktif mengembalikan sistem ke kondisi utuh tanpa perubahan data.

### 4.12 Suite 12: End-to-End & Negative Regressions (`ep-jat-12.test.tsx` — 6 Tests)
*Fokus: Alur hidup 9-tahap end-to-end dan baterai pengujian kasus negatif komprehensif.*
92. `TS-12-01 [Passed]`: **Alur E2E Langkah 1-3:** Admin membuat batch baru, mendaftarkan siswa sintetis, dan siswa membuka rincian batch dengan verifikasi fase aktif.
93. `TS-12-02 [Passed]`: **Alur E2E Langkah 4-6:** Siswa mengajukan lamaran berbukti PNG valid, ekstraksi IDP memproses berkas, dan validasi IDP merekomendasikan `Waiting Confirmation`.
94. `TS-12-03 [Passed]`: **Alur E2E Langkah 7-9:** Siswa melihat status feedback transparan, Admin meninjau berkas di antrean Request HITL, menyetujui lamaran, dan progres batch bertambah sinkron.
95. `TS-12-04 [Passed]`: **Baterai Negatif 1:** Penolakan nama batch duplikat, rentang tanggal fase tumpang tindih, dan tanggal lamaran di masa depan (`BR-02`, `BR-04`, `BR-14`).
96. `TS-12-05 [Passed]`: **Baterai Negatif 2:** Penolakan berkas format tidak didukung (PDF), berkas 0 byte, dan berkas dengan header biner rusak (`BR-11`, `BR-12`, `BR-34`).
97. `TS-12-06 [Passed]`: **Baterai Negatif 3:** Penanganan kegagalan adapter AI dialihkan otomatis ke `Waiting Confirmation`, penegakan Non-Override Safeguard, penolakan review tanpa alasan, dan penolakan eskalasi hak akses Student (`BR-21`, `BR-24`, `BR-26`, `BR-33`).

---

## 5. Evaluasi Pengujian Penerimaan Pengguna (*User Acceptance Testing / UAT*)

Pengujian UAT dilakukan dengan mensimulasikan alur kerja pengguna nyata pada antarmuka prototipe interaktif untuk mengevaluasi apakah sistem memenuhi ekspektasi operasional Talent Support dan Siswa.

### 5.1 Matriks Evaluasi 12 Skenario UAT

| No. UAT | Skenario Alur Pengguna | Peran Aktor | Hasil yang Diharapkan | Hasil Aktual yang Diamati | Status UAT |
|---|---|---|---|---|---|
| **UAT-01** | Pembuatan Batch Baru & Konfigurasi Target Multi-Fase | Admin (Talent Support) | Batch tersimpan dengan Phase 1 aktif, rentang tanggal valid, dan target akumulatif per level pekerjaan. | Form memvalidasi keunikan nama, menyimpan target, dan menghitung total kuota dengan tepat. | **PASSED** |
| **UAT-02** | Registrasi Peserta Sintetis ke dalam Batch | Admin (Talent Support) | Mahasiswa muncul di daftar peserta dengan inisialisasi target default Phase 1. | Peserta terdaftar, avatar dan email tampil, target individual siap dipantau. | **PASSED** |
| **UAT-03** | Peninjauan Dasbor Batch Siswa & *Period Gating* | Student | Mahasiswa melihat status fase, sisa hari, dan tombol submit aktif hanya pada periode *Active*. | Tombol disabled pada fase Upcoming/Expired; tombol aktif pada rentang Active. | **PASSED** |
| **UAT-04** | Pengajuan Bukti Lamaran Kerja Baru | Student | Laci terbuka, form 8 atribut tervalidasi lengkap, berkas PNG diverifikasi ukuran dan tipenya. | Validasi form berjalan real-time, preview berkas tampil, lamaran berhasil dikirim. | **PASSED** |
| **UAT-05** | Ekstraksi IDP Otomatis Bukti Lamaran | Sistem (Backend Engine) | 7 atribut lowongan terekstraksi dengan skor keyakinan dan provenance sumber. | Pipeline IDP memproses bukti via adapter bertipe; atribut terekstraksi tanpa rekayasa data. | **PASSED** |
| **UAT-06** | Validasi Otomatis Kesesuaian Bukti vs Form | Sistem (Backend Engine) | Skor kecocokan leksikal dihitung (>70%) dan aturan deterministik dievaluasi. | Rekomendasi status dihasilkan akurat; aturan format/tanggal tidak dapat dibatalkan LLM. | **PASSED** |
| **UAT-07** | Transparansi Feedback Status Validasi Siswa | Student | Siswa melihat status `Waiting Confirmation` dengan rincian feedback alasan sistem. | Status validasi disajikan terpisah dari progres rekrutmen; feedback informatif. | **PASSED** |
| **UAT-08** | Peninjauan Antrean Request & Inspektor HITL | Admin (Talent Support) | Antrean hanya menampilkan Waiting Conf; modal berdampingan menampilkan form vs bukti. | Inspektor memuat gambar bukti, perbandingan atribut form vs IDP, dan tombol tindakan. | **PASSED** |
| **UAT-09** | Persetujuan Manual Lamaran & Sinkronisasi Data | Admin (Talent Support) | Persetujuan sekunder memindahkan lamaran ke `Approved` dan menambah capaian progres siswa. | Lamaran keluar dari antrean Request, muncul di Applied Jobs, progres batch bertambah. | **PASSED** |
| **UAT-10** | Penolakan Manual Lamaran dengan Alasan Wajib | Admin (Talent Support) | Sistem menolak aksi penolakan tanpa alasan; penolakan sukses mencatat riwayat audit. | Textarea alasan wajib diisi; feedback penolakan langsung terlihat di sisi siswa. | **PASSED** |
| **UAT-11** | Proteksi Aksi Destruktif Hapus Batch | Admin (Talent Support) | Tombol konfirmasi disable hingga nama batch diketik cocok persis; cancel membatalkan aksi. | Modal mencegah klik ganda; batch tidak terhapus jika nama keliru atau ditekan Batal. | **PASSED** |
| **UAT-12** | Penegakan Batasan Akses Peran (*Access Control*) | Student | Siswa diblokir dari antarmuka dan API admin (hapus batch, review HITL, recalculate). | RoleGuard menampilkan banner akses terbatas; service melempar otorisasi error. | **PASSED** |

**Tingkat Kelulusan UAT:** 12 / 12 Skenario (100% Passed).

---

## 6. Register Cacat & Matriks Risiko (*Defect Register & Risk Matrix*)

Berdasarkan audit teknis pasca-implementasi, diidentifikasi 10 temuan teknis (*risks and technical debts*) yang diklasifikasikan berdasarkan tingkat keparahan (*severity*):

| ID Risiko | Deskripsi Risiko / Utang Teknis | Severity | Status | Mitigasi / Penanganan Terpasang | Solusi Jangka Panjang (Produksi) |
|---|---|---|---|---|---|
| **R-01** | Ketiadaan live cloud OCR engine (`DEC-05`, `DEC-11`). | **High** | Blocked Pending Decision | Digunakan `MockOcrEngineAdapter` dengan typed contract dan status eksplisit. | Evaluasi benchmark Google Cloud Document AI vs Tesseract OCR. |
| **R-02** | Ketiadaan live cloud Semantic LLM comparator (`DEC-06`, `DEC-12`). | **High** | Blocked Pending Decision | Digunakan `MockSemanticComparatorAdapter` dan penegakan aturan deterministik leksikal. | Implementasi Google Gemini 1.5 Flash/Pro adapter dengan schema JSON terstruktur. |
| **R-03** | Persistensi data masih berbasis browser in-memory & `localStorage` (`DEC-02`, `DEC-03`). | **Medium** | Accepted for Prototype | Repositori diabstraksi penuh di `batchRepository.ts` sehingga mudah dialihkan ke HTTP API. | Pembangunan backend REST/GraphQL terintegrasi database PostgreSQL. |
| **R-04** | Otorisasi peran disimulasikan di sisi klien (*client-side RBAC*) (`DEC-10`). | **Medium** | Accepted for Prototype | Pengecekan izin ganda dipasang pada komponen UI (`RoleGuard`) dan lapisan *service*. | Implementasi otentikasi OAuth2/JWT dan otorisasi *server-side RBAC*. |
| **R-05** | Peringatan ukuran bundel JavaScript (*bundle chunk warning* > 500 kB). | **Medium** | Open (Optimization) | Vite build berhasil tanpa error; pengelompokan vendor chunk dasar telah berjalan. | Terapkan *code-splitting* dinamis via `React.lazy()` dan `Suspense` per rute halaman. |
| **R-06** | Ketiadaan fitur aksi massal (*bulk action*) pada antrean peninjauan (`DSN-TBD-03`). | **Low** | Closed (By Design) | Peniadaan disengaja demi menjamin akuntabilitas peninjauan manual per berkas bukti. | Sediakan fitur *batch selection* hanya untuk penolakan alasan seragam jika diminta. |
| **R-07** | Risiko kehilangan draf form saat laci ditutup secara tidak sengaja. | **Low** | Accepted for Prototype | Konfirmasi pembatalan melindungi aksi destruktif; form sederhana 8 field. | Implementasikan penyimpanan draf form otomatis di *sessionStorage*. |
| **R-08** | Tidak adanya sinkronisasi event multi-tab (*cross-tab state sync*). | **Low** | Accepted for Prototype | State diperbarui secara reaktif pada tab aktif via callback repositori. | Manfaatkan `BroadcastChannel` API atau WebSockets untuk sinkronisasi antar-tab. |
| **R-09** | Metrik akurasi kuantitatif AI (Precision/Recall) belum dapat diukur pada data live. | **Low** | Blocked | Pengukuran ditolak difabrikasi; diusulkan protokol benchmark baku. | Pengujian empiris menggunakan dataset anotasi riwayat pelaporan siswa Dibimbing.id. |
| **R-10** | Tampilan kalender rentang tanggal memerlukan *scroll* horizontal pada layar sempit. | **Low** | Open (UI Polish) | Antarmuka Admin dioptimalkan untuk desktop/laptop (resolusi >= 1024px). | Optimasi layout kalender responsif vertikal untuk perangkat *mobile viewport*. |

---

## 7. Usulan Protokol Evaluasi Empiris IDP Masa Depan (*Benchmark Proposal*)

Untuk mempersiapkan migrasi purwarupa menuju lingkungan produksi Dibimbing.id pasca penetapan keputusan `DEC-05` dan `DEC-06`, diusulkan protokol evaluasi performa model IDP sebagai berikut:

### 7.1 Formulasi Metrik Evaluasi Kuantitatif

Kinerja model OCR dan komparator semantik wajib dievaluasi menggunakan metrik baku *Information Retrieval / Classification*:

$$\text{Precision} = \frac{TP}{TP + FP}$$

$$\text{Recall} = \frac{TP}{TP + FN}$$

$$F_1\text{-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

Di mana definisi operasional matriks konfusi (*confusion matrix*) adalah:
- **True Positive (TP):** Berkas bukti lamaran yang valid dan sesuai, yang secara tepat direkomendasikan `Approved` oleh sistem IDP.
- **False Positive (FP):** Berkas bukti lamaran palsu, tidak cocok, atau cacat, yang secara keliru direkomendasikan `Approved` oleh sistem IDP (*Kondisi Kritis yang harus diminimalisir*).
- **False Negative (FN):** Berkas bukti lamaran yang sebenarnya valid, namun secara keliru ditolak (`Rejected`) atau dialihkan ke antrean verifikasi manusia (`Waiting Confirmation`).
- **True Negative (TN):** Berkas bukti lamaran cacat atau tidak sesuai yang secara tepat direkomendasikan `Rejected` oleh sistem IDP.

### 7.2 Spesifikasi Dataset Pengujian (*Ground Truth Dataset*)
Evaluasi harus menggunakan minimal **200 sampel bukti lamaran beranotasi** yang mencakup distribusi skenario dunia nyata:
1. **Clear Screenshot (40%):** Tangkapan layar email konfirmasi atau portal karir dengan teks tajam dan tata letak standar.
2. **Mobile Cropped Screenshot (25%):** Bukti dari aplikasi mobile (LinkedIn, Jobstreet, Glints) dengan bagian header/footer terpotong sebagian.
3. **Low-Resolution / Compressed Image (15%):** Bukti gambar yang terkompresi akibat pengiriman via aplikasi perpesanan WhatsApp/Telegram.
4. **Irrelevant / Corrupted Evidence (10%):** Berkas bukti salah unggah (foto pemandangan, dokumen tugas kuliah, bukti transfer, atau biner acak).
5. **Borderline / Expired Vacancy (10%):** Bukti lamaran dengan teks pemberitahuan lowongan telah ditutup (*closed vacancy*).

### 7.3 Kriteria Keberhasilan Produksi (*Production Acceptance Gate*)
Pipeline Hybrid IDP layak diintegrasikan ke sistem inti LMS Dibimbing.id apabila memenuhi ambang batas minimum berikut pada dataset *ground truth*:
- **Precision:** $\ge 95.0\%$ (Toleransi False Positive $\le 5\%$, mencegah kecurangan verifikasi).
- **Recall:** $\ge 85.0\%$ (Toleransi rujukan ke peninjau manusia wajar pada bukti ambigu).
- **$F_1$-Score:** $\ge 89.5\%$.
- **Latency Pipeline P95:** $\le 3.5\text{ detik}$ per pemrosesan berkas bukti.
- **Biaya API:** $\le \$0.015$ per berkas bukti lamaran yang diproses.

---

## 8. Panduan Verifikasi Manual Pengguna (*User Verification Guide*)

Untuk memverifikasi purwarupa secara langsung di peramban web:

1. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:5173/`.

2. **Verifikasi Skenario Admin:**
   - Masuk ke menu **Batches**. Klik tombol **"+ Create Batch"**.
   - Masukkan nama batch `Batch 25 UI Verification`. Atur rentang tanggal Phase 1 dan Phase 2.
   - Tambahkan kuota target per job level (Intern: 5, Entry: 10, Mid: 5). Klik **Simpan**.
   - Buka rincian batch baru, klik **Add Participant**, daftarkan siswa baru.

3. **Verifikasi Skenario Student & Period Gating:**
   - Gunakan *Role Switcher* di header kanan atas untuk beralih ke peran **Student**.
   - Buka halaman **My Batches**, pilih `Batch 25 UI Verification`.
   - Amati kartu fase: jika tanggal hari ini berada di dalam rentang Phase 1, tombol **"+ Tambah Bukti Lamaran"** akan aktif.
   - Klik tombol submit, isi 8 atribut formulir, dan unggah berkas gambar valid (PNG/JPEG).
   - Kirim lamaran. Amati bahwa lamaran langsung tercatat dengan status `Waiting Confirmation`.

4. **Verifikasi Skenario HITL Review:**
   - Beralih kembali ke peran **Admin (Talent Support)**.
   - Buka menu **Requests**. Amati lamaran siswa tadi muncul di antrean peninjauan.
   - Klik tombol **Review** untuk membuka *Evidence Inspector Modal*.
   - Periksa perbandingan antara nilai formulir siswa dan hasil ekstraksi atribut IDP.
   - Klik tombol **Approve**. Amati modal konfirmasi sekunder, lalu setujui.
   - Verifikasi bahwa item keluar dari antrean Request, dan progres batch siswa bertambah secara sinkron di menu **Batches**.
