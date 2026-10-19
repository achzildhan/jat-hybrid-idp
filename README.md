# JAT Hybrid IDP - Vibedesign & Vibecoding Starter Kit

Paket ini disiapkan untuk memulai project baru dari folder kosong, dengan Google Stitch untuk vibedesign dan Antigravity untuk vibecoding. Paket tidak berisi aplikasi jadi, backend produksi, API credentials, atau integrasi AI aktif.

## Urutan pemakaian

1. Baca `docs/PRD.md`, `docs/Business-Rules.md`, dan `docs/System-Requirements.md`.
2. Buka `prompts/stitch/STITCH_WORKFLOW.md`, lalu mulai desain di [Google Stitch](https://stitch.withgoogle.com/).
3. Unggah beberapa gambar di `design-reference/` sebagai referensi visual. Jangan mengunggah semua gambar sekaligus jika konteks terlalu padat; mulai dari Student batch list, Student detail/form, Admin batch, dan Request detail.
4. Jalankan prompt di `prompts/stitch/01-project-brief.md`, kemudian prompt layar dan iterasi berikutnya secara berurutan.
5. Setelah desain disetujui, minta Stitch menghasilkan/mengekspor `DESIGN.md`, layar terkait, dan bila tersedia ekspor frontend ke Antigravity. Rujuk instruksi resmi Stitch: desain dari teks/gambar, prototype antar-layar, `DESIGN.md`, dan ekspor ke Antigravity.
6. Buka folder project ini sebagai workspace baru di Antigravity. Jalankan prompt yang ada di `prompts/antigravity/` satu per satu. Jangan langsung minta membuat seluruh sistem.
7. Mulai dengan frontend prototype dan mock data. Backend, database, OCR, dan LLM belum ditetapkan sebagai implementasi aktif di paket ini.
8. Sebelum menilai hasil sebagai selesai, jalankan aplikasi dan tes alur Student serta Admin pada browser.

## Struktur folder

- `docs/`: PRD, business rules, backlog awal, dan kebutuhan sistem.
- `design-reference/`: cuplikan gambar dari PDF desain UI JAT Student/Admin yang sudah disediakan. Gambar adalah referensi visual, bukan implementasi dan bukan file Figma editable.
- `prompts/stitch/`: prompt dan prosedur untuk vibedesign di Stitch.
- `prompts/antigravity/`: prompt untuk mengimpor desain dan melakukan implementasi bertahap.
- `prompts/qa/`: prompt pengujian fitur dan Hybrid IDP.
- `planning/`: template keputusan teknologi dan traceability.
- `AGENTS.md`: aturan permanen untuk coding agent.

## Pilihan teknologi

Rekomendasi awal untuk **prototype frontend saja**: React + TypeScript + Vite + Tailwind CSS + React Router. Ini belum merupakan keputusan stack produksi. Jangan membangun layanan OCR/LLM atau backend sebelum kontrak data, kebutuhan integrasi, dan kebutuhan penyimpanan disepakati.

## Batasan penting

- Status validasi JAT: `Approved`, `Rejected`, `Waiting Confirmation`.
- Status validasi berbeda dari status progres rekrutmen.
- Bukti JPG/JPEG/PNG; validasi format dan tanggal harus ditegakkan juga di backend ketika backend dibangun.
- Bukti tidak lengkap, terpotong, tidak relevan, atau ambigu tidak boleh disetujui otomatis hanya karena formulir lengkap.
- LLM bukan sumber kebenaran tunggal dan tidak boleh menimpa aturan deterministik.
- Jangan klaim OCR, LLM, training/fine-tuning, evaluasi metrik, UAT, atau release sudah berjalan tanpa bukti.
- Jangan menambahkan atau menyebut nama route/API/database produksi yang belum dikonfirmasi.

## Referensi desain yang disertakan

Gambar di `design-reference/` diekstrak dari file desain UI JAT Student dan Admin yang diberikan sebelumnya. File ini dipotong untuk lebih mudah diunggah ke Stitch. Desain Figma asli tetap menjadi sumber visual prioritas jika tersedia.
