# 14. Academic Reporting & BAB IV KKL Evidence Map — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Kode Dokumen:** DOC-N (14-KKL-BAB-IV-EVIDENCE-MAP)
- **Versi:** 1.0.0
- **Status:** Complete / Academic Guideline
- **Tanggal Rilis:** 2026-10-19
- **Klasifikasi Bukti:** `[Reconstructed Analysis]`, `[Verified in Code]`, `[Verified by Test]`
- **Penanggung Jawab:** Lead Research Specialist & Academic Mentor
- **Target Pembaca:** Mahasiswa Sarjana Sistem Informasi / Teknik Informatika, Dosen Pembimbing KKL, Penguji Sidang Praktik Kerja Lapangan

---

## 1. Panduan Penggunaan Dokumen untuk Laporan KKL

Dokumen ini disusun khusus sebagai **panduan penyusunan BAB IV (Hasil dan Pembahasan / Analisis, Perancangan, dan Implementasi)** laporan Kuliah Kerja Lapangan (KKL) atau Praktik Kerja Lapangan (PKL) mahasiswa program studi Sistem Informasi / Teknik Informatika di industri EdTech (studi kasus: platform bootcamp karir Dibimbing.id).

Dokumen ini memetakan seluruh artefak teknis purwarupa *Job Application Tracking (JAT) Hybrid Intelligent Document Processing (IDP)* ke dalam struktur bab standar akademik universitas. Untuk setiap sub-bab, disediakan narasi pengantar, pemodelan sistem (BPMN, DFD, arsitektur tanpa UML), tabel data, algoritma, serta referensi silang (*cross-reference*) ke berkas dokumentasi teknis rinci (Dokumen A s/d M).

---

## 2. Struktur Pemetaan BAB IV Laporan KKL

Berikut adalah struktur baku BAB IV laporan KKL yang telah diselaraskan dengan hasil rekayasa proyek:

```
BAB IV: ANALISIS, PERANCANGAN, IMPLEMENTASI, DAN EVALUASI SISTEM
  4.1 Analisis Sistem yang Berjalan (AS-IS System Analysis)
      4.1.1 Deskripsi Proses Bisnis Eksisting
      4.1.2 Identifikasi Permasalahan (Root Cause & Bottleneck)
      4.1.3 Analisis Kelemahan Sistem (Kerangka PIECES)
  4.2 Analisis Kebutuhan Sistem (System Requirements Analysis)
      4.2.1 Identifikasi Aktor dan Peran Pengguna
      4.2.2 Analisis Kebutuhan Fungsional (PRD & Product Backlog)
      4.2.3 Analisis Kebutuhan Non-Fungsional (System Requirements)
      4.2.4 Aturan Bisnis Inti (Business Rules)
  4.3 Perancangan Sistem Usulan (TO-BE System Design)
      4.3.1 Deskripsi Konsep Sistem Usulan (Hybrid IDP)
      4.3.2 Pemodelan Proses Bisnis Usulan (BPMN PROC-01 s/d PROC-04)
      4.3.3 Pemodelan Aliran Data (Data Flow Diagram - DFD Level 0 & Level 1)
      4.3.4 Perancangan Arsitektur Perangkat Lunak (Layered Architecture)
      4.3.5 Perancangan Data Konseptual dan Relasional
      4.3.6 Perancangan Antarmuka Pengguna (UI/UX Stitch Design System)
  4.4 Implementasi Sistem (System Implementation)
      4.4.1 Lingkungan Pengembangan dan Teknologi
      4.4.2 Dekomposisi Komponen dan Struktur Berkas Sumber
      4.4.3 Implementasi Algoritma Inti dan Logika Bisnis
  4.5 Pengujian dan Evaluasi Sistem (Testing & Evaluation)
      4.5.1 Strategi dan Rencana Pengujian
      4.5.2 Hasil Pengujian Otomatis (Vitest 97 Tests Passed)
      4.5.3 Hasil Pengujian Penerimaan Pengguna (User Acceptance Testing)
      4.5.4 Evaluasi Kinerja Hybrid IDP dan Rencana Tolok Ukur
  4.6 Pembahasan dan Keterbatasan Sistem (Discussion & Limitations)
      4.6.1 Analisis Manfaat dan Nilai Tambah Sistem
      4.6.2 Analisis Keterbatasan Purwarupa
      4.6.3 Rekomendasi Pengembangan Lanjutan
```

---

## 3. Matriks Bukti Pemetaan per Sub-Bab Akademik

Tabel berikut menjadi panduan cepat bagi mahasiswa untuk mengutip data, tabel, kode, dan diagram dari paket dokumentasi proyek ke dalam naskah laporan:

| Nomor Sub-Bab Laporan | Judul Sub-Bab Laporan | Fokus Pembahasan Akademik | Sumber Data Rinci / Rujukan Dokumen | Artefak / Bukti Nyata yang Digunakan |
|---|---|---|---|---|
| **4.1.1** | Deskripsi Proses Bisnis Eksisting | Alur manual pelaporan bukti via Google Forms / Sheets | [Doc A: 01-PROJECT-DEVELOPMENT-HISTORY.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/01-PROJECT-DEVELOPMENT-HISTORY.md) Bagian 1 | Analisis proses AS-IS, data historis keluhan siswa |
| **4.1.2** | Identifikasi Permasalahan | *Human fatigue*, penumpukan ribuan bukti, manipulasi berkas | [Doc A: 01-PROJECT-DEVELOPMENT-HISTORY.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/01-PROJECT-DEVELOPMENT-HISTORY.md) Bagian 1.2 | Analisis sebab-akibat (Fishbone), bottleneck SLA verifikasi |
| **4.1.3** | Analisis PIECES | Evaluasi Performance, Information, Economics, Control, Efficiency, Service | [Doc G: 07-TO-BE-SYSTEM-OVERVIEW.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/07-TO-BE-SYSTEM-OVERVIEW.md) Bagian 1.2 | Matriks perbandingan masalah eksisting vs solusi sistem |
| **4.2.1** | Identifikasi Aktor & Peran | Profil Student, Admin (Talent Support), Super Admin | [Doc G: 07-TO-BE-SYSTEM-OVERVIEW.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/07-TO-BE-SYSTEM-OVERVIEW.md) Bagian 2 | Matriks peran, wewenang, dan hak akses operasional |
| **4.2.2** | Kebutuhan Fungsional | 18 Kebutuhan PRD (`JAT-BL-01..18`) & 44 Backlog (`BLG-JAT`) | [Doc D: 04-PRODUCT-BACKLOG-FINAL.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/04-PRODUCT-BACKLOG-FINAL.md) | Tabel Product Backlog lengkap dengan kriteria penerimaan |
| **4.2.3** | Kebutuhan Non-Fungsional | Kinerja, keamanan data bukti, portabilitas, responsivitas | `docs/System-Requirements.md`, [Doc G](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/07-TO-BE-SYSTEM-OVERVIEW.md) Bagian 5 | Standar ISO/IEC 25010, toleransi latensi $\le 3.5\text{s}$ |
| **4.2.4** | Aturan Bisnis Inti | Penegakan 45 Aturan Bisnis (`BR-01` s/d `BR-45`) | [Doc L: 12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md) Bagian 3 | Tabel aturan validasi format, tanggal, dan ambang batas |
| **4.3.1** | Deskripsi Konsep Sistem Usulan | Mekanisme cerdas *Hybrid IDP* (Preprocessing + OCR + Rules + HITL) | [Doc I: 09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md) Bagian 1 | Diagram blok pipeline 10-tahap ekstraksi dan validasi |
| **4.3.2** | Pemodelan Proses Bisnis Usulan | Alur kerja terstruktur BPMN (PROC-01 s/d PROC-04) | [Doc G: 07-TO-BE-SYSTEM-OVERVIEW.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/07-TO-BE-SYSTEM-OVERVIEW.md) Bagian 3 | Diagram alir proses bisnis BPMN (Mermaid format) |
| **4.3.3** | Pemodelan Aliran Data (DFD) | DFD Level 0 (Konteks) & DFD Level 1 (Proses Utama) | [Doc H: 08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md) Bagian 2 | Diagram DFD Level 0 dan DFD Level 1 (Mermaid format) |
| **4.3.4** | Perancangan Arsitektur | Arsitektur berlapis (*Presentation*, *Logic*, *Data*) | [Doc H: 08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md) Bagian 1 | Diagram arsitektur komponen berlapis (*component view*) |
| **4.3.5** | Perancangan Data Konseptual | Struktur entitas Batch, Participant, Application, IDP Result | [Doc H: 08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md) Bagian 4 | Tabel kepemilikan data & kamus data entitas utama |
| **4.3.6** | Perancangan Antarmuka | Tata letak UI Stitch, token desain, pemetaan 52 node desain | [Doc J: 10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md) Bagian 2 | Inventarisasi layar `docs/SCREEN-INVENTORY.md` & komponen UI |
| **4.4.1** | Lingkungan & Stack Teknologi | Spesifikasi Node.js, React 18, Vite, Tailwind CSS, TypeScript | [Doc C: 03-EPIC-CHANGELOG.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/03-EPIC-CHANGELOG.md) Bagian 1.1 | Tabel spesifikasi teknologi pengembangan purwarupa |
| **4.4.2** | Struktur Berkas & Modul | Struktur direktori `src/`, pembagian pages, components, services | [Doc J: 10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md) Bagian 1 | Pohon repositori (*repository tree*) teranotasi fungsi |
| **4.4.3** | Implementasi Algoritma Inti | *Magic Bytes*, Sørensen–Dice, Kebijakan 90/60/0, Non-Override | [Doc I](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md) Bagian 3, [Doc J](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md) Bagian 3 | Cuplikan kode sumber, pseudocode, dan formulasi matematika |
| **4.5.1** | Rencana Pengujian Sistem | Metode pengujian Black-Box, Boundary Value, dan Regression | [Doc K: 11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md) Bagian 1 | Tabel rencana pengujian komprehensif |
| **4.5.2** | Hasil Pengujian Otomatis | 12 Berkas Test Suite, 97 Kasus Uji (Tingkat Kelulusan 100%) | [Doc K: 11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md) Bagian 4 | Rincian hasil eksekusi Vitest v3.2.7 per test suite |
| **4.5.3** | Hasil Pengujian UAT | 12 Skenario Pengujian Penerimaan Pengguna (*All Passed*) | [Doc K: 11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md) Bagian 5 | Matriks verifikasi skenario pengguna interaktif |
| **4.5.4** | Evaluasi Kinerja Hybrid IDP | Formulasi Precision, Recall, F1-Score & Desain Benchmark | [Doc K: 11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md) Bagian 7 | Protokol tolok ukur dataset beranotasi 200 sampel |
| **4.6.1** | Analisis Nilai Tambah | Efisiensi waktu verifikasi staf (turun dari hari ke menit) | [Doc A](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/01-PROJECT-DEVELOPMENT-HISTORY.md) Bagian 4.2 | Analisis perbandingan kuantitatif sebelum vs sesudah sistem |
| **4.6.2** | Keterbatasan Purwarupa | Persistensi browser, otorisasi klien, mock adapter (`DEC-05/06`) | [Doc M: 13-DECISION-LOG-AND-LIMITATIONS.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/13-DECISION-LOG-AND-LIMITATIONS.md) Bagian 3 | Pembahasan kejujuran ilmiah batasan purwarupa mandiri |
| **4.6.3** | Saran Pengembangan Lanjut | Peta jalan integrasi cloud database, live API OCR, & SSO | [Doc M: 13-DECISION-LOG-AND-LIMITATIONS.md](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/13-DECISION-LOG-AND-LIMITATIONS.md) Bagian 4 | Roadmap implementasi produksi 4 tahap |

---

## 4. Panduan Penulisan & Contoh Narasi Sub-Bab

Di bawah ini disajikan panduan teknis dan contoh narasi baku akademik yang dapat diadopsi langsung oleh mahasiswa:

### 4.1 Sub-Bab 4.1: Analisis Sistem yang Berjalan (AS-IS Analysis)
- **Pedoman Isi:** Jelaskan bagaimana proses pelaporan pencarian kerja dilakukan sebelum adanya sistem JAT Hybrid IDP di Dibimbing.id. Mahasiswa mengisi formulir Google Forms manual dan mengunggah tangkapan layar ke Google Drive. Staf Talent Support memeriksa berkas satu demi satu di spreadsheet.
- **Titik Kritis yang Harus Ditonjolkan:**
  1. *Human Fatigue:* Verifikasi manual terhadap ratusan bukti lamaran per gelombang menyebabkan kejenuhan staf, inkonsistensi penilaian, dan keterlambatan feedback ke siswa hingga 5–7 hari kerja.
  2. *Fraud Vulnerability:* Sistem spreadsheet tidak mampu mendeteksi manipulasi berkas (misal: gambar non-bukti, tanggal kadaluarsa, atau crop palsu).
  3. Gunakan tabel analisis **PIECES** yang merangkum *Performance*, *Information*, *Economics*, *Control*, *Efficiency*, dan *Service* (rujuk [Doc G, Bagian 1.2](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/07-TO-BE-SYSTEM-OVERVIEW.md)).

### 4.2 Sub-Bab 4.2: Analisis Kebutuhan Sistem (System Requirements)
- **Pedoman Isi:** Sajikan 18 kebutuhan fungsional (`JAT-BL-01` s/d `JAT-BL-18`) yang dirinci menjadi 44 *backlog items*. Jangan menyajikan daftar mentah; jelaskan relasinya dengan pemecahan masalah di sub-bab 4.1.
- **Penekanan Akademik:** 
  Jelaskan bahwa sistem ini memiliki 45 Aturan Bisnis (`BR-01` s/d `BR-45`) yang menjadi "pagar pengaman" (*guardrails*), seperti aturan *Period Gating* (`BR-06`, `BR-07`, `BR-14`) dan *Deterministic Non-Override Safeguard* (`BR-26`).

### 4.3 Sub-Bab 4.3: Perancangan Sistem Usulan (TO-BE Design)
- **Pedoman Isi:**
  1. **Proses Bisnis BPMN:** Sajikan 4 alur proses bisnis utama usulan (PROC-01 Konfigurasi Batch, PROC-02 Pelaporan Lamaran Siswa, PROC-03 Pipeline Ekstraksi & Validasi IDP, PROC-04 Peninjauan Bukti Ambigu HITL) menggunakan diagram alir BPMN (rujuk [Doc G, Bagian 3](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/07-TO-BE-SYSTEM-OVERVIEW.md)).
  2. **Data Flow Diagram (DFD):** Sajikan DFD Level 0 (Diagram Konteks) dan DFD Level 1 yang menunjukkan interaksi data antara entitas eksternal (Student, Talent Support) dengan 4 proses sistem utama dan 3 *data store* (rujuk [Doc H, Bagian 2](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md)).
  3. **Peringatan Kepatuhan:** **DILARANG MENGGUNAKAN DIAGRAM UML** (Use Case Diagram, Class Diagram, Activity Diagram, atau Sequence Diagram) sesuai arahan tata kelola arsitektur proyek (`AGENTS.md`). Gunakan pendekatan *Component-and-Connector / Layered Architecture* dan DFD.

### 4.4 Sub-Bab 4.4: Implementasi Sistem (Implementation)
- **Pedoman Isi:** Deskripsikan bagaimana sistem diimplementasikan secara konkret. 
- **Algoritma yang Wajib Dibahas Secara Matematis:**
  1. **Pemeriksaan Magic Bytes Biner (`imagePreprocessor.ts`):** Mengapa ekstensi berkas saja tidak cukup dan bagaimana 4 byte pertama diperiksa (`0x89 0x50 0x4E 0x47` untuk PNG).
  2. **Algoritma Kemiripan Sørensen–Dice (`lexicalSimilarity.ts`):** Tuliskan formula matematika:
     $$S(A, B) = \frac{2 \times |A \cap B|}{|A| + |B|}$$
     Jelaskan bagaimana bi-gram dibentuk dan normalisasi badan hukum (`PT`, `CV`, `Tbk`) diterapkan (`BR-40`).
  3. **Kebijakan Keputusan Berjenjang 90/60/0 (`idpDecisionPolicy.ts`):** Jelaskan mengapa sistem tidak menggunakan klasifikasi biner melainkan 3 status (`Approved`, `Waiting Confirmation`, `Rejected`) (`BR-38`).
  4. **Safeguard Non-Override Deterministik (`idpValidationService.ts`):** Jelaskan prinsip bahwa aturan fisik format dan tanggal tidak boleh dibatalkan oleh AI semantik (`BR-26`).

### 4.5 Sub-Bab 4.5: Pengujian dan Evaluasi Sistem (Testing & Evaluation)
- **Pedoman Isi:**
  1. Sajikan tabel rangkuman 12 *test suite* dan 97 kasus uji otomatis Vitest yang lulus 100% (rujuk [Doc K, Bagian 3 & 4](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md)).
  2. Tampilkan hasil 12 skenario pengujian *User Acceptance Testing (UAT)* (rujuk [Doc K, Bagian 5](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md)).
  3. **Kejujuran Ilmiah AI:** Nyatakan secara terbuka bahwa modul OCR dan LLM saat ini beroperasi menggunakan *Mock Typed Adapter* berstatus `BLOCKED_PENDING_DECISION` (`DEC-05`, `DEC-06`, `DEC-11`, `DEC-12`), sedangkan prapemrosesan gambar dan aturan deterministik berjalan nyata. Sajikan rancangan tolok ukur (*benchmark*) kuantitatif untuk pengujian live di masa depan (Precision, Recall, F1).

### 4.6 Sub-Bab 4.6: Pembahasan dan Keterbatasan (Discussion & Limitations)
- **Pedoman Isi:**
  1. Diskusikan dampak sistem terhadap efisiensi operasional Dibimbing.id: estimasi otomatisasi hingga 80% bukti berkualitas baik langsung lolos, menyisakan 20% bukti ambigu untuk antrean staf *Human-in-the-Loop* (rujuk [Doc A, Bagian 4.2](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/01-PROJECT-DEVELOPMENT-HISTORY.md)).
  2. Ulas secara jujur 10 risiko dan keterbatasan purwarupa (R-01 s/d R-10 pada [Doc K, Bagian 6](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md) dan [Doc M, Bagian 3](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/13-DECISION-LOG-AND-LIMITATIONS.md)).
  3. Paparkan peta jalan kesiapan produksi (*production readiness roadmap*) 4 tahap sebagai rekomendasi nyata bagi instansi (rujuk [Doc M, Bagian 4](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/docs/development-documentation/13-DECISION-LOG-AND-LIMITATIONS.md)).

---

## 5. Kesimpulan Bukti Akademik

Paket dokumentasi teknis JAT Hybrid IDP menyediakan basis bukti empiris yang lengkap, terverifikasi, dan dapat dipertanggungjawabkan secara akademik. Mahasiswa dapat menggunakan berkas-berkas dalam repositori `docs/development-documentation/` sebagai lampiran teknis resmi (*technical appendices*) untuk menyertai naskah laporan KKL dalam rangka sidang pertanggungjawaban program magang.
