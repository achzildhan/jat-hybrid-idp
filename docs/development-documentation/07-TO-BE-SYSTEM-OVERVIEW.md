# Gambaran Sistem TO-BE (TO-BE System Overview) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-G-TOBE-07
- **Versi:** 1.0.0
- **Status:** Complete / Target Business Process Architecture
- **Klasifikasi Bukti:** Gabungan `[Documented Design/Req]`, `[Verified in Code]`, dan `[Proposed / Unresolved]`
- **Penanggung Jawab:** Senior Product Manager & Business Process Architect

---

## 1. Tujuan & Ruang Lingkup Sistem TO-BE

Sistem **Job Application Tracking (JAT) Hybrid IDP** dirancang untuk mentransformasi proses pemantauan aktivitas karir siswa dari pelaporan manual yang membebani tim pendamping menjadi sistem terotomatisasi cerdas dengan kendali mutu manusia (*Human-in-the-Loop*).

### 1.1 Batasan Fungsional Sistem (*Functional Boundaries*)
- **Fokus Utama:** Pelaporan aktivitas lamaran kerja siswa bootcamp, verifikasi otomatis bukti berkas visual menggunakan IDP, peninjauan terpusat kasus marjinal oleh Talent Support, serta agregasi capaian target kelulusan batch.
- **Pengecualian Eksplisit (*Out of Scope*):** Sistem ini **bukan** portal lowongan kerja eksternal (*job board*), bukan sistem pelacak pelamar perusahaan (*Applicant Tracking System - ATS internal HRD*), dan tidak mengotomatisasi pengiriman lamaran ke situs pihak ketiga.

---

## 2. Aktor & Tanggung Jawab Sistem

| Aktor Sistem | Peran Utama | Tanggung Jawab & Batasan Hak Akses |
|---|---|---|
| **Student (Mahasiswa/Alumni)** | Pengguna Utama Pelapor | Melihat jadwal batch terdaftar, memantau batas jendela periode aktif, mengisi formulir lamaran 8 field, mengunggah bukti gambar (JPG/JPEG/PNG <= 5MB), melihat status validasi (`Approved`, `Waiting Confirmation`, `Rejected`) beserta alasan penolakan, serta memperbarui tahap rekrutmen perusahaan secara mandiri. Siswa diblokir dari aksi administratif. |
| **Admin (Talent Support)** | Verifikator & Pembimbing | Mengonfigurasi jadwal batch, mengelola peserta, memantau kemajuan kohort makro, meninjau pengajuan berkas berstatus `Waiting Confirmation` di antrean HITL, memeriksa perbandingan bukti visual vs atribut IDP, menyetujui pengajuan atau menolak dengan alasan wajib (minimal 10 karakter), serta memicu kalkulasi ulang progres batch. |
| **Super Admin** | Pengawas Kebijakan Tertinggi | Memiliki wewenang identik dengan Admin Talent Support dalam operasional JAT, ditambah wewenang administratif lintas program dan manajemen hak akses global. |
| **Sistem Hybrid IDP (Automated Engine)** | Pemroses Dokumen Otomatis | Memvalidasi integritas biner gambar (*magic bytes*), mengekstrak 7 atribut terstruktur, memvalidasi aturan deterministik, menghitung kemiripan leksikal, mengevaluasi konteks semantik secara asistif, dan menentukan status awal pengajuan tanpa pernah membatalkan aturan deterministik (*Deterministic Non-Override*). |

---

## 3. Diagram Alur Proses Bisnis TO-BE (BPMN-Style Process Flows)

> [!NOTE]
> Seluruh diagram dimodelkan menggunakan notasi alur proses terstandar (*BPMN-style flowcharts*) dengan sintaks Mermaid. Tidak ada diagram atau terminologi UML yang digunakan.

### 3.1 Diagram Alur 1: Konfigurasi Batch oleh Admin (`PROC-01`)
*Menggambarkan alur pembuatan dan pengaktifan jadwal batch baru beserta kuota kelulusan.*

```mermaid
flowchart TD
  Start([Mulai: Admin Buka Menu Batch]) --> InputData[/Input Nama Batch & Pilih Bootcamp Terafiliasi/]
  InputData --> ValName{Nama Batch Terisi & Unik? BR-01, BR-02}
  ValName -- Tidak --> ShowErrName[Tampilkan Pesan Error Validasi Nama] --> InputData
  ValName -- Ya --> ConfigPhase[/Konfigurasi Phase 1 Wajib & Phase 2 Opsional/]
  ConfigPhase --> SetRanges[/Tentukan Rentang Tanggal & Kuota Target Job Level/]
  SetRanges --> ValDates{Start Date <= End Date & Non-Overlap? BR-04}
  ValDates -- Tidak --> ShowErrDate[Tampilkan Error Tumpang Tindih Tanggal] --> SetRanges
  ValDates -- Ya --> ClickSave[Klik Simpan Batch]
  ClickSave --> OpenModal[Buka Modal Konfirmasi & Tampilkan Impact Preview BR-08]
  OpenModal --> ConfirmAction{Admin Konfirmasi 'Simpan & Aktifkan'?}
  ConfirmAction -- Batal --> ReturnForm[Kembali ke Form Tanpa Menyimpan]
  ConfirmAction -- Ya --> SaveDB[(Simpan Batch & Inisialisasi Kuota)]
  SaveDB --> End([Selesai: Batch Aktif Terdaftar])
```

---

### 3.2 Diagram Alur 2: Pelaporan Lamaran Kerja oleh Student (`PROC-02`)
*Menggambarkan alur pemeriksaan periode dan pengisian formulir pelaporan oleh siswa.*

```mermaid
flowchart TD
  Start([Mulai: Siswa Buka Batch Detail]) --> CheckWindow{Apakah Ada Jendela Tanggal Berstatus 'Active'? BR-06, BR-07}
  CheckWindow -- Tidak (Upcoming / Expired) --> LockBtn[Kunci Tombol '+ Tambah Bukti Lamaran'] --> EndInact([Selesai: Siswa Menunggu Jadwal])
  CheckWindow -- Ya (Active) --> UnlockBtn[Aktifkan Tombol '+ Tambah Bukti Lamaran']
  UnlockBtn --> ClickAdd[Siswa Klik '+ Tambah Bukti Lamaran']
  ClickAdd --> OpenDrawer[Buka Laci Formulir 580px]
  OpenDrawer --> FillForm[/Isi 8 Atribut Lowongan & Pilih Berkas Gambar/]
  FillForm --> CheckFormat{Format JPG/JPEG/PNG & Ukuran <= 5MB? BR-11, BR-12}
  CheckFormat -- Tidak --> ShowErrFile[Tolak Berkas & Tampilkan Error Format] --> FillForm
  CheckFormat -- Ya --> CheckDate{Tanggal Lamaran <= Hari Ini? BR-14}
  CheckDate -- Tidak (Masa Depan) --> ShowErrFuture[Tolak Tanggal Masa Depan] --> FillForm
  CheckDate -- Ya --> CheckRange{Tanggal di Dalam Rentang Aktif? BR-45}
  CheckRange -- Tidak --> WarnAutoReject[Beri Peringatan: Status Otomatis Rejected DSN-TBD-04] --> SubmitApp
  CheckRange -- Ya --> SubmitApp[Siswa Klik 'Submit Bukti Lamaran']
  SubmitApp --> DispatchIDP[Kirim Berkas ke Pipeline Ekstraksi IDP]
  DispatchIDP --> End([Selesai: Pengajuan Masuk Antrean Proses])
```

---

### 3.3 Diagram Alur 3: Pipeline Ekstraksi & Validasi Hybrid IDP (`PROC-03`)
*Menggambarkan mekanisme dua jalur (deterministik + semantik) dan kebijakan keputusan.*

```mermaid
flowchart TD
  Start([Mulai: Penerimaan Berkas Bukti]) --> MagicByte{Verifikasi Biner Magic Bytes Gambar? BR-34}
  MagicByte -- Gagal (PDF/Cacat) --> ForceReject[Tetapkan Status: Rejected - Berkas Tidak Sah BR-19] --> EndResult
  MagicByte -- Lolos (PNG/JPEG Asli) --> TextExtract[OCR Engine Ekstraksi Teks Mentah]
  TextExtract --> Normalize[Normalisasi Teks: Bersihkan Null Bytes & Deteksi Tutup BR-15, BR-41]
  Normalize --> StructExtract[Ekstraksi 7 Atribut Terstruktur Standar BR-39]
  StructExtract --> DetermCheck{Evaluasi Aturan Deterministik: Leksikal > 70% & Level Match? BR-17, BR-19}
  DetermCheck -- Gagal --> NonOverride[Terapkan Deterministic Non-Override Safeguard BR-26] --> ForceReject
  DetermCheck -- Lolos --> SemanticEval[Komparator Semantik Asistif Evaluasi Relevansi Konteks]
  SemanticEval --> CheckFailure{Apakah Provider AI Timeout / Error? BR-21}
  CheckFailure -- Ya --> RouteWaitAI[Alihkan Otomatis ke: Waiting Confirmation BR-21] --> RouteHITL
  CheckFailure -- Tidak --> TierPolicy{Tingkat Kecocokan Akhir BR-38}
  TierPolicy -- Skor >= 90% & Bukti Sangat Jelas --> AutoApprove[Tetapkan Status: Approved] --> EndResult
  TierPolicy -- Skor 60% - 89% / Bukti Buram / Potong --> RouteWaitScore[Tetapkan Status: Waiting Confirmation BR-20] --> RouteHITL
  TierPolicy -- Skor < 60% / Bukti Tidak Relevan --> AutoReject[Tetapkan Status: Rejected] --> EndResult
  RouteHITL[Kirim Berkas ke Antrean Verifikasi Admin BR-32] --> EndResult
  EndResult([Selesai: Status Validasi Tersimpan])
```

---

### 3.4 Diagram Alur 4: Peninjauan Human-in-the-Loop oleh Admin (`PROC-04`)
*Menggambarkan alur verifikasi berkas Waiting Confirmation oleh Talent Support.*

```mermaid
flowchart TD
  Start([Mulai: Admin Buka Antrean Request]) --> ViewQueue[Tampilkan Daftar Berkas Berstatus Waiting Confirmation BR-32]
  ViewQueue --> SelectRow[Admin Pilih Salah Satu Pengajuan & Klik 'Konfirmasi']
  SelectRow --> OpenInspector[Buka HITL Evidence Inspector Modal Berdampingan b490bfff]
  OpenInspector --> InspectEvidence[Bandingkan Form Siswa vs Gambar Asli vs 7 Atribut IDP BR-39]
  InspectEvidence --> DecideAction{Apakah Bukti Lamaran Valid?}
  DecideAction -- Tidak (Tidak Valid) --> InputReason[/Admin Wajib Input Alasan Penolakan Min. 10 Karakter BR-24/]
  InputReason --> ClickReject[Klik 'Tolak Request'] --> SaveReject[(Simpan Status: Rejected & Catat Riwayat Audit BR-25)]
  DecideAction -- Ya (Valid) --> ClickApprove[Klik 'Konfirmasi JAT']
  ClickApprove --> SecConfirm[Buka Dialog Verifikasi Sekunder BR-29]
  SecConfirm --> ConfirmApprove{Admin Konfirmasi 'Ya, Setujui'?}
  ConfirmApprove -- Batal --> InspectEvidence
  ConfirmApprove -- Ya --> SaveApprove[(Simpan Status: Approved & Tambah Capaian Siswa)]
  SaveReject --> RemoveQueue[Hapus Item dari Antrean Waiting Confirmation BR-32]
  SaveApprove --> RemoveQueue
  RemoveQueue --> NotifySync[Picukan Event: jat-repository-updated]
  NotifySync --> End([Selesai: Status Siswa & Progres Kohort Terbarui])
```

---

## 4. Matriks Masukan & Keluaran Sistem (*Input / Output Matrix*)

| Alur Proses | Data Masukan (*Inputs*) | Validasi & Pengolahan | Data Keluaran (*Outputs*) |
|---|---|---|---|
| **Pembuatan Batch** | Nama batch, ID cohort terhubung, tanggal fase, kuota per level pekerjaan. | Cek nama unik, validasi rentang tanggal, verifikasi non-negatif. | Entitas `JatBatch` aktif dengan kuota target terinisialisasi. |
| **Pelaporan Lamaran** | Role, Perusahaan, Lokasi, Posisi, Level, Sistem Kerja, Pengalaman, URL Lowongan, Berkas Bukti PNG/JPEG. | Validasi 8 field wajib, cek ukuran <= 5MB, cek magic bytes biner, validasi tanggal lamaran. | Entitas `StudentApplicationRecord` baru berstatus `Waiting Confirmation`. |
| **Ekstraksi IDP** | Berkas biner bukti lamaran. | Sanitasi karakter kontrol, parsing OCR, pengelompokan token teks lowongan. | Objek `ExtractedJobAttributes` dengan 7 field dan skor keyakinan. |
| **Validasi IDP** | Data input form + Atribut hasil ekstraksi IDP. | Perhitungan leksikal Sørensen-Dice, aturan non-override, evaluasi semantik asistif. | Rekomendasi status validasi (`Approved` / `Waiting Confirmation` / `Rejected`) beserta temuan atribut. |
| **Review HITL** | Keputusan Admin (`Iya`/`Tidak`), alasan penolakan (jika ditolak). | Validasi panjang alasan penolakan, verifikasi sekunder persetujuan. | Pembaruan status validasi final, penambahan capaian siswa, dan pencatatan riwayat audit peninjau. |

---

## 5. Kebutuhan Non-Fungsional & Batasan Sistem

1. **Integritas Aturan Bisnis (*Business Rules Integrity*):** Aturan deterministik tanggal dan format berkas berderajat lebih tinggi daripada rekomendasi kecerdasan buatan (*deterministic precedence*).
2. **Kinerja & Kecepatan Respon (*Performance & Latency*):** Waktu respon ekstraksi dan validasi pada lingkungan produksi ditargetkan `< 3.000 ms` per berkas bukti.
3. **Keamanan & Privasi Data (*Security & Privacy*):** Berkas tangkapan layar siswa tidak boleh dikirimkan ke layanan publik tanpa perjanjian pemrosesan data (DPIA). Tidak ada kredensial API yang disematkan ke dalam repositori kode.
4. **Kejelasan Antarmuka (*Explainability & Transparency*):** Setiap hasil simulasi AI wajib mencantumkan label informasi eksplisit dan siswa berhak menerima alasan penolakan yang jelas.
