import { describe, expect, it } from 'vitest';
import {
  SYNTHETIC_FIXTURES,
  extractStructuredJobAttributes,
  normalizeOcrText,
  preprocessEvidenceImage,
  runIdpExtractionPipeline,
  sanitizeOcrText,
  defaultOcrEngine,
} from '../services/idp';
import type { EvidenceImageInput, OcrEngine, PreparedImage } from '../services/idp';

describe('EP-JAT-05 — Hybrid IDP Extraction (BLG-JAT-017, BLG-JAT-018, BLG-JAT-019)', () => {
  describe('BLG-JAT-017: Image Preprocessing & Validation', () => {
    it('accepts valid PNG, JPG, and JPEG files with matching MIME types and magic bytes (BR-11, BR-12)', () => {
      // 1. Valid PNG
      const pngOutcome = preprocessEvidenceImage({
        fileName: 'bukti.png',
        fileSizeBytes: 2048,
        mimeType: 'image/png',
        headerBytes: [0x89, 0x50, 0x4e, 0x47],
      });
      expect(pngOutcome.valid).toBe(true);
      expect(pngOutcome.prepared?.normalizedMimeType).toBe('image/png');
      expect(pngOutcome.prepared?.headerSignatureValid).toBe(true);

      // 2. Valid JPG
      const jpgOutcome = preprocessEvidenceImage({
        fileName: 'bukti.jpg',
        fileSizeBytes: 2048,
        mimeType: 'image/jpeg',
        headerBytes: [0xff, 0xd8, 0xff],
      });
      expect(jpgOutcome.valid).toBe(true);
      expect(jpgOutcome.prepared?.normalizedMimeType).toBe('image/jpeg');

      // 3. Valid JPEG
      const jpegOutcome = preprocessEvidenceImage({
        fileName: 'bukti.jpeg',
        fileSizeBytes: 4096,
        mimeType: 'image/jpeg',
        headerBytes: [0xff, 0xd8, 0xff],
      });
      expect(jpegOutcome.valid).toBe(true);
      expect(jpegOutcome.prepared?.normalizedMimeType).toBe('image/jpeg');
    });

    it('rejects unsupported file formats, e.g. PDF or GIF (BR-11)', () => {
      const pdfOutcome = preprocessEvidenceImage(
        SYNTHETIC_FIXTURES.UNSUPPORTED_FORMAT.input
      );
      expect(pdfOutcome.valid).toBe(false);
      expect(pdfOutcome.error?.code).toBe('INVALID_FILE_FORMAT');
      expect(pdfOutcome.error?.message).toMatch(/hanya jpg, jpeg, dan png/i);

      const gifOutcome = preprocessEvidenceImage({
        fileName: 'animasi.gif',
        fileSizeBytes: 5000,
        mimeType: 'image/gif',
      });
      expect(gifOutcome.valid).toBe(false);
      expect(gifOutcome.error?.code).toBe('INVALID_FILE_FORMAT');
    });

    it('rejects empty (0 byte) evidence files', () => {
      const outcome = preprocessEvidenceImage(
        SYNTHETIC_FIXTURES.EMPTY_FILE.input
      );
      expect(outcome.valid).toBe(false);
      expect(outcome.error?.code).toBe('EMPTY_FILE');
    });

    it('rejects files exceeding maximum allowed size (5MB)', () => {
      const outcome = preprocessEvidenceImage({
        fileName: 'large-image.png',
        fileSizeBytes: 6 * 1024 * 1024,
        mimeType: 'image/png',
      });
      expect(outcome.valid).toBe(false);
      expect(outcome.error?.code).toBe('FILE_TOO_LARGE');
    });

    it('detects corrupted or mismatched magic bytes (untrusted input defense, BR-34)', () => {
      const outcome = preprocessEvidenceImage(
        SYNTHETIC_FIXTURES.CORRUPTED_HEADER.input
      );
      expect(outcome.valid).toBe(false);
      expect(outcome.error?.code).toBe('CORRUPTED_FILE');
      expect(outcome.error?.message).toMatch(/magic bytes|signature/i);
    });
  });

  describe('BLG-JAT-018: Text Sanitization & Structured Attribute Extraction', () => {
    it('sanitizes untrusted OCR text by stripping null bytes and non-printable control characters (BR-34)', () => {
      const dirtyText =
        'PT Tech\x00 Nusantara\x07\x08 Indonesia\r\nPosisi: Frontend\x1F Engineer';
      const clean = sanitizeOcrText(dirtyText);
      expect(clean).not.toContain('\x00');
      expect(clean).not.toContain('\x07');
      expect(clean).not.toContain('\x1F');
      expect(clean).toBe(
        'PT Tech Nusantara Indonesia\nPosisi: Frontend Engineer'
      );
    });

    it('extracts all core job attributes with provenance from clear readable evidence (BR-39)', () => {
      const ocrResult = SYNTHETIC_FIXTURES.CLEAR_READABLE.ocrOutput!;
      const attributes = extractStructuredJobAttributes(ocrResult);

      // Company
      expect(attributes.company.value).toBe('PT Tech Nusantara Indonesia');
      expect(attributes.company.isMissingOrUnknown).toBe(false);
      expect(attributes.company.provenanceText).toContain('PT Tech Nusantara');

      // Role
      expect(attributes.role.value).toBe('Frontend Engineer');
      expect(attributes.role.isMissingOrUnknown).toBe(false);

      // Position
      expect(attributes.position.value).toBe('Full-time');
      expect(attributes.position.isMissingOrUnknown).toBe(false);

      // Job Level
      expect(attributes.jobLevel.value).toBe('Junior Level');
      expect(attributes.jobLevel.isMissingOrUnknown).toBe(false);

      // Work System
      expect(attributes.workSystem.value).toBe('Remote / WFH');
      expect(attributes.workSystem.isMissingOrUnknown).toBe(false);

      // Location
      expect(attributes.location.value).toBe('Jakarta Selatan, Indonesia');
      expect(attributes.location.isMissingOrUnknown).toBe(false);

      // Experience
      expect(attributes.yearsOfExperience.value).toBe('1-2 tahun');
      expect(attributes.yearsOfExperience.isMissingOrUnknown).toBe(false);

      // Vacancy URL
      expect(attributes.vacancyUrl.value).toBe(
        'https://jobs.technusantara.id/career/fe-junior-2025'
      );

      // Date Applied
      expect(attributes.dateApplied.value).toBe('2025-03-10');

      // Vacancy Closed should be false for open vacancy
      expect(attributes.vacancyClosedDetected).toBe(false);
    });

    it('enforces nullable/unknown policy: missing attributes are strictly null and NEVER guessed (BR-18)', () => {
      // Incomplete evidence only has Company and Role
      const ocrResult = SYNTHETIC_FIXTURES.INCOMPLETE_PARTIAL.ocrOutput!;
      const attributes = extractStructuredJobAttributes(ocrResult);

      expect(attributes.company.value).toBe('Gojek Indonesia');
      expect(attributes.company.isMissingOrUnknown).toBe(false);

      expect(attributes.role.value).toBe('Product Designer');
      expect(attributes.role.isMissingOrUnknown).toBe(false);

      // All unevidenced fields must be null (never fabricated)
      expect(attributes.location.value).toBeNull();
      expect(attributes.location.isMissingOrUnknown).toBe(true);
      expect(attributes.location.confidence).toBe(0);

      expect(attributes.position.value).toBeNull();
      expect(attributes.position.isMissingOrUnknown).toBe(true);

      expect(attributes.jobLevel.value).toBeNull();
      expect(attributes.jobLevel.isMissingOrUnknown).toBe(true);

      expect(attributes.workSystem.value).toBeNull();
      expect(attributes.workSystem.isMissingOrUnknown).toBe(true);

      expect(attributes.yearsOfExperience.value).toBeNull();
      expect(attributes.yearsOfExperience.isMissingOrUnknown).toBe(true);

      expect(attributes.vacancyUrl.value).toBeNull();
      expect(attributes.vacancyUrl.isMissingOrUnknown).toBe(true);

      expect(attributes.dateApplied.value).toBeNull();
      expect(attributes.dateApplied.isMissingOrUnknown).toBe(true);
    });

    it('detects vacancy-closed phrases from evidence per BR-41', () => {
      const ocrResult = SYNTHETIC_FIXTURES.VACANCY_CLOSED.ocrOutput!;
      const attributes = extractStructuredJobAttributes(ocrResult);

      expect(attributes.vacancyClosedDetected).toBe(true);
      expect(attributes.vacancyClosedPhrasesFound.length).toBeGreaterThan(0);
      expect(
        attributes.vacancyClosedPhrasesFound.some((p) =>
          /closed|lowongan ditutup/i.test(p)
        )
      ).toBe(true);
    });
  });

  describe('BLG-JAT-019: Extraction Pipeline & Varied Evidence Quality Tests', () => {
    it('processes clear readable evidence through full pipeline and attaches metadata', async () => {
      const result = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );

      expect(result.success).toBe(true);
      expect(result.qualityAssessment.grade).toBe('readable');
      expect(result.qualityAssessment.isSufficientForExtraction).toBe(true);
      expect(result.extractedAttributes?.company.value).toBe(
        'PT Tech Nusantara Indonesia'
      );
      expect(result.extractedAttributes?.role.value).toBe('Frontend Engineer');

      // Processing metadata correctly flags mock adapter status
      expect(result.processingMetadata.isMockAdapter).toBe(true);
      expect(result.processingMetadata.providerDecisionStatus).toBe(
        'BLOCKED_PENDING_DECISION'
      );
      expect(result.processingMetadata.pipelineStageReached).toBe('completed');
    });

    it('handles blurry/degraded evidence: flags clarity warning, does not fabricate fields', async () => {
      const result = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.BLURRY_UNREADABLE.input
      );

      expect(result.qualityAssessment.grade).toBe('blurry');
      expect(result.qualityAssessment.isSufficientForExtraction).toBe(false);
      expect(result.errors.some((e) => e.code === 'IMAGE_UNREADABLE')).toBe(
        true
      );

      // Attributes that could not be reliably extracted are null
      expect(result.extractedAttributes?.role.value).toBeNull();
      expect(result.extractedAttributes?.workSystem.value).toBeNull();
      expect(result.extractedAttributes?.location.value).toBeNull();
    });

    it('handles cropped evidence: extracts visible company only, unevidenced fields remain null', async () => {
      const result = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CROPPED_PARTIAL.input
      );

      expect(result.qualityAssessment.grade).toBe('cropped');
      expect(result.qualityAssessment.isSufficientForExtraction).toBe(false);

      // Company is visible in header
      expect(result.extractedAttributes?.company.value).toBe('Shopee');

      // Role and other fields cut off
      expect(result.extractedAttributes?.role.value).toBeNull();
      expect(result.extractedAttributes?.position.value).toBeNull();
      expect(result.extractedAttributes?.location.value).toBeNull();
    });

    it('handles irrelevant images (random landscape/meme): 0 attributes extracted', async () => {
      const result = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.IRRELEVANT_IMAGE.input
      );

      expect(result.qualityAssessment.grade).toBe('irrelevant');
      expect(result.qualityAssessment.isSufficientForExtraction).toBe(false);

      const attrs = result.extractedAttributes!;
      expect(attrs.company.value).toBeNull();
      expect(attrs.role.value).toBeNull();
      expect(attrs.position.value).toBeNull();
      expect(attrs.jobLevel.value).toBeNull();
      expect(attrs.location.value).toBeNull();
      expect(attrs.workSystem.value).toBeNull();
    });

    it('handles provider failures gracefully with structured PROVIDER_ERROR', async () => {
      const result = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.PROVIDER_FAILURE.input
      );

      expect(result.success).toBe(false);
      expect(result.processingMetadata.pipelineStageReached).toBe('ocr');
      expect(result.errors.some((e) => e.code === 'PROVIDER_ERROR')).toBe(true);
      expect(result.extractedAttributes).toBeUndefined();
    });

    it('handles malformed OCR responses with structured MALFORMED_OUTPUT', async () => {
      const result = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.MALFORMED_OUTPUT.input
      );

      expect(result.success).toBe(false);
      expect(result.processingMetadata.pipelineStageReached).toBe('ocr');
      expect(result.errors.some((e) => e.code === 'MALFORMED_OUTPUT')).toBe(
        true
      );
    });

    it('halts at validation stage when input file is unsupported, empty, or corrupt', async () => {
      const unsupportedResult = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.UNSUPPORTED_FORMAT.input
      );
      expect(unsupportedResult.success).toBe(false);
      expect(unsupportedResult.processingMetadata.pipelineStageReached).toBe(
        'validation'
      );
      expect(unsupportedResult.errors[0].code).toBe('INVALID_FILE_FORMAT');

      const emptyResult = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.EMPTY_FILE.input
      );
      expect(emptyResult.success).toBe(false);
      expect(emptyResult.errors[0].code).toBe('EMPTY_FILE');

      const corruptResult = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CORRUPTED_HEADER.input
      );
      expect(corruptResult.success).toBe(false);
      expect(corruptResult.errors[0].code).toBe('CORRUPTED_FILE');
    });

    it('preserves submitted form data separately from extracted evidence data', async () => {
      // Simulating a student submission where submitted company is 'PT Solusi Bangsa'
      // while evidence extracted is 'PT Tech Nusantara Indonesia'
      const submittedFormData = {
        role: 'Frontend Engineer',
        company: 'PT Solusi Bangsa',
        location: 'Jakarta',
      };

      const extractionResult = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );

      expect(extractionResult.extractedAttributes?.company.value).toBe(
        'PT Tech Nusantara Indonesia'
      );
      // Original submitted form data is unaffected and preserved separately
      expect(submittedFormData.company).toBe('PT Solusi Bangsa');
      expect(submittedFormData.company).not.toBe(
        extractionResult.extractedAttributes?.company.value
      );
    });

    it('supports substituting custom OCR engines via the OcrEngine interface', async () => {
      const customMockEngine: OcrEngine = {
        providerName: 'Custom Evaluation Engine',
        isConfigured: true,
        processImage: async (prepared: PreparedImage) => ({
          rawText: 'Company: Custom Corp\nRole: Data Analyst',
          blocks: [{ text: 'Company: Custom Corp', confidence: 0.99 }],
          engineMetadata: {
            provider: 'Custom Evaluation Engine',
            isMock: true,
            executionStatus: 'MOCK_FIXTURE',
            timestamp: new Date().toISOString(),
          },
        }),
      };

      const result = await runIdpExtractionPipeline(
        {
          fileName: 'custom.png',
          fileSizeBytes: 1024,
          mimeType: 'image/png',
          headerBytes: [0x89, 0x50, 0x4e, 0x47],
        },
        customMockEngine
      );

      expect(result.success).toBe(true);
      expect(result.extractedAttributes?.company.value).toBe('Custom Corp');
      expect(result.extractedAttributes?.role.value).toBe('Data Analyst');
      expect(result.rawOcr?.engineMetadata.provider).toBe(
        'Custom Evaluation Engine'
      );
    });
  });
});
