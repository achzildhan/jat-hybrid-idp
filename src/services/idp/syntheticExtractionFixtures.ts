import type {
  EvidenceImageInput,
  EvidenceQualityAssessment,
  OcrRawResult,
} from './idpExtractionTypes';

/**
 * EP-JAT-05 (BLG-JAT-017..019):
 * Representative synthetic fixtures for testing Hybrid IDP Extraction across varied evidence qualities.
 *
 * Adheres strictly to:
 * - BR-35: Synthetic data only (no real student PII or production screenshots).
 * - BR-37: Clearly labeled as mock/simulated fixtures.
 * - Varied evidence quality: readable, blurry, cropped, incomplete, irrelevant, unsupported, empty, corrupted.
 */

export interface SyntheticFixtureDefinition {
  id: string;
  name: string;
  description: string;
  input: EvidenceImageInput;
  expectedQuality: EvidenceQualityAssessment;
  ocrOutput?: OcrRawResult;
  shouldFailValidation?: boolean;
  expectedValidationErrorCode?: string;
  shouldFailOcrProvider?: boolean;
  malformedOcrStructure?: boolean;
}

const TIMESTAMP = '2025-03-10T10:00:00.000Z';

export const SYNTHETIC_FIXTURES: Record<string, SyntheticFixtureDefinition> = {
  CLEAR_READABLE: {
    id: 'fixture-clear-readable',
    name: 'Bukti Lamaran Lengkap & Jelas (PT Tech Nusantara)',
    description:
      'Screenshot lamaran email/portal pekerjaan dengan semua atribut BR-39 terbaca jelas.',
    input: {
      fileName: 'bukti-lengkap-pt-tech-nusantara.png',
      fileSizeBytes: 245760, // 240 KB
      mimeType: 'image/png',
      headerBytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      fixtureId: 'CLEAR_READABLE',
    },
    expectedQuality: {
      grade: 'readable',
      isSufficientForExtraction: true,
      estimatedClarityScore: 0.96,
      notes: ['Teks gambar tajam, kontras tinggi, tidak terpotong.'],
    },
    ocrOutput: {
      rawText: `
Job Application Confirmation
Perusahaan: PT Tech Nusantara Indonesia
Posisi: Frontend Engineer
Tipe Pekerjaan: Full Time
Tingkat Jabatan: Entry Level / Junior
Sistem Kerja: WFH
Pengalaman Kerja: 1-2 tahun
Lokasi: Jakarta Selatan, Indonesia
Tautan Lowongan: https://jobs.technusantara.id/career/fe-junior-2025
Tanggal Melamar: 2025-03-10
Status Pengajuan: Berhasil Dikirimkan
      `.trim(),
      blocks: [
        { text: 'Job Application Confirmation', confidence: 0.99, lineIndex: 0 },
        { text: 'Perusahaan: PT Tech Nusantara Indonesia', confidence: 0.98, lineIndex: 1 },
        { text: 'Posisi: Frontend Engineer', confidence: 0.97, lineIndex: 2 },
        { text: 'Tipe Pekerjaan: Full Time', confidence: 0.96, lineIndex: 3 },
        { text: 'Tingkat Jabatan: Entry Level / Junior', confidence: 0.95, lineIndex: 4 },
        { text: 'Sistem Kerja: WFH', confidence: 0.98, lineIndex: 5 },
        { text: 'Pengalaman Kerja: 1-2 tahun', confidence: 0.94, lineIndex: 6 },
        { text: 'Lokasi: Jakarta Selatan, Indonesia', confidence: 0.97, lineIndex: 7 },
        { text: 'Tautan Lowongan: https://jobs.technusantara.id/career/fe-junior-2025', confidence: 0.93, lineIndex: 8 },
        { text: 'Tanggal Melamar: 2025-03-10', confidence: 0.99, lineIndex: 9 },
        { text: 'Status Pengajuan: Berhasil Dikirimkan', confidence: 0.97, lineIndex: 10 },
      ],
      detectedLanguage: 'id',
      engineMetadata: {
        provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)',
        modelOrVersion: 'Synthetic Fixture v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 120,
        timestamp: TIMESTAMP,
      },
    },
  },

  BLURRY_UNREADABLE: {
    id: 'fixture-blurry-unreadable',
    name: 'Bukti Lamaran Buram / Low Quality (Blurry)',
    description:
      'Screenshot berkualitas rendah, resolusi sangat rendah dengan motion blur parah.',
    input: {
      fileName: 'bukti-buram-unreadable.jpg',
      fileSizeBytes: 81920,
      mimeType: 'image/jpeg',
      headerBytes: [0xff, 0xd8, 0xff, 0xe0],
      fixtureId: 'BLURRY_UNREADABLE',
    },
    expectedQuality: {
      grade: 'blurry',
      isSufficientForExtraction: false,
      estimatedClarityScore: 0.28,
      notes: ['Gambar mengalami blur parah, teks tidak dapat direkonstruksi dengan andal.'],
    },
    ocrOutput: {
      rawText: `
J..b A..lic..ti..n
P..rus..ha..n: PT ..ch ..
P..sis..: F..nt..d ..
      `.trim(),
      blocks: [
        { text: 'J..b A..lic..ti..n', confidence: 0.25, lineIndex: 0 },
        { text: 'P..rus..ha..n: PT ..ch ..', confidence: 0.31, lineIndex: 1 },
        { text: 'P..sis..: F..nt..d ..', confidence: 0.28, lineIndex: 2 },
      ],
      detectedLanguage: 'unknown',
      engineMetadata: {
        provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)',
        modelOrVersion: 'Synthetic Fixture v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 85,
        timestamp: TIMESTAMP,
      },
    },
  },

  CROPPED_PARTIAL: {
    id: 'fixture-cropped-partial',
    name: 'Bukti Terpotong (Cropped Screenshot)',
    description:
      'Screenshot hanya menampilkan header perusahaan ("Shopee"), bagian judul role, tanggal dan lainnya terpotong.',
    input: {
      fileName: 'bukti-terpotong-cropped.png',
      fileSizeBytes: 145000,
      mimeType: 'image/png',
      headerBytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      fixtureId: 'CROPPED_PARTIAL',
    },
    expectedQuality: {
      grade: 'cropped',
      isSufficientForExtraction: false,
      estimatedClarityScore: 0.55,
      notes: ['Screenshot terpotong: Hanya header perusahaan yang tampak, atribut lain terpotong.'],
    },
    ocrOutput: {
      rawText: `
Shopee Careers
Terima kasih telah melamar di Shopee.
      `.trim(),
      blocks: [
        { text: 'Shopee Careers', confidence: 0.95, lineIndex: 0 },
        { text: 'Terima kasih telah melamar di Shopee.', confidence: 0.92, lineIndex: 1 },
      ],
      detectedLanguage: 'id',
      engineMetadata: {
        provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)',
        modelOrVersion: 'Synthetic Fixture v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 95,
        timestamp: TIMESTAMP,
      },
    },
  },

  INCOMPLETE_PARTIAL: {
    id: 'fixture-incomplete-partial',
    name: 'Bukti Tidak Lengkap (Incomplete Attributes)',
    description:
      'Screenshot asli portal karir yang hanya mencantumkan Perusahaan dan Role, tanpa lokasi, work system, atau pengalaman.',
    input: {
      fileName: 'bukti-tidak-lengkap-partial.jpg',
      fileSizeBytes: 180000,
      mimeType: 'image/jpeg',
      headerBytes: [0xff, 0xd8, 0xff, 0xe1],
      fixtureId: 'INCOMPLETE_PARTIAL',
    },
    expectedQuality: {
      grade: 'incomplete',
      isSufficientForExtraction: true,
      estimatedClarityScore: 0.82,
      notes: ['Teks cukup jelas namun beberapa field kunci tidak tercantum pada bukti bukti.'],
    },
    ocrOutput: {
      rawText: `
Gojek Career Portal
Application Submitted: Product Designer
Company: Gojek Indonesia
Status: Under Review
      `.trim(),
      blocks: [
        { text: 'Gojek Career Portal', confidence: 0.94, lineIndex: 0 },
        { text: 'Application Submitted: Product Designer', confidence: 0.95, lineIndex: 1 },
        { text: 'Company: Gojek Indonesia', confidence: 0.96, lineIndex: 2 },
        { text: 'Status: Under Review', confidence: 0.93, lineIndex: 3 },
      ],
      detectedLanguage: 'en',
      engineMetadata: {
        provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)',
        modelOrVersion: 'Synthetic Fixture v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 110,
        timestamp: TIMESTAMP,
      },
    },
  },

  IRRELEVANT_IMAGE: {
    id: 'fixture-irrelevant-image',
    name: 'Gambar Tidak Relevan (Random Landscape / Meme)',
    description:
      'File gambar berupa pemandangan alam / meme yang sama sekali tidak memiliki kaitan dengan bukti lowongan kerja.',
    input: {
      fileName: 'foto-pemandangan-gunung.png',
      fileSizeBytes: 524000,
      mimeType: 'image/png',
      headerBytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      fixtureId: 'IRRELEVANT_IMAGE',
    },
    expectedQuality: {
      grade: 'irrelevant',
      isSufficientForExtraction: false,
      estimatedClarityScore: 0.1,
      notes: ['Gambar sama sekali tidak mengandung informasi lamaran kerja atau portal karir.'],
    },
    ocrOutput: {
      rawText: `
Sunrise at Mount Bromo, Indonesia. Beautiful landscape wallpaper 4K.
      `.trim(),
      blocks: [
        { text: 'Sunrise at Mount Bromo, Indonesia. Beautiful landscape wallpaper 4K.', confidence: 0.95, lineIndex: 0 },
      ],
      detectedLanguage: 'en',
      engineMetadata: {
        provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)',
        modelOrVersion: 'Synthetic Fixture v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 70,
        timestamp: TIMESTAMP,
      },
    },
  },

  VACANCY_CLOSED: {
    id: 'fixture-vacancy-closed',
    name: 'Bukti Lowongan Sudah Ditutup (BR-41 Closed Vacancy)',
    description:
      'Screenshot portal pekerjaan yang secara eksplisit mencantumkan pesan lowongan ditutup.',
    input: {
      fileName: 'bukti-lowongan-ditutup.png',
      fileSizeBytes: 210000,
      mimeType: 'image/png',
      headerBytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      fixtureId: 'VACANCY_CLOSED',
    },
    expectedQuality: {
      grade: 'readable',
      isSufficientForExtraction: true,
      estimatedClarityScore: 0.94,
      notes: ['Teks jelas, terdeteksi indikator lowongan ditutup (BR-41).'],
    },
    ocrOutput: {
      rawText: `
LinkedIn Job Application
Company: Tokopedia
Position: Software Engineer
Location: Jakarta, Indonesia
Lowongan Ditutup / This Job is Closed. Recruiter Don't Accept Any Applications Yet.
      `.trim(),
      blocks: [
        { text: 'LinkedIn Job Application', confidence: 0.98, lineIndex: 0 },
        { text: 'Company: Tokopedia', confidence: 0.96, lineIndex: 1 },
        { text: 'Position: Software Engineer', confidence: 0.95, lineIndex: 2 },
        { text: 'Location: Jakarta, Indonesia', confidence: 0.94, lineIndex: 3 },
        { text: "Lowongan Ditutup / This Job is Closed. Recruiter Don't Accept Any Applications Yet.", confidence: 0.97, lineIndex: 4 },
      ],
      detectedLanguage: 'id',
      engineMetadata: {
        provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)',
        modelOrVersion: 'Synthetic Fixture v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 105,
        timestamp: TIMESTAMP,
      },
    },
  },

  PROVIDER_FAILURE: {
    id: 'fixture-provider-failure',
    name: 'Kegagalan Layanan Penyedia OCR (Provider Failure)',
    description:
      'Simulasi koneksi timeout atau error 500 dari penyedia OCR.',
    input: {
      fileName: 'bukti-timeout-provider.png',
      fileSizeBytes: 190000,
      mimeType: 'image/png',
      headerBytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      fixtureId: 'PROVIDER_FAILURE',
    },
    expectedQuality: {
      grade: 'readable',
      isSufficientForExtraction: true,
      estimatedClarityScore: 0.9,
      notes: ['File gambar valid, namun koneksi ke provider OCR gagal.'],
    },
    shouldFailOcrProvider: true,
  },

  MALFORMED_OUTPUT: {
    id: 'fixture-malformed-output',
    name: 'Struktur Output OCR Rusak (Malformed Output)',
    description:
      'Simulasi respons OCR yang rusak atau tidak sesuai schema contract.',
    input: {
      fileName: 'bukti-malformed-ocr.png',
      fileSizeBytes: 170000,
      mimeType: 'image/png',
      headerBytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      fixtureId: 'MALFORMED_OUTPUT',
    },
    expectedQuality: {
      grade: 'readable',
      isSufficientForExtraction: true,
      estimatedClarityScore: 0.85,
      notes: ['Output OCR tidak terstruktur atau field blocks bukan array.'],
    },
    malformedOcrStructure: true,
  },

  UNSUPPORTED_FORMAT: {
    id: 'fixture-unsupported-format',
    name: 'Format Tidak Didukung (PDF File)',
    description:
      'Pengguna mengunggah dokumen PDF alih-alih berkas JPG/JPEG/PNG (BR-11).',
    input: {
      fileName: 'bukti-dokumen.pdf',
      fileSizeBytes: 300000,
      mimeType: 'application/pdf',
      headerBytes: [0x25, 0x50, 0x44, 0x46],
      fixtureId: 'UNSUPPORTED_FORMAT',
    },
    expectedQuality: {
      grade: 'unreadable',
      isSufficientForExtraction: false,
      estimatedClarityScore: 0,
      notes: ['Format berkas tidak didukung (BR-11).'],
    },
    shouldFailValidation: true,
    expectedValidationErrorCode: 'INVALID_FILE_FORMAT',
  },

  EMPTY_FILE: {
    id: 'fixture-empty-file',
    name: 'Berkas Kosong (0 Byte File)',
    description: 'Berkas gambar 0 byte.',
    input: {
      fileName: 'gambar-kosong.png',
      fileSizeBytes: 0,
      mimeType: 'image/png',
      headerBytes: [],
      fixtureId: 'EMPTY_FILE',
    },
    expectedQuality: {
      grade: 'unreadable',
      isSufficientForExtraction: false,
      estimatedClarityScore: 0,
      notes: ['Berkas kosong (0 byte).'],
    },
    shouldFailValidation: true,
    expectedValidationErrorCode: 'EMPTY_FILE',
  },

  CORRUPTED_HEADER: {
    id: 'fixture-corrupted-header',
    name: 'Header Gambar Korup (Mismatched Magic Bytes)',
    description:
      'Nama berkas berakhiran .png namun biner header bukan merupakan gambar PNG valid.',
    input: {
      fileName: 'bukti-palsu.png',
      fileSizeBytes: 10240,
      mimeType: 'image/png',
      headerBytes: [0x00, 0x00, 0x00, 0x00],
      fixtureId: 'CORRUPTED_HEADER',
    },
    expectedQuality: {
      grade: 'unreadable',
      isSufficientForExtraction: false,
      estimatedClarityScore: 0,
      notes: ['Header biner tidak cocok dengan format berkas yang dilaporkan.'],
    },
    shouldFailValidation: true,
    expectedValidationErrorCode: 'CORRUPTED_FILE',
  },
};
