# Model & Algoritma Hybrid IDP (Model & Algorithms) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-I-IDP-09
- **Versi:** 1.0.0
- **Status:** Complete / Algorithmic Specification
- **Klasifikasi Bukti:** Gabungan `[Verified in Code]`, `[Verified by Test]`, dan `[Documented Design/Req]`
- **Penanggung Jawab:** AI Systems Engineer & Software Architect

---

## 1. Konsep & Filosofi Pendekatan Hybrid IDP

### 1.1 Mengapa Memilih Pendekatan Hibrida (Hybrid Approach)?
Dalam pemrosesan dokumen otomatis berbasis AI (*Intelligent Document Processing*), mengandalkan Large Language Model (LLM) atau OCR murni sebagai satu-satunya penentu keputusan (*single source of truth*) memiliki risiko kegagalan yang fatal bagi institusi pendidikan:
1. **Risiko Halusinasi AI (*Hallucination Risk*):** LLM dapat mengarang informasi yang tidak ada dalam gambar atau menyatakan bukti valid padahal formatnya salah.
2. **Ketiadaan Kepastian Deterministik:** Aturan hukum program (seperti batas waktu pelaporan, ukuran berkas maksimal, dan format gambar) adalah aturan pasti (*hard rules*) yang tidak boleh dinegosiasikan oleh probabilitas AI.
3. **Efisiensi Biaya & Latensi (*Cost & Latency Optimization*):** Mengirim setiap gambar mentah ke model multimodal yang mahal untuk memeriksa hal sepele (seperti apakah ukuran berkas 0 byte atau apakah tanggalnya di masa depan) merupakan pemborosan sumber daya komputasi.

### 1.2 Dua Jalur Validasi Terpisah dengan *Deterministic Non-Override Safeguard*
Sistem ini memisahkan secara ketat dua jalur evaluasi:
- **Jalur Deterministik (Pasti & Terukur):** Menangani verifikasi biner berkas (*magic bytes*), batasan tanggal kalender, aturan bisnis, dan perhitungan kemiripan string matematis (*Sørensen–Dice*).
- **Jalur Semantik (Asistif & Kontekstual):** Menilai makna kontekstual teks lowongan kerja menggunakan pemahaman bahasa alami (LLM).

$$\text{Final Status} = \begin{cases} 
\text{Rejected}, & \text{jika } \text{DeterministicCheck} = \text{FAILED} \\ 
\text{DecisionPolicy}(\text{Deterministic}, \text{Semantic}), & \text{jika } \text{DeterministicCheck} = \text{PASSED} 
\end{cases}$$

> [!IMPORTANT]
> **Aturan Emas `BR-26` (Deterministic Non-Override):** Apabila jalur deterministik menyatakan suatu berkas **GAGAL** (misal tanggal lamaran di masa depan, berkas biner bukan gambar, atau perusahaan tidak cocok), rekomendasi dari model LLM Semantik **DIBLOKIR SECARA PERMANEN** dan tidak dapat mengubah keputusan menjadi `Approved`.

---

## 2. Pembedahan 10 Tahapan Pipeline Ekstraksi & Validasi

### Tahap 1: Asupan Bukti & Validasi Berkas Awal (*File Intake*)
- **Fungsi & Berkas:** [`validateEvidenceImage`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/imagePreprocessor.ts) di `imagePreprocessor.ts`.
- **Masukan (*Input*):** Nama berkas, ukuran dalam byte, tipe MIME yang dilaporkan browser, dan array header byte biner.
- **Logika Algoritma:**
  1. Periksa ukuran berkas: jika `size <= 0` tolak dengan kode `EMPTY_FILE` (`BR-12`); jika `size > 5.242.880` (5MB) tolak dengan kode `FILE_TOO_LARGE` (`BR-12`).
  2. Periksa ekstensi: wajib `.jpg`, `.jpeg`, atau `.png` (`BR-11`).
  3. Verifikasi tanda tangan biner nyata (*Magic Bytes Verification* — `BR-34`):
     - **PNG:** 4 byte pertama harus bernilai tepat `[0x89, 0x50, 0x4E, 0x47]` (karakter ASCII `\x89PNG`).
     - **JPEG/JPG:** 3 byte pertama harus bernilai tepat `[0xFF, 0xD8, 0xFF]`.
     - *Jika file PDF dinamai `.png`, 4 byte pertamanya adalah `[0x25, 0x50, 0x44, 0x46]` (`%PDF`) dan akan langsung ditolak!*
- **Keluaran (*Output*):** Objek `ImageValidationResult` (`valid: boolean`, `detectedFormat`, `errorCode`).

---

### Tahap 2: Preprocessing Gambar & Deteksi Anomali Kualitas
- **Fungsi & Berkas:** [`preprocessImageForExtraction`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/imagePreprocessor.ts) di `imagePreprocessor.ts`.
- **Masukan (*Input*):** Objek berkas tervalidasi.
- **Logika Algoritma:** Menilai skor keyakinan kualitas gambar (*quality assessment score*). Pada purwarupa saat ini, kualitas diklasifikasikan menjadi: `HIGH`, `MARGINAL_BLURRY`, `MARGINAL_CROPPED`, `CORRUPT_BYTES`.
- **Keluaran (*Output*):** Metadata kualitas gambar yang menentukan apakah berkas layak diekstrak otomatis atau harus langsung dialihkan ke tinjauan manusia (`BR-20`).

---

### Tahap 3: Ekstraksi Teks Mentah (OCR Engine)
- **Fungsi & Berkas:** [`MockOcrEngineAdapter.extractBlocks`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/ocrEngine.ts) di `ocrEngine.ts`.
- **Status Implementasi:** **Mock Service Adapter Terisolasi (`DEC-05`, `DEC-11`)**.
- **Masukan (*Input*):** Berkas gambar bukti lamaran.
- **Logika Algoritma:** Mengembalikan blok-blok teks OCR (`OcrBlock[]`) yang mencakup teks, koordinat bounding box, level blok (paragraf/baris/kata), serta skor keyakinan deteksi teks (`confidence: 0.0 - 1.0`).
- **Keluaran (*Output*):** Objek `OcrEngineOutput` berlabel metadata `isMockAdapter: true` dan `providerDecisionStatus: 'BLOCKED_PENDING_DECISION'`.

---

### Tahap 4: Normalisasi Teks & Ekstraksi 7 Atribut Terstruktur
- **Fungsi & Berkas:** [`normalizeText`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/textNormalizer.ts) di `textNormalizer.ts` & [`extractStructuredJobAttributes`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/structuredAttributeExtractor.ts) di `structuredAttributeExtractor.ts`.
- **Masukan (*Input*):** Blok teks OCR hasil tahap 3.
- **Logika Algoritma:**
  1. **Sanitasi Kontrol Karakter (`BR-15`):** Menghapus karakter kontrol unprintable `\u0000` s/d `\u001F` (kecuali spasi dan newline standar).
  2. **Deteksi Lowongan Tutup (`BR-41`):** Mengeksekusi pencocokan regex frasa penutupan lowongan:
     ```regex
     /(lowongan (ini )?sudah ditutup|closed for applications|no longer accepting applications)/i
     ```
  3. **Ekstraksi 7 Atribut Standar (`BR-39`):** Mencari pola nilai untuk:
     - `role` (Posisi jabatan)
     - `company` (Nama perusahaan/entitas penyedia kerja)
     - `location` (Kota/negara lokasi kerja)
     - `position` (Tipe kontrak: Full-time, Internship, Contract, Freelance)
     - `jobLevel` (Seniority: Junior, Mid, Senior, Lead)
     - `workSystem` (Sistem kerja: Remote/WFH, Hybrid, Onsite)
     - `dateApplied` (Tanggal pengiriman lamaran yang tercetak pada bukti)
  4. **Strict Null Policy (`BR-18`):** Bidang yang tidak memiliki bukti teks pendukung diset tegas bernilai `null` dengan penanda `confidence: 0.0`.
- **Keluaran (*Output*):** Objek `ExtractedJobAttributes` lengkap dengan skor keyakinan dan *provenance text*.

---

### Tahap 5: Validasi Aturan Deterministik & Kemiripan Leksikal
- **Fungsi & Berkas:** [`validateDeterministicRules`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/deterministicRuleValidator.ts) di `deterministicRuleValidator.ts` & [`calculateSorensenDiceSimilarity`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/lexicalSimilarity.ts) di `lexicalSimilarity.ts`.
- **Masukan (*Input*):** Input formulir siswa vs Atribut hasil ekstraksi IDP.
- **Logika Algoritma (Rumus Matematika Sørensen–Dice):**
  Sebelum menghitung kemiripan nama perusahaan, string dinormalisasi dengan membuang sufiks/prefiks badan hukum Indonesia (`PT`, `CV`, `Tbk`, `Persero`, `Inc`, `Corp`) (`BR-40`).
  
  Koefisien Sørensen–Dice dihitung berbasis irisan bi-gram karakter dan token kata:

$$QS = \frac{2 |X \cap Y|}{|X| + |Y|}$$

  Di mana:
  - $|X|$ adalah jumlah bi-gram dalam string formulir siswa.
  - $|Y|$ adalah jumlah bi-gram dalam string bukti yang terekstrak.
  - $|X \cap Y|$ adalah jumlah bi-gram yang muncul di kedua string.

- **Aturan Ambang Batas Ketat (`BR-17`):**
  - Jika kemiripan Role atau Perusahaan `<= 0.70` (70%), status atribut dinyatakan `Mismatch`.
  - Jika `jobLevel` siswa adalah `Senior Level` atau `Lead` namun bukti menyebutkan pengalaman `< 1 tahun`, sistem mendeteksi diskrepansi level (`BR-19`).
- **Keluaran (*Output*):** Objek `DeterministicValidationResult` (`passed: boolean`, `findings: IdpAttributeFinding[]`, `violations: string[]`).

---

### Tahap 6: Komparasi Semantik Asistif (LLM Comparator)
- **Fungsi & Berkas:** [`MockSemanticComparatorAdapter.compareSemantics`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/semanticComparator.ts) di `semanticComparator.ts`.
- **Status Implementasi:** **Mock Service Adapter Terisolasi (`DEC-06`, `DEC-12`)**.
- **Masukan (*Input*):** Form input vs teks bukti dan temuan deterministik.
- **Logika Algoritma:** Mengevaluasi padanan konteks sinonim (misal: formulir tertulis *"Frontend Web Developer"*, pada tangkapan layar tertulis *"Software Engineer - React Frontend"*).
- **Keluaran (*Output*):** Objek `SemanticComparisonOutput` dengan skor semantik desimal `0.0 - 1.0` dan penjelasan penalaran asistif.

---

### Tahap 7: Kebijakan Keputusan Status Validasi (Decision Policy)
- **Fungsi & Berkas:** [`evaluateIdpDecisionPolicy`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpDecisionPolicy.ts) di `idpDecisionPolicy.ts`.
- **Masukan (*Input*):** Hasil validasi deterministik, hasil komparasi semantik, dan metadata kualitas bukti.
- **Tabel Aturan Keputusan Status Validasi (`BR-38`):**

| Kondisi Evaluasi Masukan | Rekomendasi Status Validasi | Alasan yang Dihasilkan Sistem |
|---|---|---|
| **Pelanggaran Aturan Deterministik** (Format salah, tanggal di luar rentang, tanggal masa depan, perusahaan mismatch) | **`Rejected`** | Alasan deterministik spesifik dicatat langsung (LLM tidak dapat membatalkan per `BR-26`). |
| **Gambar Terpotong / Sangat Tidak Relevan** (Meme/Kucing) | **`Rejected`** | *"Bukti gambar tidak relevan dengan dokumen lamaran kerja resmi."* |
| **Gambar Buram / Metadata Hilang Sebagian** | **`Waiting Confirmation`** | *"Kualitas gambar buram atau teks penting terpotong; dialihkan ke peninjauan manual (BR-20)."* |
| **Provider AI Error / Timeout** | **`Waiting Confirmation`** | *"Layanan ekstraksi otomatis tidak merespons; dialihkan ke peninjauan manual Talent Support (BR-21)."* |
| **Skor Kesesuaian Marjinal (0.60 s/d 0.89)** | **`Waiting Confirmation`** | *"Terdapat perbedaan diksi minor antara formulir dan bukti; memerlukan konfirmasi manusia (BR-38)."* |
| **Aturan Deterministik Lolos & Skor >= 0.90 & Bukti Sangat Jelas** | **`Approved`** | *"Seluruh 7 atribut lamaran terverifikasi cocok dengan bukti visual (BR-38)."* |

---

### Tahap 8: Peninjauan Human-in-the-Loop (HITL Review)
- **Fungsi & Berkas:** [`reviewApplicationRequest`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) di `batchRepository.ts`.
- **Alur Kerja:** Admin membuka antrean, memeriksa inspektor bukti visual berdampingan dengan temuan 7 atribut IDP, dan memutuskan persetujuan dengan verifikasi sekunder (`BR-29`) atau penolakan dengan alasan wajib minimal 10 karakter (`BR-24`).
- **Keluaran (*Output*):** Status beralih menjadi `Approved` atau `Rejected`, dan item keluar dari antrean `Waiting Confirmation` (`BR-32`).

---

### Tahap 9: Persistensi Data & Umpan Balik Siswa (*Persistence & Feedback*)
- Status baru disimpan ke dalam record pengajuan di repository.
- Laci rincian siswa diperbarui seketika dengan menampilkan badge status resmi, catatan peninjau, dan cap waktu verifikasi tanpa mencampuradukkannya dengan tahap rekrutmen perusahaan (`BR-28`).

---

### Tahap 10: Pemantauan Progres & Kalkulasi Kuota Batch
- Capaian siswa dihitung ulang secara objektif melalui [`calculateParticipantProgress`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/progressCalculator.ts).
- Hanya lamaran berstatus `Approved` yang menambah jumlah capaian kuota lamaran siswa.

---

## 3. Pseudocode Pipeline End-to-End Hybrid IDP

```typescript
function executeHybridIdpPipeline(
  formInput: StudentApplicationInput,
  evidenceFile: EvidenceFileMetadata
): IdpValidationResult {
  
  // TAHAP 1 & 2: Validasi Berkas & Magic Bytes Biner
  const fileCheck = validateEvidenceImage(evidenceFile);
  if (!fileCheck.valid) {
    return {
      status: 'Rejected',
      reason: `Format berkas tidak valid: ${fileCheck.errorCode}`,
      isMockAdapter: true
    };
  }

  // TAHAP 3: Ekstraksi Teks OCR
  let ocrOutput;
  try {
    ocrOutput = ocrEngineAdapter.extractBlocks(evidenceFile);
  } catch (error) {
    // TAHAP 7: Ketahanan terhadap Kegagalan AI (BR-21)
    return {
      status: 'Waiting Confirmation',
      reason: 'Layanan OCR tidak merespons. Dialihkan ke antrean peninjauan manusia.',
      isMockAdapter: true
    };
  }

  // TAHAP 4: Normalisasi Teks & Ekstraksi 7 Atribut
  const cleanText = normalizeText(ocrOutput.rawText);
  if (cleanText.isClosedVacancy) {
    return {
      status: 'Rejected',
      reason: 'Bukti terdeteksi sebagai lowongan kerja yang sudah ditutup (BR-41).',
      isMockAdapter: true
    };
  }
  const extractedAttributes = extractStructuredJobAttributes(ocrOutput.blocks);

  // TAHAP 5: Validasi Aturan Deterministik
  const deterministicResult = validateDeterministicRules(formInput, extractedAttributes);

  // PENGAMAN MUTLAK: Non-Override Safeguard (BR-26)
  if (!deterministicResult.passed) {
    return {
      status: 'Rejected',
      reason: deterministicResult.violations.join('; '),
      findings: deterministicResult.findings,
      isMockAdapter: true
    };
  }

  // TAHAP 6: Evaluasi Semantik Asistif
  const semanticResult = semanticComparatorAdapter.compareSemantics(
    formInput, 
    extractedAttributes
  );

  // TAHAP 7: Penerapan Kebijakan Keputusan Berjenjang (BR-38)
  const finalStatus = evaluateDecisionPolicy(
    deterministicResult, 
    semanticResult, 
    evidenceFile.quality
  );

  return {
    status: finalStatus.decision,
    reason: finalStatus.reason,
    findings: deterministicResult.findings,
    confidenceScore: semanticResult.similarityScore,
    isMockAdapter: true,
    providerDecisionStatus: 'BLOCKED_PENDING_DECISION'
  };
}
```
