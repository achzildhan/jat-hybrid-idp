# Business Rules — JAT Hybrid IDP

Status: baseline rules untuk prototype dan spesifikasi awal. Aturan yang belum mendapat keputusan stakeholder ditandai **Needs confirmation**.

## A. Batch and participant

- **BR-01 — Nama batch wajib:** batch tidak dapat dibuat tanpa nama/program name.
- **BR-02 — Nama batch unik:** nama batch yang duplikat ditolak.
- **BR-03 — Validasi rentang tanggal:** start date harus sama dengan atau lebih awal daripada end date.
- **BR-04 — Phase 2 opsional:** batch dapat memiliki Phase 1 saja atau Phase 1 dan Phase 2.
- **BR-05 — Banyak range/target:** satu phase dapat menampung beberapa date range serta job-level targets jika dikonfigurasi.
- **BR-06 — Sinkronisasi tanggal:** Student melihat periode yang sama dengan konfigurasi Admin; sumber tanggal tidak boleh berbeda secara diam-diam.
- **BR-07 — Akses periode:** tombol/akses detail phase aktif dalam rentang yang berlaku; di luar rentang, tindakan submit tidak boleh diterima. Edge behavior tepat di start/end date perlu konsisten.
- **BR-08 — Dampak edit periode:** perubahan yang memengaruhi peserta/progres meminta konfirmasi dan menghitung ulang data terkait sesuai aturan yang disetujui.
- **BR-09 — Penghapusan:** batch/peserta dihapus hanya setelah konfirmasi. Jika alur mengharuskan konfirmasi nama batch, nama harus cocok dengan batch yang akan dihapus.

## B. Student submission

- **BR-10 — Field wajib:** seluruh field yang ditandai wajib pada PRD/formulir harus lengkap sebelum submit.
- **BR-11 — Format bukti:** hanya JPG, JPEG, dan PNG yang diterima sebagai bukti screenshot pada requirement baseline.
- **BR-12 — Validasi format dilakukan di server:** frontend boleh memberi validasi awal, tetapi backend harus memeriksa ulang tipe berkas ketika backend aktif.
- **BR-13 — Date Applied tidak boleh di masa depan.**
- **BR-14 — Date Applied harus masuk date range yang berlaku:** di luar periode ditolak sesuai aturan status yang dikonfirmasi; tiket implementasi mencatat kebutuhan auto-reject untuk tanggal di luar rentang.
- **BR-15 — Upload bukan approval:** diterimanya berkas hanya berarti berkas tersedia untuk pemrosesan, bukan bahwa pengajuan valid.

## C. Hybrid IDP validation

- **BR-16 — Bukti cukup:** bukti harus menampilkan informasi pekerjaan yang memadai untuk memeriksa field wajib sesuai kriteria yang disepakati.
- **BR-17 — Tidak auto-approve bukti tidak memadai:** gambar terpotong, tidak relevan, tidak terbaca, atau tidak cukup konteks tidak boleh disetujui hanya karena form lengkap.
- **BR-18 — Ekstraksi tidak sama dengan kebenaran:** OCR/LLM output harus divalidasi. Field tidak ditemukan/ambigu tidak boleh diisi berdasarkan tebakan.
- **BR-19 — Cek mismatch:** perbedaan pada atribut wajib seperti role/title atau company tidak boleh diabaikan. Pemetaan exact/fuzzy match dan tingkat keparahan perlu didokumentasikan.
- **BR-20 — Job level/pengalaman:** apabila keduanya termasuk pemeriksaan wajib, ketidaksesuaian level dan required experience harus ditandai untuk keputusan sesuai policy.
- **BR-21 — Status lowongan:** sistem tidak boleh mengklaim lowongan masih aktif/ditutup tanpa bukti tepercaya atau sumber data yang disetujui. Screenshot lama sendiri belum tentu membuktikan status saat ini.
- **BR-22 — Tiga validation status:** Approved, Rejected, Waiting Confirmation.
- **BR-23 — Ambiguitas ke review:** jika sistem tidak cukup bukti untuk keputusan, status Waiting Confirmation digunakan sesuai decision policy.
- **BR-24 — Penolakan memiliki alasan:** alasan penolakan wajib diisi bila disyaratkan workflow Admin.
- **BR-25 — HITL tidak menghapus jejak:** tindakan manusia, status setelah tindakan, dan alasan yang relevan harus dapat ditelusuri sesuai kebutuhan audit.
- **BR-26 — Peran LLM:** LLM membantu interpretasi semantik tetapi tidak dapat menimpa deterministic rules pada file, date, authorization, atau integritas data.
- **BR-27 — Prompt/model version:** untuk evaluasi yang dapat diulang, rekam model/provider dan konfigurasi/prompt version jika sistem integrasi menyediakannya. Jangan mengarang versi jika tidak diketahui.

## D. Progress and recruitment status

- **BR-28 — Validation status != recruitment progress:** validation status tidak boleh digunakan sebagai pengganti status proses rekrutmen (contoh: Applied, Interview, Rejected by employer).
- **BR-29 — Perhitungan progres memakai data yang konsisten:** perubahan target, range, participant atau submission terkait harus memicu perhitungan ulang yang sesuai.
- **BR-30 — Recalculate permission:** fungsi recalculate tampil dan dijalankan hanya oleh peran yang diizinkan (konfirmasi role aktual sebelum implementasi produksi).
- **BR-31 — Filter harus konsisten:** filter phase, date range dan status mengembalikan data sesuai kriteria; data kosong menampilkan empty state.
- **BR-32 — Request queue:** daftar Request hanya menampilkan Waiting Confirmation bila mengikuti aturan ticketed UI JAT; setelah status tidak lagi menunggu, item tidak muncul lagi di queue itu.

## E. Security, data, and prototype

- **BR-33 — Role permissions:** Student hanya mengakses submission miliknya dan Admin melakukan tindakan sesuai authorization yang diberikan.
- **BR-34 — File/content treated as untrusted:** jangan mengeksekusi file upload atau mempercayai output OCR/LLM tanpa validasi.
- **BR-35 — Synthetic data for prototype:** jangan masukkan data personal nyata ke mock fixtures.
- **BR-36 — Secrets:** credentials/API keys tidak boleh diletakkan hardcoded di source control.
- **BR-37 — Mock result labeling:** hasil AI pada frontend prototype harus terlihat sebagai simulasi; tidak boleh ditampilkan sebagai AI production result.

## F. Lainnya

- **BR-38 — Kriteria Status Validasi & Ambang Batas Kesesuaian Keseluruhan:** Status validasi ditentukan berdasarkan hierarki tahapan (Stage A s/d D) dan skor kepatuhan keseluruhan pengajuan (*overall compliance score*, 0–100%):
  - **`Approved`:** Seluruh aturan deterministik Stage A terpenuhi, gambar bukti terbaca jelas (*readable*), tidak ada diskrepansi atribut inti (perusahaan dan role), dan skor kesesuaian keseluruhan minimal **90%** (>= 90%).
  - **`Waiting Confirmation`:** Kualitas gambar bukti buram (*blurry*), bukti tidak lengkap (*incomplete* / atribut inti tidak tercantum pada tangkapan layar per BR-18), terdapat kontradiksi Job Level vs Pengalaman (BR-19), atau skor kesesuaian keseluruhan berada di antara **60% s/d 89%** (memerlukan peninjauan manual oleh Admin/Talent Support).
  - **`Rejected`:** Pelanggaran aturan deterministik pasti (format biner/ukuran/magic bytes BR-11/12/34, tanggal masa depan BR-13, tanggal di luar rentang aktif batch BR-14/BR-45, lowongan tutup BR-41), gambar bukti terpotong (*cropped*) atau sama sekali tidak relevan (*irrelevant*), ketidaksesuaian eksplisit pada nama perusahaan atau role jabatan (*Mismatch*), atau skor kesesuaian keseluruhan sangat rendah di bawah **60%** (< 60%).
- **BR-39 — Atribut Minimum Bukti Lamaran:** Atribut yang wajib ada di lamaran sehingga bisa dikategorikan sebagai 'Approved' adalah ketika 7 informasi dari bukti lamaran (Date Applied, Role, Company, Location, Position, Job Level, dan Work System) sesuai dengan data yang diinput langsung oleh user.
- **BR-40 — Exact Fuzzy Match Policy & Ambang Batas Leksikal Per-Atribut:** Nilai kemiripan leksikal per-atribut (*lexical similarity score*, 0.0 s/d 1.0) dihitung secara matematis menggunakan algoritma Sørensen–Dice. Ambang batas pencocokan fuzzy ditetapkan secara ketat **harus > 70%** (`similarity > 0.70`). Nilai kemiripan <= 0.70 diklasifikasikan sebagai `Mismatch`. Atribut yang tidak tercantum pada gambar bukti tetap bernilai `null` / `Unverified` (BR-18) dan tidak boleh diberi skor buatan 0.0 yang disalahartikan sebagai mismatch. Ambang batas leksikal per-atribut ini terpisah secara tegas dari skor kepatuhan keseluruhan aplikasi (BR-38).
- **BR-41 — Deteksi Status Lowongan Aktif:** Deteksi status lowongan aktif dapat dideteksi melalui bukti lamaran jika tidak ada kalimat "Closed", "Lowongan Ditutup", "Recruiter Don't Accept Any Applications Yet", "This Job is Closed", atau kalimat sejenisnya. Selain itu, jika di lamaran tidak tertera ungkapan, kata, atau frasa yang mengaitkan bahwa tanggal lowongan ini telah melewati deadline.
- **BR-42 — Validitas Submission yang Dibuat Setelah Ubah Date Range:** Status validitas tetap mengikuti aturan yang telah dibuat oleh Admin sejak Student mengirimkan lamarannya, sebagai contoh ketika dataRange yang sah pada Batch & Phase di Student A adalah 3 Oktober hingga 4 Oktober 2026, dan Student menginput data tanggal lamaran = 4 Oktober 2026 dan di dalam bukti lamaran tercantum data yang sama. Namun ketika Admin mengubah dateRange menjadi 5 Oktober hingga 6 Oktober 2026, sistem harus mengidentifikasi bahwa bukti lamaran tersebut adalah valid.
- **BR-43 — Role yang Berwenang CRUD Data Batch, Peserta dalam Batch, dan Recalculate:** Admin (dalam sistem, namun role ini digunakan oleh tim Talent Support)
- **BR-44 — Retention/Access Policy:** Model Pipeline dalam IDP atau LLM yang digunakan dalam konteks ini diperbolehkan untuk mengakses informasi dari gambar bukti, hasil OCR, dan hasil validasi. Role Admin berhak mendapatkan akses terhadap semua informasi yang dituangkan dalam database seperti hasil ekstraksi bukti lamaran sesuai atribut/variabel data yang telah ditetapkan, status hasil validasi, dan catatan hasil human review untuk status Waiting for Confirmation. Student berhak mengakses informasi hasil validasi AI dan catatan human review oleh Admin/Talent Support. 
- **BR-45 — Status Pengajuan ketika dateApplied di luar Date Rage:** Status ketika adalah pengajuan yang dateApplied nya di luar Date Range wajib 'Rejected'