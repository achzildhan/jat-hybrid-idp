# Product Requirements Document (PRD)

## 1. Informasi Produk

- **Nama produk:** Job Application Tracking System (JAT)
- **Konteks:** Fitur untuk pengelolaan aktivitas lamaran kerja peserta bootcamp pada LMS Dibimbing.id.
- **Status dokumen:** Requirement baseline untuk project baru/prototype.
- **Aktor utama:** Student dan Admin/Talent Support.
- **Kontribusi teknis yang direncanakan:** adaptasi dan integrasi pendekatan Hybrid Intelligent Document Processing (IDP) untuk membantu pemrosesan dan validasi bukti lamaran; bukan penciptaan algoritma IDP baru.

## 2. Latar Belakang dan Masalah

Pada kondisi awal yang menjadi dasar kajian, Student melaporkan aktivitas lamaran kerja kepada Talent Support melalui WhatsApp dengan screenshot sebagai bukti. Talent Support kemudian mencocokkan informasi laporan dengan bukti dan mencatat hasilnya. Alur manual ini menyulitkan pencatatan terstruktur, terutama karena screenshot memiliki variasi layout, kualitas, dan kelengkapan.

Pada dokumentasi pengembangan berikutnya, JAT sudah memiliki baseline fungsi pengelolaan batch, peserta, aktivitas lamaran, dan AI validation. Test case menunjukkan beberapa isu yang harus ditangani, termasuk bukti terpotong yang tetap disetujui, ketidaksesuaian beberapa field yang terlewat, validasi format file, konsistensi rentang tanggal, serta beberapa alur Request yang belum terverifikasi sepenuhnya.

Dokumen ini menggabungkan dua konteks tersebut dengan jelas: **AS-IS awal** adalah pelaporan manual melalui WhatsApp, sedangkan **baseline sistem** adalah JAT yang telah memiliki fungsi dasar dan perlu disempurnakan. Prototype baru pada folder ini tidak boleh mengklaim sebagai replika codebase produksi.

## 3. Product Goal

1. Menyediakan alur digital terstruktur untuk mencatat dan meninjau aktivitas lamaran Student.
2. Memeriksa kesesuaian data yang dimasukkan Student dengan bukti yang tersedia dan aturan bisnis.
3. Menyediakan status validasi yang dapat dipahami dan ditindaklanjuti.
4. Mendukung Admin/Talent Support dalam pemeriksaan pengajuan dan monitoring progres peserta.
5. Menyediakan landasan yang dapat diuji untuk mengintegrasikan Hybrid IDP dan HITL.

## 4. Di Luar Cakupan

- Menciptakan atau melatih model AI/IDP baru dari nol.
- Menjamin status lowongan masih aktif tanpa sumber data yang dapat diverifikasi.
- Mengembangkan ulang seluruh LMS Dibimbing.id.
- Menghubungkan database, login, endpoint atau API produksi tanpa spesifikasi dan otorisasi yang tersedia.
- Mengklaim hasil akurasi, UAT, performance testing, fine-tuning, atau release sebelum benar-benar dilakukan.

## 5. Aktor dan Kebutuhan

### Student
Melihat batch/phase yang dapat diakses, memahami target dan progres, mengisi data lamaran, mengunggah bukti, melihat status validasi, dan membaca feedback yang tersedia.

### Admin/Talent Support
Mengelola batch dan peserta, mengatur fase/periode/target, meninjau Applied Jobs, mencari dan memfilter data, memeriksa pengajuan yang menunggu konfirmasi, melakukan tindak lanjut sesuai kewenangan, serta memantau progres.

### Sistem Hybrid IDP
Menerima bukti, menyiapkan/mengekstrak informasi bila komponen tersebut tersedia, membandingkan informasi dengan aturan bisnis, menghasilkan rekomendasi/status validasi sesuai aturan, dan mengarahkan ketidakpastian ke human review.

## 6. Functional Requirements

Semua requirement berikut adalah target kebutuhan. Penerapan pada prototype boleh menggunakan mock data; mock result wajib diberi label dan tidak boleh dinyatakan sebagai hasil validasi AI nyata.

| Requirement ID | Kebutuhan | Acceptance Criteria (ringkas) | Prioritas |
|---|---|---|---|
| JAT-BL-01 | Daftar dan pencarian batch | Given data batch tersedia, when Admin membuka/mencari daftar, then batch yang cocok tampil dengan periode, jumlah peserta, dan aksi. | High |
| JAT-BL-02 | Membuat/mengubah batch | Given field wajib valid, when Admin menyimpan, then batch tersimpan; nama kosong/duplikat ditolak. | High |
| JAT-BL-03 | Konfigurasi phase, date range, job level, target | Given Admin mengatur fase/periode/target, when disimpan, then nilai tampil sesuai input; start date tidak melewati end date. | High |
| JAT-BL-04 | Pengelolaan peserta | Given Student dan batch tersedia, when Admin menambah/menghapus dengan konfirmasi, then relasi peserta diperbarui. | High |
| JAT-BL-05 | Student melihat batch, periode, target, progres | Given Student berhak mengakses batch, when membuka detail, then informasi fase/periode/progres konsisten dengan konfigurasi. | High |
| JAT-BL-06 | Pengajuan aktivitas lamaran | Given Student berada dalam periode yang diperbolehkan, when mengirim field wajib dan bukti, then sistem memvalidasi serta memproses pengajuan. | High |
| JAT-BL-07 | Validasi format berkas | Given Student mengunggah bukti, when format selain JPG/JPEG/PNG digunakan, then sistem menolak dan menunjukkan pesan. | High |
| JAT-BL-08 | Pemrosesan gambar dan ekstraksi | Given bukti valid diterima, when pipeline IDP dijalankan, then informasi yang didukung bukti diekstraksi; informasi yang tidak tersedia tetap unknown/null. | High |
| JAT-BL-09 | Membandingkan input dengan bukti dan rules | Given data formulir dan hasil ekstraksi tersedia, when validasi berjalan, then required fields diperiksa; bukti tidak memadai tidak auto-approved. | High |
| JAT-BL-10 | Menampilkan status dan feedback | Given pengajuan diproses, when Student membuka daftar/detail, then status validasi dan feedback yang tersedia tampil terpisah dari status rekrutmen. | High |
| JAT-BL-11 | Human review untuk konfirmasi | Given pengajuan Waiting Confirmation, when Admin membuka Request, then dapat meninjau data/bukti dan menindaklanjuti sesuai hak akses. | High |
| JAT-BL-12 | Tabel Applied Jobs dan filter | Given data lamaran tersedia, when Admin mencari/memfilter, then data yang cocok tampil dan empty state diberikan bila hasil kosong. | High |
| JAT-BL-13 | Hitung ulang target/progres | Given konfigurasi atau data yang memengaruhi progres berubah, when recalculate dilakukan oleh peran berwenang, then progres memakai data terbaru yang konsisten. | High |
| JAT-BL-14 | Sinkronisasi date range | Given Admin mengubah periode dan mengonfirmasi, when data Student dibuka ulang, then tanggal konsisten serta duplikasi range tidak terjadi. | High |
| JAT-BL-15 | Monitoring progres | Given data batch, target, dan submission tersedia, when Admin membuka ringkasan, then progres ditampilkan dari data tersimpan. | Medium |
| JAT-BL-16 | Konfirmasi tindakan destruktif | Given Admin akan menghapus batch/peserta, when aksi dimulai, then ada konfirmasi dan pembatalan tidak menghapus data. | Medium |
| JAT-BL-17 | Hak akses berdasarkan peran | Given pengguna menjalankan fitur, when fungsi tidak berwenang dicoba, then akses ditolak oleh aplikasi/server. | High |
| JAT-BL-18 | Pengujian dan traceability | Given acceptance criteria tersedia, when QA menguji positif/negatif/edge/integrasi/regresi, then hasil aktual dan bukti dicatat akurat. | High |

## 7. Target User Flow

### Student
LMS shell (prototype) → Talent Support → Job Application Tracking → Daftar Batch → Detail Batch/Phase → Applied Jobs → Add Application → Validasi input/file/date → simulasi/layanan pemrosesan → status dan detail.

### Admin/Talent Support
LMS shell (prototype) → JAT Admin → Daftar Batch → Create/Edit/Detail → peserta dan progres → Applied Jobs/filter → Request queue → detail bukti dan hasil pemeriksaan → konfirmasi/penolakan.

## 8. Expected Validation States

- **Approved:** bukti memadai dan kesesuaian wajib memenuhi aturan keputusan.
- **Rejected:** ditemukan ketidaksesuaian jelas atau pelanggaran aturan menurut business rules.
- **Waiting Confirmation:** informasi tidak memadai, ambigu, tidak terbaca, atau keputusan belum dapat dibuat dengan keyakinan memadai.

Kriteria final kapan harus Rejected dibanding Waiting Confirmation harus dikonfirmasi Talent Support. Jangan mengasumsikan satu model LLM boleh menentukan status tanpa aturan deterministic.

## 9. Product Success Criteria

Keberhasilan perlu dinilai melalui: kelulusan acceptance criteria; kelengkapan alur Student/Admin; konsistensi status dan progres; kemampuan menangani mismatch/cropped/low-quality/unrelated evidence; hasil evaluasi validation menggunakan ground truth; feedback UAT; dan hasil uji performa yang benar-benar dijalankan. Nilai target numerik belum ditetapkan dan tidak boleh diada-adakan.

## 10. Source Artifacts

- PRD JAT Admin (PDF) — pengelolaan batch, peserta, Applied Jobs, Request.
- Desain UI JAT Student (PDF) — batch, detail, formulir, status dan evidence.
- Desain UI JAT Admin (PDF) — batch, peserta, progress, Applied Jobs, Request.
- Ticket Update JAT (PDF) — perbaikan AI validation, date range, filter, progres, penghapusan dan permission.
- Testing AI Detection JAT Student/Admin (PDF) — test case dan hasil aktual.

Catatan: dokumen source artifact tersedia di percakapan awal dan gambar terpilih disertakan pada `design-reference/`.
