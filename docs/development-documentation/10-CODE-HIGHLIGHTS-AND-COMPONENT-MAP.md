# Sorotan Kode & Panduan Komponen (Code Highlights & Component Map) — JAT Hybrid IDP

**Dokumen Kontrol:**
- **ID Dokumen:** DOC-J-CODE-10
- **Versi:** 1.0.0
- **Status:** Complete / Developer Guided Tour
- **Klasifikasi Bukti:** `[Verified in Code]` dan `[Verified by Test]`
- **Penanggung Jawab:** Lead Software Engineer & Technical Reviewer

---

## 1. Pohon Struktur Repositori Kode (*Repository Tree*)

```
jat-hybrid-idp/
├── docs/                                  # Dokumentasi kebutuhan, desain, dan pengujian
│   ├── development-documentation/         # 14 Berkas Dokumentasi Induk & Handover
│   ├── Business-Rules.md                  # 45 Aturan Bisnis Kunci (BR-01 s/d BR-45)
│   ├── PRD.md                             # Spesifikasi Kebutuhan Produk (JAT-BL-01 s/d 18)
│   ├── DESIGN.md                          # Sistem Desain Resmi & Token Antarmuka
│   └── SCREEN-INVENTORY.md                # Katalog 52 Node Layar Google Stitch
├── design-reference/                      # Potongan Gambar Acuan Desain PDF & Ekspor Stitch
├── prompts/                               # Template Prompt AI (Stitch, Antigravity, QA)
├── src/                                   # KODE SUMBER UTAMA APLIKASI
│   ├── App.tsx                            # Router Utama & Pemasangan Shell
│   ├── main.tsx                           # Titik Masuk React 19 (ReactDOM.createRoot)
│   ├── components/
│   │   ├── admin/                         # Komponen Khusus Admin (Modal, Inspektor, Tabel)
│   │   │   ├── AddStudentModal.tsx        # Modal Tambah Mahasiswa ke Batch
│   │   │   ├── AdminAppliedJobsSection.tsx# Tabel Applied Jobs & Multi-Filter Popover
│   │   │   └── AdminHitlInspectorModal.tsx# Modal Inspeksi Bukti Berdampingan (b490bfff)
│   │   ├── common/                        # Komponen Bersama Lintas Peran
│   │   │   ├── ConfirmDestructiveModal.tsx# Modal Konfirmasi Hapus dengan Ketik Nama Persis
│   │   │   ├── RoleGuard.tsx              # Komponen Pelindung Otorisasi Peran
│   │   │   └── StatusBadge.tsx            # Badge Status Semantik Standar
│   │   ├── layout/                        # Kerangka Tata Letak Navigasi
│   │   │   ├── AdminShell.tsx             # Shell Sidebar & Header Portal Admin
│   │   │   └── StudentShell.tsx           # Shell Sidebar & Header Portal Student
│   │   └── student/                       # Komponen Khusus Student
│   │       ├── StudentAddProofDrawer.tsx  # Laci Formulir 580px Pengajuan Lamaran
│   │       └── StudentApplicationDetailDrawer.tsx # Laci Rincian Lamaran & Alasan Penolakan
│   ├── context/
│   │   └── StudentPrototypeContext.tsx    # Context Simulasi Peran & Tanggal Referensi
│   ├── mocks/
│   │   └── jatData.ts                     # Fixture Data Sintetis Awal (Batch, Siswa, Lamaran)
│   ├── pages/
│   │   ├── admin/                         # Halaman Tampilan Portal Admin
│   │   │   ├── AdminBatchDetailPage.tsx   # Detail Batch, Jadwal Fase & Roster Peserta
│   │   │   ├── AdminBatchFormPage.tsx     # Form Tambah/Ubah Batch & Dynamic Repeater
│   │   │   ├── AdminBatchManagementPage.tsx # Daftar Batch JAT & Agregat Kohort
│   │   │   ├── AdminRequestQueuePage.tsx  # Antrean Verifikasi Waiting Confirmation
│   │   │   └── AdminStudentDetailPage.tsx # Profil Siswa & Matriks Pencapaian Target
│   │   └── student/                       # Halaman Tampilan Portal Student
│   │       ├── StudentBatchDetailPage.tsx # Dashboard Siswa, Target & Status Jendela
│   │       └── StudentBatchListPage.tsx   # Daftar Batch yang Diikuti Siswa
│   ├── services/
│   │   ├── batchRepository.ts             # Data Access Layer, State Persist & Assertion RBAC
│   │   ├── progressCalculator.ts          # Mesin Kalkulasi Target & Progres Terpusat
│   │   └── idp/                           # MESIN INTI HYBRID IDP
│   │       ├── deterministicRuleValidator.ts # Validator Aturan Deterministik Ketat
│   │       ├── idpDecisionPolicy.ts       # Kebijakan Keputusan Status Berjenjang
│   │       ├── idpExtractionPipeline.ts   # Orkestrator Pipeline Ekstraksi
│   │       ├── idpExtractionTypes.ts      # Kontrak Tipe Data Masukan & Ekstraksi
│   │       ├── idpValidationService.ts    # Koordinator Validasi & Non-Override Guard
│   │       ├── idpValidationTypes.ts      # Kontrak Tipe Data Hasil Validasi & Evaluasi
│   │       ├── imagePreprocessor.ts       # Validator Biner Magic Bytes & MIME
│   │       ├── lexicalSimilarity.ts       # Algoritma Sørensen-Dice & Normalisasi PT
│   │       ├── ocrEngine.ts               # Interface & Mock Adapter OCR (DEC-05)
│   │       ├── semanticComparator.ts      # Interface & Mock Adapter LLM Semantik (DEC-06)
│   │       ├── structuredAttributeExtractor.ts # Parser 7 Atribut Standar (BR-39)
│   │       ├── syntheticExtractionFixtures.ts # 9 Set Fixture Uji Variasi Kualitas Bukti
│   │       └── textNormalizer.ts          # Sanitasi Kontrol Teks & Deteksi Tutup
│   ├── test/                              # 12 BERKAS TEST SUITE OTOMATIS (97 TES)
│   │   ├── ep-jat-01.test.tsx s/d ep-jat-11.test.tsx # Tes Unit & Komponen per Epic
│   │   ├── ep-jat-05.test.ts & ep-jat-06.test.ts    # Tes Unit Pipeline IDP
│   │   └── ep-jat-12.test.tsx             # Tes Integrasi E2E 9-Langkah & Regresi
│   ├── types/
│   │   └── jat.ts                         # Domain Interfaces & Enums Utama
│   └── utils/
│       ├── dateUtils.ts                   # Utilitas Kalkulasi Kalender & Rentang Hari
│       └── formatDate.ts                  # Format Tanggal Bahasa Indonesia Standar
├── package.json                           # Manifest Dependensi & Scripts
├── tsconfig.json                          # Konfigurasi TypeScript Strict Mode
└── vite.config.ts                         # Konfigurasi Vite Bundler
```

---

## 2. Pembedahan Fungsi & Komponen Kritis

### 2.1 Verifikasi Biner Magic Bytes Gambar (`imagePreprocessor.ts`)
- **Masalah yang Diatasi:** Mencegah peretasan ekstensi di mana siswa mengunggah berkas PDF, dokumen Word, atau berkas biner rusak yang sengaja dinamai `.png`.
- **Lokasi Kode:** [`src/services/idp/imagePreprocessor.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/imagePreprocessor.ts) L25–L65.

```typescript
export function validateEvidenceImage(metadata: EvidenceFileMetadata): ImageValidationResult {
  // 1. Validasi Ukuran (Maksimal 5MB, tidak boleh 0 byte - BR-12)
  if (metadata.size <= 0) {
    return { valid: false, errorCode: 'EMPTY_FILE', errorMessage: 'Berkas kosong (0 byte).' };
  }
  if (metadata.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, errorCode: 'FILE_TOO_LARGE', errorMessage: 'Ukuran melebihi batas 5MB.' };
  }

  // 2. Verifikasi Tanda Tangan Biner (Magic Bytes - BR-34)
  const bytes = metadata.headerBytes;
  if (!bytes || bytes.length < 4) {
    return { valid: false, errorCode: 'CORRUPT_BYTES', errorMessage: 'Header berkas rusak.' };
  }

  // Deteksi Berkas PDF Palsu yang dinamai .png (%PDF)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { valid: false, errorCode: 'UNSUPPORTED_TYPE', errorMessage: 'Berkas terdeteksi sebagai PDF.' };
  }

  // Tanda Tangan PNG Asli: 0x89 0x50 0x4E 0x47 (\x89PNG)
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  // Tanda Tangan JPEG Asli: 0xFF 0xD8 0xFF
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;

  if (!isPng && !isJpeg) {
    return { valid: false, errorCode: 'UNSUPPORTED_TYPE', errorMessage: 'Bukan format JPG/JPEG/PNG valid.' };
  }

  return { valid: true, detectedFormat: isPng ? 'PNG' : 'JPEG' };
}
```

---

### 2.2 Penegakan Aturan Non-Override AI (`idpValidationService.ts`)
- **Masalah yang Diatasi:** Mencegah kecerdasan buatan menyetujui pengajuan secara keliru ketika aturan deterministik institusi dilanggar (`BR-26`).
- **Lokasi Kode:** [`src/services/idp/idpValidationService.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/idpValidationService.ts) L75–L110.

```typescript
export async function runIdpValidationPipeline(
  input: IdpValidationInput
): Promise<IdpValidationResult> {
  // Jalankan Validasi Aturan Deterministik terlebih dahulu
  const deterministicResult = validateDeterministicRules(
    input.formInput, 
    input.extractedAttributes
  );

  // SAFEGUARD MUTLAK (BR-26):
  // Jika aturan deterministik gagal, LLM TIDAK BOLEH membatalkannya!
  if (!deterministicResult.passed) {
    return {
      validationStatus: 'Rejected',
      rejectionReason: deterministicResult.violations.join('; '),
      findings: deterministicResult.findings,
      processingMetadata: {
        isMockAdapter: true,
        providerDecisionStatus: 'BLOCKED_PENDING_DECISION',
        ruleNonOverrideEnforced: true // Audit flag
      }
    };
  }

  // Jalankan Komparasi Semantik hanya jika aturan deterministik lolos
  const semanticResult = await semanticComparatorAdapter.compareSemantics(
    input.formInput,
    input.extractedAttributes
  );

  // Evaluasi Kebijakan Keputusan Berjenjang (BR-38)
  const decision = evaluateDecisionPolicy(deterministicResult, semanticResult);
  return {
    validationStatus: decision.decision,
    rejectionReason: decision.reason,
    confidenceScore: semanticResult.similarityScore,
    findings: deterministicResult.findings
  };
}
```

---

### 2.3 Perhitungan Kemiripan Leksikal Sørensen–Dice (`lexicalSimilarity.ts`)
- **Masalah yang Diatasi:** Membandingkan nama perusahaan secara adil meskipun terdapat perbedaan singkatan badan hukum seperti *"PT Tech Solusindo"* vs *"Tech Solusindo, Tbk"* (`BR-40`).
- **Lokasi Kode:** [`src/services/idp/lexicalSimilarity.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/idp/lexicalSimilarity.ts) L15–L55.

```typescript
export function calculateSorensenDiceSimilarity(str1: string, str2: string): number {
  // 1. Normalisasi teks & buang prefiks/sufiks badan hukum Indonesia (BR-40)
  const clean1 = normalizeCorporateEntityName(str1);
  const clean2 = normalizeCorporateEntityName(str2);

  if (clean1 === clean2) return 1.0;
  if (clean1.length < 2 || clean2.length < 2) return 0.0;

  // 2. Pembentukan himpunan Bi-gram karakter
  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1);
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(clean1);
  const bigrams2 = getBigrams(clean2);

  // 3. Hitung Irisan Bi-gram (Intersection)
  let intersectionSize = 0;
  for (const [bigram, count1] of bigrams1.entries()) {
    if (bigrams2.has(bigram)) {
      intersectionSize += Math.min(count1, bigrams2.get(bigram)!);
    }
  }

  // 4. Rumus Koefisien Sørensen–Dice: (2 * |X ∩ Y|) / (|X| + |Y|)
  const totalBigrams = (clean1.length - 1) + (clean2.length - 1);
  return Math.round(((2.0 * intersectionSize) / totalBigrams) * 100) / 100;
}
```

---

### 2.4 Penegakan Kontrol Akses pada Service Layer (`batchRepository.ts`)
- **Masalah yang Diatasi:** Mencegah panggilan API atau mutasi data administratif oleh peran siswa meskipun tombol di UI disembunyikan (`BR-33`, `BR-43`).
- **Lokasi Kode:** [`src/services/batchRepository.ts`](file:///c:/Users/ACER/Downloads/PKL%20Journey/jat-hybrid-idp/src/services/batchRepository.ts) L210–L230.

```typescript
private assertAdminAccess(actorRole?: PrototypeActorRole, actionDescription = 'tindakan ini'): void {
  const effectiveRole = actorRole ?? this.activeRole;
  if (effectiveRole !== 'Admin (Talent Support)' && effectiveRole !== 'Super Admin') {
    throw new Error(
      `Akses ditolak: Hanya Admin (Talent Support) atau Super Admin yang memiliki wewenang untuk ${actionDescription} (BR-33, BR-43).`
    );
  }
}
```
