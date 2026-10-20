# Laporan Audit dan Pembersihan Teks Antarmuka Pengguna (Frontend UX Copy Audit)
**Job Application Tracking (JAT) Hybrid IDP Platform — Dibimbing.id**

---

## 1. Executive Summary

Audit dan penyelarasan menyeluruh terhadap seluruh teks yang tampil pada antarmuka pengguna (*user-facing text*) pada aplikasi prototipe **JAT Hybrid IDP** telah selesai dilaksanakan. 

### Latar Belakang & Tujuan
Sebelumnya, sejumlah komponen antarmuka masih memuat kode penelusuran rekayasa internal—seperti nomor Epic (`EP-JAT-XX`), kode Product Backlog (`BLG-JAT-XXX`), pengenal aturan bisnis (`BR-XX`), catatan arsitektur (`DSN-TBD-XX`), serta label pengembangan seperti `"Mock Result"`, `"Synthetic Data"`, atau `"Prototype Mode"`. Meskipun bermanfaat selama fase implementasi bertahap, kehadiran kode-kode teknis tersebut pada tampilan visual mengurangi estetika profesional aplikasi dan membingungkan pengguna akhir (baik Mahasiswa Bootcamp maupun Talent Support).

Audit ini bertujuan untuk:
1. **Membersihkan seluruh kode pengenal internal** dari teks yang dirender pada antarmuka pengguna, label aksesibilitas (`aria-label`, `title`), dialog konfirmasi, banner informasi, dan pesan validasi formulir.
2. **Menerapkan bahasa Indonesia UX writing yang alami, lugas, santun, dan konsisten** sesuai identitas produk Dibimbing.id dan desain acuan Google Stitch.
3. **Mempertahankan 100% logika bisnis deterministik**, aturan hak akses berbasis peran (RBAC), penegakan integritas berkas, formula pemantauan progres, dan penanganan alur kerja Human-in-the-Loop (HITL) tanpa perubahan fungsional.
4. **Memastikan integritas rangkaian pengujian otomatis**, di mana seluruh 12 test suite (97 pengujian otomatis) dan proses build produksi lulus dengan tingkat keberhasilan 100%.

---

## 2. Inventaris Lengkap Penyelarasan Teks Antarmuka (Before & After)

Berikut adalah daftar perubahan teks pada 18 berkas komponen, modal, drawer, dan halaman antarmuka pengguna:

| No | Berkas / Komponen | Elemen / Lokasi | Teks Awal (Internal Dev Copy) | Teks Hasil Penyelarasan (Clean Production Copy) | Alasan Perubahan |
|:---|:---|:---|:---|:---|:---|
| 1 | `src/components/admin/AddStudentToBatchModal.tsx` | Error Message (L80) | Mahasiswa ini sudah terdaftar di dalam batch ini. Duplikasi peserta tidak diizinkan (BLG-JAT-007). | Mahasiswa ini sudah terdaftar di dalam batch ini. Duplikasi peserta tidak diizinkan. | Menghapus kode backlog `BLG-JAT-007`. Pesan sudah sangat jelas dan tegas. |
| 2 | `src/components/admin/AddStudentToBatchModal.tsx` | Banner Info (L190) | ...ditandai agar tidak terjadi duplikasi peserta (BLG-JAT-007). | ...ditandai agar tidak terjadi duplikasi peserta. | Menghapus kode backlog pada banner edukasi modal penambahan mahasiswa. |
| 3 | `src/components/admin/AdminHitlInspectorModal.tsx` | Error Otorisasi (L109) | Akses ditolak: Hanya peran Admin (Talent Support) atau Super Admin yang berwenang meninjau Request JAT (BR-33 / BR-43). | Akses ditolak: Hanya peran Admin (Talent Support) atau Super Admin yang berwenang meninjau Request JAT. | Menghapus kode aturan `BR-33 / BR-43` dari pesan validasi modal peninjauan. |
| 4 | `src/components/admin/AdminHitlInspectorModal.tsx` | Validasi Format Berkas (L117) | Keputusan Approved ditolak oleh aturan deterministik (BR-11 / BR-26): Format berkas bukti harus JPG, JPEG, atau PNG. | Keputusan disetujui ditolak: Format berkas bukti harus berupa file JPG, JPEG, atau PNG. | Mengganti jargon teknis deterministik dan kode aturan dengan bahasa Indonesia baku. |
| 5 | `src/components/admin/AdminHitlInspectorModal.tsx` | Validasi Rentang Tanggal (L118) | Keputusan Approved ditolak oleh aturan deterministik (BR-14 / BR-26 / BR-45): Date Applied berada di luar rentang tanggal batch yang berlaku. | Keputusan disetujui ditolak: Tanggal melamar (Date Applied) berada di luar rentang tanggal batch yang berlaku. | Mengeliminasi kode aturan bisnis dan memperjelas alasan penolakan sistem. |
| 6 | `src/components/admin/AdminHitlInspectorModal.tsx` | Validasi Alasan Tolak (L125) | Alasan penolakan (rejection reason) wajib diisi saat menolak Request JAT (BR-24). | Alasan penolakan wajib diisi saat menolak Request JAT. | Menghapus repetisi istilah bahasa Inggris dan kode `BR-24`. |
| 7 | `src/components/admin/AdminHitlInspectorModal.tsx` | Status Tanggal Melamar (L281) | Within active batch dates (BR-14) | Sesuai rentang tanggal batch | Mengganti teks bahasa Inggris dan kode `BR-14` dengan keterangan bahasa Indonesia yang jelas. |
| 8 | `src/components/admin/AdminHitlInspectorModal.tsx` | Status Tanggal Melamar (L288) | Di luar rentang tanggal aktif (BR-14 / BR-45) | Di luar rentang tanggal batch | Menghapus kode `BR-14 / BR-45` dari pill status tanggal. |
| 9 | `src/components/admin/AdminHitlInspectorModal.tsx` | Badge Format Berkas (L395) | Format Valid (BR-11) | Format Berkas Sesuai | Menghapus kode `BR-11` dan menggunakan istilah 'Format Berkas Sesuai'. |
| 10 | `src/components/admin/AdminHitlInspectorModal.tsx` | Judul Jejak Audit (L404, L409) | Jejak Audit Human Review (BR-25) | Riwayat Peninjauan Talent Support | Mengganti istilah 'Jejak Audit Human Review (BR-25)' menjadi istilah operasional yang akrab bagi tim. |
| 11 | `src/components/admin/AdminHitlInspectorModal.tsx` | Metadata Waktu Review (L447) | Timestamp server belum tersedia (Simulasi Prototype) | Waktu peninjauan belum tercatat | Menghilangkan frase pengembangan '(Simulasi Prototype)'. |
| 12 | `src/components/admin/AdminHitlInspectorModal.tsx` | Section Title (L459, L504) | Checklist 7 Atribut Wajib (BR-39 / DSN-TBD-06) | Pemeriksaan 7 Atribut Kelayakan | Mengganti kode arsitektur dengan tajuk fungsional 'Pemeriksaan 7 Atribut Kelayakan'. |
| 13 | `src/components/admin/AdminHitlInspectorModal.tsx` | Nilai Ekstraksi Kosong (L545) | Unknown / Belum Diekstraksi (BR-18) | Tidak terdeteksi pada bukti | Memberikan penjelasan informatif bahwa teks atribut tidak terbaca pada gambar bukti. |
| 14 | `src/components/admin/AdminHitlInspectorModal.tsx` | Banner Asisten Ekstraksi (L572-578) | Demo Extraction Assistant — Human Review Required (BR-37) | Asisten Ekstraksi Otomatis — Butuh Peninjauan Manual | Mengubah label demo internal menjadi copy panduan operasional asisten AI yang elegan. |
| 15 | `src/components/admin/AdminHitlInspectorModal.tsx` | Label Form Alasan Tolak (L643) | (Wajib — BR-24) | (Wajib diisi) | Menghapus referensi `BR-24` dari label input formulir. |
| 16 | `src/components/admin/DateRangePresetPopover.tsx` | Popover Title (L41) | Asisten Pilih Rentang Tanggal (BR-03: Start Date <= End Date) | Pilihan Cepat Rentang Tanggal | Menghapus kode aturan `BR-03` dan rumus logika dari judul popover. |
| 17 | `src/components/admin/DeleteBatchModal.tsx` | Subtitle Modal (L78) | Tindakan destruktif permanen (BR-09) | Tindakan ini tidak dapat dibatalkan. | Mengganti istilah teknis rekayasa dengan peringatan standar UX yang berempati. |
| 18 | `src/components/admin/RemoveParticipantModal.tsx` | Subtitle Modal (L67) | Konfirmasi Tindakan Destruktif (BR-09) | Konfirmasi Penghapusan Peserta | Mengganti istilah 'Tindakan Destruktif' dengan 'Penghapusan Peserta'. |
| 19 | `src/components/admin/SaveBatchConfirmationModal.tsx` | Panel Dampak (L102) | Dampak Perubahan Konsekuensial (BR-08 & BR-29) | Dampak Perubahan Konsekuensial | Menghapus kode aturan `BR-08 & BR-29` dengan tetap mempertahankan penjelasan dampak perubahan kuota. |
| 20 | `src/components/admin/SaveBatchConfirmationModal.tsx` | Catatan Sinkronisasi (L122) | Catatan Sinkronisasi (BR-06, BR-08, BR-14, BR-42): | Catatan Sinkronisasi: | Menghapus rentetan kode aturan bisnis dari header banner informasi. |
| 21 | `src/components/layout/AdminShell.tsx` | Header Utility Pill (L161) | Prototype Mode • Synthetic Data (BR-35 / BR-37) | Mode Simulasi • Data Uji | Menggantikan terminologi prototipe bahasa Inggris dengan padanan bahasa Indonesia yang rapi. |
| 22 | `src/components/layout/AdminShell.tsx` | Select Accessible Name (L208) | aria-label="Pilih Peran Simulasi Prototype" | aria-label="Pilih Peran Pengguna" | Membersihkan label aksesibilitas pembaca layar (screen reader) dari istilah internal. |
| 23 | `src/components/layout/AdminShell.tsx` | Unauthorized Banner Title (L251) | Akses Ditolak (BR-33 / BR-43): Akses Terbatas Peran Student | Akses Ditolak: Halaman Khusus Admin & Talent Support | Mengubah judul banner menjadi pesan pembatasan akses yang jelas dan ramah pengguna. |
| 24 | `src/components/layout/AdminShell.tsx` | Unauthorized Description (L254) | Peran simulasi aktif saat ini adalah Student... | Peran aktif saat ini adalah Student... | Menghapus kata 'simulasi' agar kalimat mengalir lebih lugas. |
| 25 | `src/components/layout/StudentShell.tsx` | Sidebar Nav Item (L107) | Prototype Mode Switcher | Akses Portal Admin | Menghapus istilah 'Prototype Mode Switcher' menjadi tautan navigasi portal yang wajar. |
| 26 | `src/components/layout/StudentShell.tsx` | Simulation Section (L148, L155) | Simulasi Prototype Student (EP-JAT-03) | Simulasi Akun Mahasiswa | Menghapus penomoran Epic `EP-JAT-03` pada pengalih akun demo mahasiswa. |
| 27 | `src/components/layout/StudentShell.tsx` | Select Accessible Name (L167) | aria-label="Pilih Peran Simulasi Prototype" | aria-label="Pilih Peran Pengguna" | Membersihkan atribut aria-label dropdown peran. |
| 28 | `src/components/student/AddProofOfApplicationDrawer.tsx` | Header Banner Unggah (L276) | Catatan Penting Persyaratan Unggah (BR-11, BR-12, BR-15) | Persyaratan Berkas Bukti Lamaran | Mengganti judul banner persyaratan unggah dengan istilah profesional. |
| 29 | `src/components/student/AddProofOfApplicationDrawer.tsx` | Keterangan Status Awal (L287) | ...bukan bahwa pengajuan telah disetujui (BR-15). | ...bukan bahwa pengajuan telah disetujui. | Menghapus kode `BR-15` dari kalimat penjelasan penting bagi mahasiswa. |
| 30 | `src/components/student/AddProofOfApplicationDrawer.tsx` | Catatan Arsitektur (L291-294) | Catatan Arsitektur (BR-12): Validasi format & tipe MIME pada prototype ini dilakukan di sisi klien... | Pastikan nama perusahaan, posisi pekerjaan, dan tanggal lamaran terlihat jelas pada berkas tangkapan layar. | Mengganti catatan teknis klien/server developer dengan tips praktis persiapan berkas bukti lamaran bagi mahasiswa. |
| 31 | `src/components/student/AddProofOfApplicationDrawer.tsx` | Peringatan Tanggal (L348, L354) | Peringatan Rentang Tanggal (BR-14 & BR-45): ...otomatis menjadi Rejected (DSN-TBD-04). | Peringatan Rentang Tanggal: ...status validasi akan tercatat sebagai Rejected. | Menghapus seluruh kode `BR-14`, `BR-45`, dan `DSN-TBD-04`. |
| 32 | `src/components/student/AddProofOfApplicationDrawer.tsx` | Validasi Tanggal Masa Depan (L362) | Tanggal masa depan ditolak (BR-13). | Tanggal masa depan tidak diizinkan. | Menghapus kode `BR-13` dari teks bantuan input tanggal. |
| 33 | `src/components/student/StudentApplicationDetailDrawer.tsx` | Drawer Section Title (L126) | Simulasi Prototype — Hasil Validasi Mock (BR-37) | Status Verifikasi Lamaran | Mengubah tajuk hasil validasi menjadi 'Status Verifikasi Lamaran'. |
| 34 | `src/components/student/StudentApplicationDetailDrawer.tsx` | Keterangan Sumber Validasi (L132-135) | Status dan umpan balik pada layar ini berasal dari data simulasi prototype (bukan hasil mesin AI/OCR produksi). | Status dan hasil peninjauan diperbarui secara berkala oleh tim Talent Support berdasarkan bukti lamaran yang dikirimkan. | Memberikan transparansi operasional yang profesional tanpa mengekspos kata 'mock'. |
| 35 | `src/components/student/StudentApplicationDetailDrawer.tsx` | Keterangan Waiting (L200) | ...pemeriksaan Talent Support (BR-15 & BR-23). | ...pemeriksaan Talent Support. | Menghapus `BR-15 & BR-23` dari umpan balik default antrean verifikasi. |
| 36 | `src/components/student/StudentApplicationDetailDrawer.tsx` | Judul Alasan Tolak (L234) | Alasan Penolakan (Rejection Reason — BR-23 / BR-24) | Alasan Penolakan | Menyederhanakan judul kotak alasan penolakan. |
| 37 | `src/components/student/StudentApplicationDetailDrawer.tsx` | Tahapan Rekrutmen Eksternal (L279) | Tahapan Rekrutmen Perusahaan (Progres Eksternal — BR-28) | Tahapan Rekrutmen Perusahaan | Menghapus kode aturan `BR-28` dari pemisah tahapan rekrutmen perusahaan. |
| 38 | `src/pages/admin/AdminBatchDetailPage.tsx` | Keterangan Phase 2 Nonaktif (L227) | Phase 2 tidak diaktifkan untuk batch ini (Opsional sesuai BR-04). | Phase 2 tidak diaktifkan untuk batch ini (Opsional). | Menghapus kode `BR-04`. |
| 39 | `src/pages/admin/AdminBatchDetailPage.tsx` | Tombol Recalculate (L346) | Recalculate khusus Admin / Super Admin (BR-30) | Sinkronisasi khusus Admin / Super Admin | Menghapus kode aturan otorisasi `BR-30`. |
| 40 | `src/pages/admin/AdminBatchDetailPage.tsx` | Badge Single Source of Truth (L439) | Single Source of Truth (BR-06) | Data Terpusat & Terpadu | Mengganti jargon teknis dengan istilah tata kelola data yang profesional. |
| 41 | `src/pages/admin/AdminBatchDetailPage.tsx` | Policy Badge Formula (L456) | Formula Kuota ({PROGRESS_CALCULATION_POLICY.decisionId}): Lamaran Approved | Formula Kuota: Hanya Lamaran Approved | Menyederhanakan representasi formula kuota kelayakan. |
| 42 | `src/pages/admin/AdminBatchDetailPage.tsx` | Policy Badge Akses (L464) | Otorisasi Recalculate (DSN-TBD-02 / TBD-PERM-01): Admin & Super Admin | Hak Akses Perhitungan: Admin & Super Admin | Menghilangkan kode keputusan desain `DSN-TBD-02 / TBD-PERM-01`. |
| 43 | `src/pages/admin/AdminBatchDetailPage.tsx` | Breakdown Tahapan (L613) | Tahapan Rekrutmen (BR-28) | Tahapan Rekrutmen Perusahaan | Menghapus kode `BR-28`. |
| 44 | `src/pages/admin/AdminBatchDetailPage.tsx` | Tombol Hapus Mahasiswa (L969) | title="Hapus Student dari Batch (BR-09)" | title="Hapus Student dari Batch" | Menghapus kode `BR-09` dari tooltip aksi baris tabel. |
| 45 | `src/pages/admin/AdminBatchFormPage.tsx` | Badge Form Phase (L268) | Opsional (BR-04) | Opsional | Menghapus kode `BR-04`. |
| 46 | `src/pages/admin/AdminBatchFormPage.tsx` | Helper Phase 2 Nonaktif (L311) | Phase 2 saat ini dinonaktifkan (Opsional sesuai BR-04)... | Phase 2 saat ini dinonaktifkan (Opsional)... | Menghapus kode `BR-04`. |
| 47 | `src/pages/admin/AdminBatchFormPage.tsx` | Subtitle Target Job Level (L460) | Target Job Level & Jumlah Lamaran (BR-05) | Target Job Level & Jumlah Lamaran | Menghapus kode `BR-05`. |
| 48 | `src/pages/admin/AdminBatchManagementPage.tsx` | Tombol Hapus Batch (L282) | title="Hapus Batch (BR-09)" | title="Hapus Batch" | Menghapus kode `BR-09` dari tooltip tombol hapus batch. |
| 49 | `src/pages/admin/AdminRequestQueuePage.tsx` | Deskripsi Header (L174, L175) | ...status Waiting Confirmation (BR-32). Pemeriksaan dilakukan satu per satu melalui HITL Evidence Inspector (DSN-TBD-03). | ...status Waiting Confirmation. Pemeriksaan dilakukan secara individual melalui peninjauan bukti berkas. | Menghapus kode aturan `BR-32` dan jargon arsitektur `HITL Evidence Inspector (DSN-TBD-03)`. |
| 50 | `src/pages/admin/AdminRequestQueuePage.tsx` | Label Pengalih Peran (L186) | Simulasi Peran (BR-33): | Peran Pengguna: | Menghapus kode `BR-33` dari form header antrean. |
| 51 | `src/pages/admin/AdminRequestQueuePage.tsx` | Pill Independensi Rekrutmen (L204) | Status Verifikasi Admin ≠ Status Rekrutmen Perusahaan (BR-28) | Status Verifikasi Admin ≠ Status Rekrutmen Perusahaan | Menghapus kode `BR-28` dari pill informasi header antrean. |
| 52 | `src/pages/admin/AdminRequestQueuePage.tsx` | Badge Antrean Status (L415) | Antrean Aktif (BR-32) | Antrean Aktif | Menghapus kode `BR-32` dari header status antrean aktif. |
| 53 | `src/pages/admin/AdminStudentDetailPage.tsx` | Sub-Header Rekrutmen (L471) | Ringkasan Tahapan Rekrutmen Perusahaan (BR-28 — Terpisah dari Validasi JAT): | Ringkasan Tahapan Rekrutmen Perusahaan (Terpisah dari Validasi JAT): | Menghapus kode `BR-28`. |
| 54 | `src/pages/admin/AdminStudentDetailPage.tsx` | Paragraf Penjelasan Status (L511) | ...terpisah dari Tahapan Rekrutmen perusahaan (BR-28). | ...terpisah dari Tahapan Rekrutmen perusahaan. | Menghapus kode `BR-28`. |
| 55 | `src/pages/admin/AdminStudentDetailPage.tsx` | Keterangan Popover Filter (L569) | Saring lamaran berdasarkan Phase, Date Range, atau Status (BR-31) | Saring lamaran berdasarkan Phase, Date Range, atau Status | Menghapus kode `BR-31`. |
| 56 | `src/pages/admin/AdminStudentDetailPage.tsx` | Header Kolom Tabel (L768) | Tahapan Rekrutmen (BR-28) | Tahapan Rekrutmen Perusahaan | Menghapus kode `BR-28`. |
| 57 | `src/pages/student/StudentBatchDetailPage.tsx` | Helper Phase 2 Nonaktif (L263) | Fase opsional ini tidak diaktifkan pada batch ini (BR-04). | Fase opsional ini tidak diaktifkan pada batch ini. | Menghapus kode `BR-04`. |
| 58 | `src/pages/student/StudentBatchDetailPage.tsx` | Banner Phase 2 Kosong (L288) | Phase 2 Tidak Diaktifkan (Opsional — BR-04) | Phase 2 Tidak Diaktifkan (Opsional) | Menghapus kode `BR-04`. |
| 59 | `src/pages/student/StudentBatchDetailPage.tsx` | Keterangan Kuota Phase 2 (L527) | Phase 2 bersifat opsional (BR-04) | Phase 2 bersifat opsional | Menghapus kode `BR-04`. |
| 60 | `src/pages/student/StudentBatchDetailPage.tsx` | Header Kartu Validasi (L536) | Status Validasi Bukti (BR-22) | Status Validasi Bukti | Menghapus kode `BR-22`. |
| 61 | `src/pages/student/StudentBatchDetailPage.tsx` | Sub-Header Kartu Validasi (L550) | Terpisah dari progres rekrutmen perusahaan (BR-28) | Terpisah dari tahapan rekrutmen perusahaan | Menghapus kode `BR-28`. |
| 62 | `src/pages/student/StudentBatchDetailPage.tsx` | Callout Independensi Validasi (L591) | Catatan (BR-28): Status Validasi JAT... | Catatan: Status Validasi JAT... | Menghapus kode `BR-28`. |
| 63 | `src/pages/student/StudentBatchDetailPage.tsx` | Header Kolom Tabel (L642) | Tahapan Rekrutmen Perusahaan (BR-28) | Tahapan Rekrutmen Perusahaan | Menghapus kode `BR-28`. |
| 64 | `src/pages/student/StudentBatchDetailPage.tsx` | Pill Status Validasi Baris (L700) | {isWaiting ? 'Belum Diproses' : 'Simulasi Mock (BR-37)'} | {isWaiting ? 'Menunggu Review' : 'Hasil Verifikasi'} | Menggantikan 'Simulasi Mock (BR-37)' dengan indikator fungsional 'Hasil Verifikasi'. |
| 65 | `src/pages/student/StudentBatchDetailPage.tsx` | Pesan Notifikasi Sukses Out-of-Range (L781) | ...berstatus Rejected karena Date Applied (...) berada di luar rentang tanggal aktif batch (BR-14 & BR-45 / DSN-TBD-04). | ...berstatus Rejected karena Date Applied (...) berada di luar rentang tanggal aktif batch. | Menghilangkan seluruh kode aturan internal dari toast notifikasi mahasiswa. |
| 66 | `src/pages/student/StudentBatchDetailPage.tsx` | Pesan Notifikasi Sukses In-Range (L785) | ...berhasil diterima untuk pemrosesan verifikasi (Status: Waiting Confirmation). Catatan (BR-15): Berhasil mengunggah berkas berarti bukti telah diterima oleh sistem, bukan berarti pengajuan telah disetujui (Approved). | ...berhasil diterima untuk pemrosesan verifikasi (Status: Waiting Confirmation). Catatan: Berhasil mengunggah berkas berarti bukti telah diterima oleh sistem, bukan berarti pengajuan telah disetujui (Approved). | Menghapus kode `BR-15` dari toast konfirmasi pengunggahan berkas. |
| 67 | `src/pages/student/StudentBatchListPage.tsx` | Subtitle Halaman (L161) | Menampilkan jadwal periode yang disinkronkan langsung dari konfigurasi Admin (BR-06). | Menampilkan jadwal periode yang disinkronkan langsung dari konfigurasi Admin. | Menghapus kode `BR-06`. |
| 68 | `src/pages/student/StudentBatchListPage.tsx` | Badge Phase 2 Card (L234) | Tidak Diaktifkan (Opsional — BR-04) | Tidak Diaktifkan (Opsional) | Menghapus kode `BR-04`. |
| 69 | `src/mocks/jatData.ts` | Catatan Ekstraksi Mock (L381) | Kemiripan leksikal >70% (BR-40), butuh konfirmasi Admin. | Kesesuaian data membutuhkan konfirmasi Admin. | Menghapus kode `BR-40` dari data catatan sampel. |
| 70 | `src/mocks/jatData.ts` | Catatan Ekstraksi Mock (L419) | Work System tidak tertulis eksplisit pada screenshot email konfirmasi (BR-18 / BR-23). | Sistem kerja tidak tertulis eksplisit pada tangkapan layar email konfirmasi. | Menghapus kode `BR-18 / BR-23` dari data sampel. |
| 71 | `src/mocks/jatData.ts` | Alasan Penolakan Sampel (L499) | Screenshot terpotong dan nama perusahaan tidak terlihat jelas (BR-17). | Screenshot terpotong dan nama perusahaan tidak terlihat jelas. | Menghapus kode `BR-17` dari data sampel penolakan bukti. |

---

## 3. Matriks Pemetaan Istilah (Terminology Mapping Table)

Tabel berikut menunjukkan pemetaan standardisasi dari terminologi internal ke terminologi produk:

| Kode / Terminologi Internal | Arti Rekayasa / Backlog | Padanan UI Ramah Pengguna (Bahasa Indonesia) | Konteks Penggunaan |
|:---|:---|:---|:---|
| `EP-JAT-XX` | Epic ID dalam Product Backlog | *Dihapus sepenuhnya dari UI* | Navigasi, judul halaman, penanda modul |
| `BLG-JAT-XXX` | Backlog Item ID spesifik | *Dihapus sepenuhnya dari UI* | Pesan kesalahan, info banner |
| `BR-01, BR-02` | Validasi Nama Batch & Duplikasi | Nama Batch sudah digunakan / Nama Batch wajib diisi | Pesan validasi formulir batch |
| `BR-03` | Start Date <= End Date | Pilihan Cepat Rentang Tanggal / Tanggal mulai harus lebih awal dari tanggal selesai | Popover rentang tanggal |
| `BR-04` | Phase 2 bersifat opsional | Phase 2 (Opsional) / Tidak Diaktifkan (Opsional) | Kartu dan badge fase batch |
| `BR-05` | Target kuota per job level | Target Job Level & Jumlah Lamaran | Form konfigurasi target lamaran |
| `BR-06` | Sinkronisasi Single Source of Truth | Data Terpusat & Terpadu / Disinkronkan langsung dari Admin | Banner sinkronisasi jadwal |
| `BR-07` | Pembatasan akses periode aktif | Tombol dinonaktifkan di luar periode aktif | Tombol "+ Add Proof of Application" |
| `BR-08, BR-29` | Konsekuensi perubahan target | Dampak Perubahan Konsekuensial | Modal konfirmasi simpan perubahan batch |
| `BR-09` | Aksi destruktif (Hapus batch/peserta) | Konfirmasi Penghapusan Peserta / Tindakan ini tidak dapat dibatalkan | Dialog konfirmasi hapus permanen |
| `BR-10` | 7 field input lamaran wajib | Tanda bintang merah `*` (Wajib diisi) | Formulir pengajuan bukti lamaran |
| `BR-11, BR-12` | Berkas JPG/JPEG/PNG & batas 5MB | Format Berkas Sesuai / JPG, JPEG, PNG (maksimal 5MB) | Persyaratan berkas bukti |
| `BR-13` | Penolakan tanggal masa depan | Tanggal masa depan tidak diizinkan | Pesan validasi Date Applied |
| `BR-14, BR-45` | Pengecekan rentang tanggal aktif | Peringatan Rentang Tanggal / Sesuai rentang tanggal batch | Notifikasi tanggal di luar rentang aktif |
| `BR-15` | Status awal bukti: Waiting Confirmation | Bukti diterima untuk verifikasi (Waiting Confirmation) | Keterangan alur persetujuan berkas |
| `BR-17` | Penolakan bukti buram/terpotong | Tangkapan layar terpotong / tidak terbaca jelas | Contoh alasan penolakan berkas |
| `BR-18` | Atribut bukti tidak terdeteksi | Tidak terdeteksi pada bukti | Checklist ekstraksi bukti |
| `BR-22` | Standarisasi 3 Status Validasi JAT | Status Validasi Bukti (`Approved`, `Waiting Confirmation`, `Rejected`) | Badge dan kartu ringkasan status |
| `BR-23, BR-24` | Alasan wajib penolakan | Alasan Penolakan (Wajib diisi) | Form keputusan penolakan Talent Support |
| `BR-25` | Jejak audit review manusia | Riwayat Peninjauan Talent Support | Kartu riwayat tindakan peninjauan |
| `BR-26` | Non-override safeguard | Aturan sistem berlaku mutlak | Banner panduan verifikasi |
| `BR-27, BR-37` | Mock/Assistive AI labeling | Asisten Ekstraksi Otomatis / Status Verifikasi Lamaran | Keterangan alat bantu ekstraksi |
| `BR-28` | Independensi validasi vs rekrutmen | Status Verifikasi Admin ≠ Tahapan Rekrutmen Perusahaan | Pill dan tabel tahapan rekrutmen |
| `BR-30, BR-43` | Hak akses Recalculate Admin/Super Admin | Hak Akses Perhitungan: Admin & Super Admin | Badge otorisasi sinkronisasi kuota |
| `BR-31` | Multi-dimensi filter tabel lamaran | Saring lamaran berdasarkan Phase, Rentang Tanggal, atau Status | Popover filter riwayat lamaran |
| `BR-32` | Antrean khusus Waiting Confirmation | Antrean Aktif (Waiting Confirmation) | Header antrean Request JAT |
| `BR-33, BR-43` | Pembatasan akses Admin dari Student | Akses Ditolak: Halaman Khusus Admin & Talent Support | Banner peringatan pembatasan peran |
| `BR-39` | 7 Atribut Kelayakan IDP | Pemeriksaan 7 Atribut Kelayakan | Checklist perbandingan bukti 7 atribut |
| `BR-40` | Pencocokan leksikal & kemiripan nama | Kesesuaian data membutuhkan konfirmasi Admin | Catatan perbandingan atribut |
| `BR-42` | Integritas histori pengajuan lama | Validitas historis bukti tetap dipertahankan | Catatan perubahan rentang tanggal |
| `DSN-TBD-01` | Keputusan 3 Status Validasi | Disetujui (Approved), Menunggu Verifikasi, Ditolak | Standar status sistem |
| `DSN-TBD-02` | Keputusan otorisasi kalkulasi ulang | Hak Akses Perhitungan: Admin & Super Admin | Keterangan otorisasi |
| `DSN-TBD-03` | Keputusan review individual 1-by-1 | Pemeriksaan dilakukan secara individual melalui peninjauan bukti berkas | Petunjuk review antrean |
| `DSN-TBD-04` | Penolakan otomatis out-of-range date | Status validasi otomatis tercatat sebagai Rejected | Warning formulir bukti |
| `DSN-TBD-05` | Konfirmasi hapus ketik nama batch | Masukkan nama batch persis untuk konfirmasi | Modal hapus batch |
| `DSN-TBD-06` | Checklist visual 7 atribut | Pemeriksaan 7 Atribut Kelayakan (7 / 7 Atribut) | Inspector perbandingan data |

---

## 4. Verifikasi Pemeliharaan Logika Bisnis (Business Logic Preservation)

Pembersihan teks dilakukan secara ketat pada lapisan presentasi visual tanpa mengorbankan logika bisnis inti:
1. **Validasi Formulir:** Seluruh aturan wajib isi (*required fields*), batasan ukuran file 5MB, pembatasan ekstensi berkas (`image/jpeg`, `image/png`), penolakan tanggal masa depan (`BR-13`), dan penandaan otomatis status `Rejected` untuk tanggal di luar periode batch (`BR-14 & BR-45`) tetap aktif dan berfungsi 100%.
2. **Kalkulasi & Sinkronisasi Kuota:** Formula penghitungan kuota kelayakan berdasarkan lamaran `Approved` (`PROGRESS_CALCULATION_POLICY`), pembaruan per-student target, serta deteksi perubahan konsekuensial (*consequential impact preview*) berjalan normal.
3. **Pemisahan Validasi JAT vs Progres Rekrutmen:** Status verifikasi berkas Dibimbing.id (`Approved`, `Waiting Confirmation`, `Rejected`) tetap berdiri independen dari tahapan seleksi eksternal perusahaan (`Applied`, `Screening`, `Interview`, `Offering`, `Hired`, `Rejected by Company`).
4. **Human-in-the-Loop Safeguards:** Blokir otomatis persetujuan untuk berkas yang tidak valid, kewajiban pengisian alasan penolakan, perekaman jejak audit review, dan pencegahan duplikasi klik (*in-flight submission guard*) tetap terpasang kokoh.
5. **Pembatasan Hak Akses (Role-Based Access Control):** Pengguna dengan peran `Student` tetap dilarang memicu aksi administratif, membuka antrean peninjauan, atau menghapus data milik mahasiswa lain.

---

## 5. Panduan Suara dan Gaya Bahasa (Voice and Tone Guidelines)

Perbaikan teks antarmuka menerapkan prinsip UX Writing Dibimbing.id:
- **Lugas & Jelas (*Clear & Concise*):** Menghilangkan jargon internal pengembang (`BR-`, `DSN-TBD-`, `BLG-`) agar pengguna dapat langsung memahami maksud pesan tanpa kebingungan teknis.
- **Berempati & Konstruktif (*Empathetic & Constructive*):** Pesan kesalahan tidak sekadar menyalahkan pengguna, melainkan memberikan petunjuk solusi konkret (misalnya: daripada hanya menulis *"Format tidak valid"*, sistem menjelaskan *"Format berkas bukti harus berupa file JPG, JPEG, atau PNG"*).
- **Amanah & Transparan (*Trustworthy & Transparent*):** Menjelaskan status verifikasi secara jujur tanpa membuat klaim palsu (misalnya: menegaskan bahwa keberhasilan mengunggah berkas berarti data telah diterima dalam antrean verifikasi, bukan berarti otomatis disetujui).
- **Konsisten (*Consistent Terminology*):** Menggunakan padanan kata yang seragam di seluruh portal (seperti penggunaan *"Talent Support"*, *"Status Validasi Bukti"*, *"Tahapan Rekrutmen Perusahaan"*, dan *"Alasan Penolakan"*).

---

## 6. Dampak Aksesibilitas dan Kegunaan (Accessibility & Usability Impact)

1. **Pembaca Layar (*Screen Readers*):**
   - Atribut `aria-label`, `aria-labelledby`, dan `aria-describedby` telah diperbarui dari label teknis developer menjadi deskripsi kontekstual fungsional (misal: `aria-label="Pilih Peran Pengguna"` menggantikan `aria-label="Pilih Peran Simulasi Prototype"`).
   - Dialog modal memiliki heading terstruktur yang dapat diakses dengan tombol Tab dan tombol Escape.
2. **Indikator Visual & Status Warna:**
   - Semua status validasi (`Approved`, `Waiting Confirmation`, `Rejected`) didampingi ikon Material Symbols (`check_circle`, `hourglass_top`, `cancel`) selain warna latar, guna menjaga aksesibilitas bagi pengguna dengan keterbatasan penglihatan warna (*color blindness*).
3. **Pencegahan Kesalahan (*Error Prevention*):**
   - Aksi destruktif seperti penghapusan batch mengharuskan pengetikan nama batch secara tepat dengan pesan konfirmasi yang jelas bahwa tindakan tidak dapat dibatalkan.

---

## 7. Verifikasi Pengujian Otomatis (Automated Test Verification)

Semua test suite dan assertion pengujian otomatis telah diselaraskan dengan teks antarmuka baru. Hasil eksekusi pengujian vitest menunjukkan kelulusan 100%:

```bash
$ npm test

> jat-hybrid-idp-prototype@0.1.0 test
> vitest run

 RUN  v3.2.7 C:/Users/ACER/Downloads/PKL Journey/jat-hybrid-idp

 ✓ src/test/ep-jat-05.test.ts (18 tests) 62ms
 ✓ src/test/ep-jat-06.test.ts (18 tests) 83ms
 ✓ src/test/ep-jat-12.test.tsx (6 tests) 116ms
 ✓ src/test/ep-jat-11.test.tsx (5 tests) 974ms
 ✓ src/test/ep-jat-03.test.tsx (7 tests) 1799ms
 ✓ src/test/ep-jat-10.test.tsx (6 tests) 2177ms
 ✓ src/test/ep-jat-07.test.tsx (5 tests) 3527ms
 ✓ src/test/ep-jat-02.test.tsx (7 tests) 4646ms
 ✓ src/test/ep-jat-01.test.tsx (9 tests) 4928ms
 ✓ src/test/ep-jat-04.test.tsx (5 tests) 5258ms
 ✓ src/test/ep-jat-09.test.tsx (5 tests) 7334ms
 ✓ src/test/ep-jat-08.test.tsx (6 tests) 8476ms

 Test Files  12 passed (12)
      Tests  97 passed (97)
   Start at  20:45:07
   Duration  15.70s (transform 4.60s, setup 6.13s, collect 28.63s, tests 39.38s, environment 29.28s, prepare 6.35s)
```

Verifikasi kompilasi TypeScript dan bundler Vite untuk produksi:
```bash
$ npm run build

> jat-hybrid-idp-prototype@0.1.0 build
> tsc -b && vite build

vite v6.4.4 building for production...
✓ 68 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.99 kB │ gzip:   0.55 kB
dist/assets/index-CRiIPJVs.css  104.56 kB │ gzip:  16.39 kB
dist/assets/index-Ci9wCkWL.js   555.71 kB │ gzip: 141.13 kB
✓ built in 6.23s
```

---

## 8. Area Developer-Facing yang Tetap Dipertahankan (Out of Scope)

Sesuai instruksi dan panduan ketertelusuran rekayasa (*traceability*):
1. **Dokumentasi Pengembang & Riset:** Seluruh berkas di dalam `docs/PRD.md`, `docs/Business-Rules.md`, `docs/System-Requirements.md`, `docs/Product-Backlog.md`, `docs/development-documentation/`, dan `planning/TRACEABILITY.md` tetap mempertahankan ID formal (`BR-XX`, `EP-JAT-XX`, `BLG-JAT-XXX`, `DSN-TBD-XX`) untuk integritas akademik, audit sprint, dan laporan BAB IV KKL.
2. **Komentar Kode Sumber (*Source Code Comments*):** Docstrings fungsi dan komentar baris pada TypeScript tetap dipertahankan guna memandu pengembang yang memelihara kode di masa mendatang.
3. **Data Kontrak & Tipe API:** Definisi TypeScript pada `src/types/jat.ts` dan nama variabel internal tetap dipertahankan untuk menjamin stabilitas arsitektur.

---

## 9. Rekomendasi Pemeliharaan Frontend di Masa Mendatang

Untuk memastikan standar kualitas teks antarmuka tetap terjaga dalam pengembangan lanjutan:
1. **Linter Rule untuk UI Strings:** Pasang aturan ESLint khusus yang melarang string literal yang mengandung pola regex `/(BR-\d+|BLG-JAT-|EP-JAT-|DSN-TBD-)/` pada berkas JSX/TSX antarmuka.
2. **Kamus Teks Terpusat (*Copy Dictionary / i18n*):** Pertimbangkan untuk memindahkan teks antarmuka statis ke dalam modul kamus lokal (misalnya `src/locales/id.json`) agar tim UX Writer dan Product Manager dapat meninjau dan memperbarui teks secara independen tanpa menyentuh kode komponen.
3. **Code Review Checklist:** Tambahkan klausul verifikasi UX Copy pada template Pull Request GitHub: *"Pastikan tidak ada kode aturan bisnis atau penomoran backlog yang tampil pada antarmuka pengguna"*.
