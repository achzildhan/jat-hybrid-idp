# 13. Decision Log and Architectural Limitations — JAT Hybrid IDP

**Dokumen Kontrol:**
- **Kode Dokumen:** DOC-M (13-DECISION-LOG-AND-LIMITATIONS)
- **Versi:** 1.0.0
- **Status:** Complete / Authoritative Architecture Record
- **Tanggal Rilis:** 2026-10-19
- **Klasifikasi Bukti:** `[Documented Design/Req]` & `[Reconstructed Analysis]`
- **Penanggung Jawab:** Lead System Architect & Technical Reviewer
- **Target Pembaca:** Engineering Lead, Enterprise Architect, Dosen Pembimbing KKL

---

## 1. Pendahuluan & Tata Kelola Keputusan (*Decision Governance*)

Pengembangan purwarupa *Job Application Tracking (JAT) Hybrid IDP* berpegang teguh pada prinsip arsitektur yang transparan, terukur, dan sadar batasan (*limitation-aware*). Setiap keputusan teknis yang diambil selama proses rekayasa sistem dicatat dalam *Decision Log* guna membedakan secara tegas antara:
1. **Keputusan yang Sudah Terpasang (*Adopted/Approved Decisions*):** Telah diuji dan dibuktikan dalam kode purwarupa.
2. **Keputusan Tertunda (*Open/Blocked Decisions*):** Memerlukan penetapan otorisasi bisnis, kontrak keamanan, atau analisis biaya produksi dari pemangku kepentingan (*stakeholders*) Dibimbing.id.

---

## 2. Log Keputusan Arsitektur Komprehensif (DEC-01 s/d DEC-12)

Berikut adalah rekam jejak formal dari 12 keputusan arsitektur utama proyek JAT Hybrid IDP:

### 2.1 DEC-01: Pemilihan *Frontend Technology Stack*
- **Status:** Approved / Terpasang
- **Konteks & Masalah:** Dibutuhkan lingkungan pengembangan modern yang mendukung perancangan antarmuka berkecepatan tinggi, sistem pengetikan ketat, dan integrasi mudah dengan sistem token desain Google Stitch.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Vanilla HTML5 + JavaScript + Bootstrap. (Sederhana, tetapi sulit dikelola pada state yang kompleks).
  - *Opsi B:* Next.js (SSR/App Router). (Kuat, namun memperkenalkan kompleksitas server yang berlebihan untuk purwarupa mandiri).
  - *Opsi C (Terpilih):* React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- **Rasional & Keputusan:** Memilih Opsi C karena Vite menawarkan HMR (*Hot Module Replacement*) berkecepatan milidetik, TypeScript menegakkan kontrak data bertipe di seluruh alur pelaporan, dan Tailwind CSS memfasilitasi adopsi token desain `#0066FF` secara akurat.
- **Konsekuensi & Trade-off:** Menghasilkan bundel JavaScript sisi klien yang membutuhkan optimasi *chunking*, namun memberikan kemandirian penuh tanpa dependensi runtime server pada tahap awal.

### 2.2 DEC-02: Arsitektur Backend & Layanan API
- **Status:** Open / Needs Stakeholder Decision
- **Konteks & Masalah:** Menentukan apakah purwarupa memerlukan server backend independen (Node.js/Express atau Python/FastAPI) atau abstraksi *repository pattern* di sisi klien.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Membangun microservice Express/FastAPI tersendiri.
  - *Opsi B (Terpilih untuk Prototipe):* Pola *Asynchronous Repository Pattern* di sisi klien (`IBatchRepository`) dengan data tersimpan di memory dan `localStorage`.
- **Rasional & Keputusan:** Opsi B dipilih demi memastikan purwarupa dapat diuji secara mandiri (*standalone portability*) tanpa konfigurasi server lokal atau masalah CORS. Seluruh antarmuka data telah dibuat bertipe dan mengembalikan `Promise`, sehingga siap disambungkan ke API backend riil di kemudian hari.
- **Bukti yang Dibutuhkan untuk Menutup:** Spesifikasi kontrak OpenAPI/Swagger dan arsitektur backend resmi dari tim internal Dibimbing.id.

### 2.3 DEC-03: Mesin Persistensi & Database
- **Status:** Open / Needs Stakeholder Decision
- **Konteks & Masalah:** Pemilihan basis data produksi untuk menyimpan relasi kompleks antara Batch, Fase, Peserta, Lamaran, dan Jejak Audit IDP.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Dokumen NoSQL (MongoDB / Firestore).
  - *Opsi B (Rekomendasi Produksi):* Relational Database (PostgreSQL / Cloud SQL).
  - *Opsi C (Terpilih untuk Prototipe):* Browser `localStorage` + In-Memory Mock Store.
- **Rasional & Keputusan:** Opsi C digunakan untuk kebutuhan purwarupa interaktif. Untuk produksi, direkomendasikan Opsi B (PostgreSQL) karena data JAT memiliki integritas relasional yang ketat (kunci asing batch, proteksi penghapusan bertingkat, dan kepatuhan ACID).
- **Bukti yang Dibutuhkan untuk Menutup:** Persetujuan skema DDL relasional dan estimasi volume penyimpanan berkas bukti.

### 2.4 DEC-04: Penyimpanan Berkas Bukti (*Evidence Storage*)
- **Status:** Open / Needs Stakeholder Decision
- **Konteks & Masalah:** Penyimpanan jangka panjang untuk ribuan gambar bukti lamaran kerja (PNG/JPEG $\le 5\text{MB}$).
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Simpan langsung di basis data sebagai base64/BLOB. (Sangat membebani database).
  - *Opsi B (Rekomendasi Produksi):* Object Storage (Google Cloud Storage / AWS S3) dengan *Signed URL*.
  - *Opsi C (Terpilih untuk Prototipe):* Local Object URLs / Base64 Data URI sementara di browser.
- **Rasional & Keputusan:** Opsi C diterapkan agar prototipe dapat langsung menampilkan pratinjau bukti visual di peramban tanpa koneksi cloud. Opsi B wajib diterapkan saat produksi dengan enkripsi *at-rest* dan retensi berkas minimal 6 bulan pasca kelulusan siswa.
- **Bukti yang Dibutuhkan untuk Menutup:** Kebijakan kepatuhan privasi data dan konfigurasi bucket Cloud Storage Dibimbing.id.

### 2.5 DEC-05: Pemilihan Penyedia Mesin OCR (*OCR Engine Provider*)
- **Status:** Blocked / Pending Stakeholder Decision (Dicatat di `BLG-JAT-017` & `EP-JAT-05`)
- **Konteks & Masalah:** Memilih engine OCR yang mampu membaca tangkapan layar berkas bukti lamaran kerja dalam Bahasa Indonesia dan Bahasa Inggris dengan tingkat akurasi tinggi.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Google Cloud Document AI / Cloud Vision API. (Sangat akurat, berbayar per halaman, membutuhkan koneksi internet dan API key).
  - *Opsi B:* Tesseract OCR (Open Source / On-Premise). (Gratis, mandiri, namun sensitif terhadap teks buram dan tata letak tidak beraturan).
  - *Opsi C (Terpilih untuk Prototipe):* Modular `MockOcrEngineAdapter` dengan status eksplisit `BLOCKED_PENDING_DECISION`.
- **Rasional & Keputusan:** Sesuai `AGENTS.md`, dilarang memasang kredensial produksi tanpa izin atau mengasumsikan ketersediaan layanan cloud. Prototipe menyediakan kontrak antarmuka `OcrEngine` yang siap menerima adapter riil tanpa mengubah logika bisnis ekstraksi.
- **Bukti yang Dibutuhkan untuk Menutup:** Hasil pengujian komparatif (*benchmark*) akurasi pada dataset bukti lamaran Dibimbing.id serta analisis anggaran operasional API.

### 2.6 DEC-06: Pemilihan Model Komparator Semantik LLM (*Semantic LLM Comparator*)
- **Status:** Blocked / Pending Stakeholder Decision (Dicatat di `BLG-JAT-021` & `EP-JAT-06`)
- **Konteks & Masalah:** Memilih model kecerdasan buatan (*Large Language Model*) untuk membandingkan kesesuaian semantik antara teks bukti dan formulir (misal: "Frontend Engineer" vs "Web Developer React").
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Google Gemini 1.5 Flash / Pro (via `@google/genai` SDK).
  - *Opsi B:* OpenAI GPT-4o-mini.
  - *Opsi C (Terpilih untuk Prototipe):* Modular `MockSemanticComparatorAdapter` berstatus `BLOCKED_PENDING_DECISION` dipadukan dengan aturan deterministik leksikal nyata (*Sørensen–Dice*).
- **Rasional & Keputusan:** Mencegah kebocoran data siswa ke pihak ketiga sebelum adanya penilaian dampak privasi (*Data Protection Impact Assessment / DPIA*). Prototipe menegakkan aturan deterministik ketat, sehingga sistem tetap berjalan stabil meskipun adapter semantik dimock.
- **Bukti yang Dibutuhkan untuk Menutup:** Uji keandalan format keluaran JSON terstruktur (*structured output*), analisis latensi P95, dan penandatanganan addendum pemrosesan data (DPA).

### 2.7 DEC-07: Tata Kelola Aturan Keputusan Status Validasi (*Three-Status Decision Policy*)
- **Status:** Approved / Terpasang
- **Konteks & Masalah:** Menentukan logika percabangan untuk 3 status validasi (`Approved`, `Waiting Confirmation`, `Rejected`) agar konsisten dan adil.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Biner (Hanya Lolos atau Tolak, tanpa review manusia).
  - *Opsi B (Terpilih):* Kebijakan berjenjang 3 tingkat (90/60/0) dengan *Human-in-the-Loop* (`BR-38`).
- **Rasional & Keputusan:** Opsi B dipilih karena berkas bukti dunia nyata seringkali memiliki kualitas bervariasi (buram, terpotong parsial). Memaksakan keputusan biner akan merugikan siswa atau meloloskan kecurangan. Ambang batas skor $\ge 90\%$ untuk otomatis lolos dan $60\%-89\%$ untuk verifikasi staf terbukti memberikan titik temu optimal.
- **Bukti yang Dibutuhkan untuk Menutup:** Tinjauan dan persetujuan operasional oleh tim Talent Support Dibimbing.id.

### 2.8 DEC-08: Model Integrasi Purwarupa vs Ekosistem LMS
- **Status:** Approved / Terpasang
- **Konteks & Masalah:** Menentukan batasan integrasi antara purwarupa JAT dengan sistem inti LMS Dibimbing.id yang sedang berjalan.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Mengubah langsung basis kode LMS eksisting Dibimbing.id.
  - *Opsi B (Terpilih):* Membangun purwarupa mandiri (*standalone prototype*) dari direktori kosong yang siap diintegrasikan via modul atau micro-frontend.
- **Rasional & Keputusan:** Opsi B melindungi lingkungan produksi LMS dari risiko instabilitas, memungkinkan eksperimen arsitektur IDP secara bebas, serta menghasilkan dokumentasi akademis yang independen dan terisolasi rapi.
- **Bukti yang Dibutuhkan untuk Menutup:** Surat persetujuan arsitektur micro-frontend dari tim Engineering Dibimbing.id.

### 2.9 DEC-09: Metrik Estimasi Story Points & Sprint Mapping
- **Status:** Accepted for Planning / Reconstructed Record
- **Konteks & Masalah:** Menyelaraskan estimasi backlog rencana awal (145 Story Points, SP-01 s/d SP-06) dengan alur eksekusi asinkron berbantuan AI (*AI-assisted development*).
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Menghapus angka Story Points karena eksekusi dilakukan oleh agen AI.
  - *Opsi B (Terpilih):* Mempertahankan pemetaan Story Points sebagai acuan beban kognitif manusia (*human-equivalent effort*) untuk evaluasi akademis dan perbandingan produktivitas.
- **Rasional & Keputusan:** Opsi B memberikan nilai tambah yang signifikan bagi laporan akademik KKL, mendemonstrasikan bagaimana beban kerja 6 sprint tim manusia dapat diakselerasi melalui pemanfaatan agen cerdas terorkestrasikan.
- **Bukti yang Dibutuhkan untuk Menutup:** Verifikasi oleh dosen pembimbing KKL dan tim penilai akademik.

### 2.10 DEC-10: Batasan Keamanan & Otorisasi Peran (*Access Control Boundaries*)
- **Status:** Approved for Prototype / Needs Backend Auth for Production
- **Konteks & Masalah:** Mengatur hak akses peran Student vs Admin di lingkungan purwarupa peramban.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Tanpa otorisasi peran sama sekali (semua tombol terbuka).
  - *Opsi B (Terpilih):* Penegakan otorisasi peran ganda: antarmuka visual (`RoleGuard`) dan lapisan layanan data (`batchRepository.ts`).
- **Rasional & Keputusan:** Opsi B memastikan logika pembatasan hak akses (`BR-33`, `BR-43`) teruji secara ketat dalam pengujian otomatis, meskipun token sesi OAuth2/JWT belum diimplementasikan di tingkat jaringan.
- **Bukti yang Dibutuhkan untuk Menutup:** Integrasi gateway otentikasi SSO (Single Sign-On) Dibimbing.id berbasis JWT HTTP-only cookies.

### 2.11 DEC-11: Isolasi Layanan OCR & Kontrak Ekstraksi Bertipe
- **Status:** Approved / Terpasang
- **Konteks & Masalah:** Bagaimana mengimplementasikan EP-JAT-05 ketika penyedia cloud OCR eksternal belum disetujui.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Menghentikan pengembangan EP-JAT-05 hingga penyedia cloud dipilih.
  - *Opsi B (Terpilih):* Mengembangkan pipeline preprocessing nyata (*magic bytes*, sanitasi teks, regex) dan mengabstraksi OCR di balik kontrak tipe `ExtractedJobAttributes` dengan mock adapter teruji.
- **Rasional & Keputusan:** Opsi B mencegah *blocker* pengembangan, membuktikan fungsionalitas logika preprocessing, dan menyediakan *test fixture* sintetis berkualitas tinggi untuk memvalidasi alur hilir.
- **Bukti yang Dibutuhkan untuk Menutup:** Pemilihan vendor OCR dan penulisan adapter produksi (`CloudDocumentAiOcrAdapter`).

### 2.12 DEC-12: Pembatasan Aturan Non-Override pada Validasi Semantik
- **Status:** Approved / Terpasang
- **Konteks & Masalah:** Mencegah fenomena halusinasi AI atau inkonsistensi LLM yang dapat meloloskan berkas bukti tidak sah atau salah tanggal.
- **Opsi yang Dipertimbangkan:**
  - *Opsi A:* Menyerahkan seluruh keputusan validasi kepada LLM (Pure AI Validation).
  - *Opsi B (Terpilih):* Arsitektur *Hybrid IDP* dengan *Deterministic Non-Override Safeguard* (`BR-26`).
- **Rasional & Keputusan:** Keputusan deterministik untuk integritas fisik berkas (ukuran, format, *magic bytes*) dan validitas tanggal pelaporan (*date ranges*) adalah hukum mutlak yang tidak boleh dianulir oleh skor kemiripan semantik LLM.
- **Bukti yang Dibutuhkan untuk Menutup:** Hasil uji regresi negatif `TS-06-13` dan `TS-12-06` membuktikan perlindungan ini bekerja 100%.

---

## 3. Keterbatasan Arsitektur & Operasional Sistem (*System Limitations*)

Purwarupa JAT Hybrid IDP dirancang dengan batasan-batasan teknis yang perlu dipahami oleh pengembang dan penguji:

### 3.1 Keterbatasan Persistensi Klien (*Client-Side Persistence Limitation*)
- **Deskripsi:** Seluruh mutasi data disimpan dalam memori JavaScript peramban dan disinkronkan ke `localStorage`.
- **Dampak Operasional:** 
  1. Data bersifat lokal per perangkat dan peramban pengguna; membersihkan cache peramban akan mereset data ke kondisi *seed* awal.
  2. Kapasitas penyimpanan `localStorage` terbatas pada kuota peramban ($\approx 5\text{MB}$ s/d $10\text{MB}$), sehingga gambar bukti disimpan sebagai referensi URL sementara.
- **Jalur Remediasi:** Mengganti adapter penyimpanan dengan repositori HTTP yang terhubung ke basis data PostgreSQL terpusat saat memasuki fase integrasi backend.

### 3.2 Keterbatasan Simulasi Otorisasi Peran (*Simulated RBAC Limitation*)
- **Deskripsi:** Pengalihan peran (Student vs Admin) dilakukan melalui *Role Switcher* di antarmuka web, bukan melalui sesi login terenkripsi.
- **Dampak Operasional:** Pengguna yang memahami inspeksi kode klien dapat memanipulasi state peran di konsol JavaScript.
- **Jalur Remediasi:** Memasang *API Gateway* di sisi server yang memverifikasi tanda tangan digital JWT pada setiap *request header* dan memberlakukan *Cross-Site Request Forgery (CSRF)* protection.

### 3.3 Keterbatasan Adapter Ekstraksi & Validasi AI (*Mock AI Adapters*)
- **Deskripsi:** Pemrosesan gambar tingkat lanjut (OCR piksel-ke-teks) dan perbandingan semantik konteks tinggi dijalankan menggunakan logika simulasi bertipe.
- **Dampak Operasional:** Sistem belum dapat mengevaluasi akurasi OCR pada gambar beresolusi sangat rendah atau tulisan tangan non-digital di lingkungan pengujian peramban saat ini.
- **Jalur Remediasi:** Mengaktifkan adapter live SDK (Google Document AI dan Google Gemini API) setelah penyedia cloud dan anggaran biaya disetujui oleh manajemen Dibimbing.id.

### 3.4 Peringatan Ukuran Bundel JavaScript (*Vite Bundle Warning*)
- **Deskripsi:** Saat menjalankan `npm run build`, Vite mengeluarkan peringatan bahwa beberapa *chunk* keluaran melebihi 500 kB (total aset gzip $\approx 150\text{ kB}$).
- **Dampak Operasional:** Waktu muat awal (*initial load time*) pada koneksi internet sangat lambat (3G) dapat sedikit meningkat.
- **Jalur Remediasi:** Menerapkan pemisahan kode rute dinamis (*route-based code splitting*) menggunakan `React.lazy()` dan `Suspense` untuk memecah halaman Admin dan Student menjadi berkas terpisah.

---

## 4. Peta Jalan Kesiapan Produksi (*Production Readiness Roadmap*)

Untuk membawa purwarupa JAT Hybrid IDP menuju peluncuran komersial di platform Dibimbing.id, berikut adalah tahapan migrasi yang direkomendasikan:

```
+-----------------------------------------------------------------------------------+
| TAHAP 1: FINALISASI KEPUTUSAN VENDOR (Bulan 1)                                    |
| - Penutupan DEC-05 (Pemilihan Vendor OCR: Google Cloud Document AI vs Tesseract)  |
| - Penutupan DEC-06 (Pemilihan Vendor LLM: Google Gemini 1.5 Flash)                |
| - Audit Kepatuhan Privasi Data & DPIA (Data Protection Impact Assessment)         |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| TAHAP 2: INTEGRASI BACKEND & STORAGE (Bulan 2)                                    |
| - Implementasi Backend REST/GraphQL (NestJS / FastAPI)                            |
| - Migrasi Database ke PostgreSQL (DDL relasional terstandar)                      |
| - Konfigurasi Google Cloud Storage Bucket untuk berkas bukti (Signed URLs)        |
| - Otentikasi Terpusat SSO OAuth2 / JWT HTTP-only Cookies                          |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| TAHAP 3: EVALUASI EMPIRIS & PENYELARASAN MODEL (Bulan 3)                          |
| - Pelaksanaan Benchmark Akurasi pada 200 Sampel Riwayat Siswa Dibimbing.id        |
| - Penyetelan Ambang Batas Sørensen-Dice dan Prompt Engineering Gemini             |
| - Evaluasi Target: Precision >= 95%, Recall >= 85%, Latensi P95 <= 3.5 detik      |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| TAHAP 4: PILOT PROJECT & FULL ROLLOUT (Bulan 4)                                   |
| - Uji Coba Terbatas (Pilot) pada 1 Batch Bootcamp Dibimbing.id                    |
| - Pelatihan Staf Talent Support untuk Penggunaan Antrean Review HITL              |
| - Peluncuran Penuh (Full Production Rollout) & Monitoring Metrik Kinerja          |
+-----------------------------------------------------------------------------------+
```
