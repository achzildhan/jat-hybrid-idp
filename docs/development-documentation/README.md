# Master Development Documentation & Technical Handover — JAT Hybrid IDP

**Proyek:** Job Application Tracking (JAT) System dengan Pendekatan Hybrid Intelligent Document Processing (IDP)  
**Tipe Repositori:** Standalone Prototype & Architecture Reference Workspace  
**Status Pengembangan:** Implementasi EP-JAT-01 s/d EP-JAT-12 Selesai, Terverifikasi 100% Lolos Uji (97/97 Tests Passed)  
**Versi Dokumentasi:** 1.0.0  
**Tanggal Rilis:** 19 Oktober 2026  
**Penyusun:** Senior Product Manager, Technical Writer, Software Architect, AI Systems Engineer & QA Lead  

---

## 1. Pendahuluan & Tujuan Dokumentasi

Dokumentasi ini merupakan bundel resmi penyerahan teknis (*technical handover*), rekam jejak pengembangan produk (*product development record*), dan peta bukti akademis (*academic evidence map*) untuk proyek purwarupa **JAT Hybrid IDP**. 

Purwarupa ini dikembangkan dari awal (*from zero*) secara mandiri dalam sebuah direktori kosong menggunakan metodologi pengembangan berbasis bantuan AI (*AI-assisted vibedesign and vibecoding workflows*) dengan integrasi **Google Stitch** (desain visual, spesifikasi token antarmuka, dan MCP handoff) serta **Google Antigravity** (implementasi kode frontend bertahap, perancangan aturan deterministik, rekayasa *mock adapter* IDP, dan penjaminan mutu QA).

### Tiga Tujuan Utama Dokumentasi:
1. **Penyerahan Teknis (*Technical Handover*):** Menjelaskan struktur arsitektur sistem, alur kerja bisnis, mekanisme validasi hibrida (Hybrid IDP), lokasi implementasi kode, tata kelola *mock adapter*, serta algoritma pencocokan bukti lamaran.
2. **Rekam Jejak Pengembangan Produk (*Product Development Record*):** Merekontruksi secara transparan dan jujur riwayat *Product Backlog*, estimasi perencanaan sprint (*Sprint Planning*), tinjauan hasil (*Sprint Review*), refleksi perbaikan (*Retrospective*), serta log perubahan (*Changelog*) dari EP-JAT-01 hingga EP-JAT-12.
3. **Penyusunan Laporan Akademis (BAB IV KKL):** Menyediakan rujukan terstruktur, matriks keterlacakan (*traceability*), data pengujian empiris, dan diagram proses standar industri (BPMN, DFD, *Component Views*) untuk mendukung penyusunan Laporan Kuliah Kerja Lapangan (KKL) Program Studi Sistem Informasi.

---

## 2. Hirarki & Klasifikasi Bukti (*Evidence Classification*)

Seluruh klaim, status implementasi, dan analisis teknis dalam dokumentasi ini diklasifikasikan secara ketat berdasarkan enam tingkatan bukti empiris guna menjaga integritas akademik dan profesional:

| Tingkat Bukti | Label Klasifikasi | Definisi Operasional dalam Dokumentasi Ini |
|---|---|---|
| **Level 1** | `[Verified in Code]` | Dikonfirmasi langsung dari kode sumber nyata yang terimplementasi di direktori `src/`. |
| **Level 2** | `[Verified by Test]` | Telah dieksekusi secara aktual melalui *test runner* (`vitest run`) dan diamati hasilnya lulus (`Passed`). |
| **Level 3** | `[Documented Design/Req]` | Tercantum dalam dokumen kebutuhan (`PRD.md`, `Business-Rules.md`) atau spesifikasi Stitch (`DESIGN.md`). |
| **Level 4** | `[Historical Record]` | Didukung oleh artefak prompt, commit Git, log transkrip obrolan, atau dokumen bertanggal resmi. |
| **Level 5** | `[Reconstructed Analysis]` | Direkonstruksi secara logis dari perubahan kode dan artefak pengujian yang ada, bukan dari catatan rapat formal. |
| **Level 6** | `[Proposed / Unresolved]` | Rencana pengembangan masa depan, opsi arsitektur, atau keputusan yang masih terbuka (`DEC-01` s/d `DEC-12`). |

> [!IMPORTANT]
> **Prinsip Kejujuran Teknis:** Dokumentasi ini **tidak pernah** mengklaim bahwa model OCR dan LLM telah terintegrasi secara *live* ke layanan cloud produksi. Komponen AI saat ini dioperasikan menggunakan *Mock Service Adapter* terisolasi berstatus `BLOCKED_PENDING_DECISION` (`DEC-05`, `DEC-06`, `DEC-11`, `DEC-12`) dengan typed contracts lengkap guna melindungi privasi data dan mencegah biaya tak terduga.

---

## 3. Peta Navigasi & Struktur Bundel Dokumentasi

Bundel dokumentasi ini tersusun dalam 14 dokumen mendalam di bawah direktori `docs/development-documentation/`:

```
docs/development-documentation/
├── README.md                                 # Peta navigasi utama, status sistem, dan panduan membaca
├── 01-PROJECT-DEVELOPMENT-HISTORY.md         # Sejarah siklus hidup pengembangan sistem dari awal hingga audit
├── 02-AI-PROMPT-EXECUTION-LOG.md             # Registry kronologis eksekusi prompt AI dan hasil observasi
├── 03-EPIC-CHANGELOG.md                      # Log perubahan mendalam per Epic (EP-JAT-01 s/d EP-JAT-12)
├── 04-PRODUCT-BACKLOG-FINAL.md               # Rekonstruksi Product Backlog akhir dan status pemenuhan
├── 05-SPRINT-PLANNING-AND-EXECUTION.md       # Analisis perencanaan sprint, alokasi backlog, dan deviasi
├── 06-SPRINT-REVIEW-AND-RETROSPECTIVE.md     # Tinjauan sprint, evaluasi kriteria penerimaan, dan lessons learned
├── 07-TO-BE-SYSTEM-OVERVIEW.md               # Gambaran proses TO-BE, aktor, aturan bisnis, dan diagram alir BPMN
├── 08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md   # Arsitektur teknis, diagram aliran data (DFD), rute, dan state
├── 09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md    # Deep dive mekanisme Hybrid IDP, ekstraksi OCR, dan algoritma leksikal
├── 10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md  # Panduan tur kode sumber, komponen utama, dan anotasi fungsi kritis
├── 11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md # Laporan pengujian otomatis, evaluasi UAT, dan register risiko
├── 12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md # Matriks keterlacakan dua arah kebutuhan ke kode dan pengujian
├── 13-DECISION-LOG-AND-LIMITATIONS.md       # Konsolidasi log keputusan arsitektural dan batasan sistem
└── 14-KKL-BAB-IV-EVIDENCE-MAP.md            # Pemetaan materi teknis ke struktur penulisan BAB IV Laporan KKL
```

---

## 4. Panduan Membaca Berdasarkan Peran Pembaca

### A. Untuk Mahasiswa Penyusun Laporan KKL (Fokus Akademik)
Urutan membaca yang disarankan:
1. Mulai dengan [`14-KKL-BAB-IV-EVIDENCE-MAP.md`](14-KKL-BAB-IV-EVIDENCE-MAP.md) untuk melihat panduan pemetaan bab dan sub-bab laporan KKL.
2. Pelajari konteks masalah dan alur TO-BE pada [`01-PROJECT-DEVELOPMENT-HISTORY.md`](01-PROJECT-DEVELOPMENT-HISTORY.md) dan [`07-TO-BE-SYSTEM-OVERVIEW.md`](07-TO-BE-SYSTEM-OVERVIEW.md).
3. Rujuk [`04-PRODUCT-BACKLOG-FINAL.md`](04-PRODUCT-BACKLOG-FINAL.md), [`05-SPRINT-PLANNING-AND-EXECUTION.md`](05-SPRINT-PLANNING-AND-EXECUTION.md), dan [`06-SPRINT-REVIEW-AND-RETROSPECTIVE.md`](06-SPRINT-REVIEW-AND-RETROSPECTIVE.md) untuk mendokumentasikan metodologi pengembangan perangkat lunak (Agile/Scrum).
4. Gunakan [`08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md`](08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md) dan [`09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md`](09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md) untuk perancangan sistem dan pembahasan algoritma AI/IDP.
5. Ambil data empiris dari [`11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md`](11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md) dan [`12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md`](12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md) untuk bab pengujian dan evaluasi.

### B. Untuk Software Engineer & Technical Reviewer (Fokus Implementasi)
Urutan membaca yang disarankan:
1. Periksa arsitektur dan aliran data pada [`08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md`](08-TO-BE-ARCHITECTURE-AND-DATA-FLOW.md).
2. Telusuri pembedahan algoritma dan *safeguard* aturan deterministik pada [`09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md`](09-HYBRID-IDP-MODEL-AND-ALGORITHMS.md).
3. Lakukan penelusuran kode mandiri dengan memandu pada [`10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md`](10-CODE-HIGHLIGHTS-AND-COMPONENT-MAP.md).
4. Tinjau keputusan arsitektur dan batasan saat ini di [`13-DECISION-LOG-AND-LIMITATIONS.md`](13-DECISION-LOG-AND-LIMITATIONS.md).

### C. Untuk Product Manager & Quality Assurance Lead (Fokus Mutu & Produk)
Urutan membaca yang disarankan:
1. Evaluasi pemenuhan PRD dan Aturan Bisnis di [`12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md`](12-REQUIREMENTS-AND-EVIDENCE-TRACEABILITY.md).
2. Tinjau matriks hasil pengujian dan register risiko di [`11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md`](11-TESTING-EVALUATION-AND-DEFECT-REGISTER.md).
3. Periksa riwayat perubahan fitur dari waktu ke waktu pada [`03-EPIC-CHANGELOG.md`](03-EPIC-CHANGELOG.md).

---

## 5. Ringkasan Status Sistem Saat Ini

- **Kompilasi TypeScript:** `Passed` (Strict Mode, 0 error).
- **Pengujian Unit & Integrasi:** `Passed` (12 test suite, 97 tes lulus 100%).
- **Build Produksi Vite:** `Passed` (Menghasilkan artefak mandiri `dist/`).
- **Penyimpanan Data Saat Ini:** In-memory dan browser `localStorage` (sintetis murni, terisolasi).
- **Status Integrasi AI:** Preprocessing dan aturan deterministik berjalan nyata (*real*); Adapter OCR dan LLM Semantik beroperasi sebagai *Mock Service Adapter* modular pending keputusan pengadaan cloud (`DEC-05`, `DEC-06`).
