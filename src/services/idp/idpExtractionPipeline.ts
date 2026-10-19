import type {
  EvidenceImageInput,
  EvidenceQualityAssessment,
  IdpExtractionError,
  IdpExtractionResult,
  OcrEngine,
} from './idpExtractionTypes';
import { preprocessEvidenceImage } from './imagePreprocessor';
import { defaultOcrEngine } from './ocrEngine';
import { extractStructuredJobAttributes } from './structuredAttributeExtractor';
import { normalizeOcrText } from './textNormalizer';

/**
 * EP-JAT-05 (BLG-JAT-017, BLG-JAT-018, BLG-JAT-019):
 * Hybrid IDP Extraction Pipeline orchestrator.
 *
 * Pipeline sequence:
 * 1. Image preparation & validation (untrusted file sanitization, format, MIME, header check).
 * 2. OCR execution (via modular OcrEngine interface; default is MockOcrEngineAdapter).
 * 3. Text sanitization & normalization.
 * 4. Structured job attribute extraction (strictly evidence-grounded, null if absent).
 * 5. Structured error reporting and provenance recording.
 */
export async function runIdpExtractionPipeline(
  input: EvidenceImageInput,
  engine: OcrEngine = defaultOcrEngine
): Promise<IdpExtractionResult> {
  const timestamp = new Date().toISOString();
  const errors: IdpExtractionError[] = [];

  // Default fallback quality if pipeline fails before image assessment
  const fallbackQuality: EvidenceQualityAssessment = {
    grade: 'unreadable',
    isSufficientForExtraction: false,
    estimatedClarityScore: 0,
    notes: ['Berkas belum berhasil diproses.'],
  };

  // -------------------------------------------------------------
  // STAGE 1: Evidence Validation & Preprocessing (BLG-JAT-017)
  // -------------------------------------------------------------
  const prepOutcome = preprocessEvidenceImage(input);
  if (!prepOutcome.valid || !prepOutcome.prepared) {
    if (prepOutcome.error) {
      errors.push(prepOutcome.error);
    }
    return {
      success: false,
      inputFileName: input.fileName,
      qualityAssessment: fallbackQuality,
      errors,
      processingMetadata: {
        pipelineStageReached: 'validation',
        isMockAdapter: !engine.isConfigured,
        providerDecisionStatus: 'BLOCKED_PENDING_DECISION',
        timestamp,
      },
    };
  }

  const prepared = prepOutcome.prepared;
  const qualityAssessment = prepared.qualityAssessment;

  // -------------------------------------------------------------
  // STAGE 2: OCR Execution (BLG-JAT-017)
  // -------------------------------------------------------------
  let rawOcrResult;
  try {
    rawOcrResult = await engine.processImage(prepared);
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Kegagalan komunikasi dengan provider OCR.';
    errors.push({
      code: 'PROVIDER_ERROR',
      message: errorMsg,
      details: err,
    });

    return {
      success: false,
      inputFileName: input.fileName,
      qualityAssessment,
      errors,
      processingMetadata: {
        pipelineStageReached: 'ocr',
        isMockAdapter: !engine.isConfigured,
        providerDecisionStatus: 'BLOCKED_PENDING_DECISION',
        timestamp,
      },
    };
  }

  // Verify OCR output integrity (malformed schema defense, BR-34)
  if (
    !rawOcrResult ||
    typeof rawOcrResult.rawText !== 'string' ||
    !Array.isArray(rawOcrResult.blocks)
  ) {
    errors.push({
      code: 'MALFORMED_OUTPUT',
      message: 'Output dari engine OCR tidak sesuai skema (blocks bukan array atau text kosong).',
      details: { rawOcrResult },
    });

    return {
      success: false,
      inputFileName: input.fileName,
      qualityAssessment,
      errors,
      processingMetadata: {
        pipelineStageReached: 'ocr',
        isMockAdapter: !engine.isConfigured,
        providerDecisionStatus: 'BLOCKED_PENDING_DECISION',
        timestamp,
      },
    };
  }

  // -------------------------------------------------------------
  // STAGE 3: Text Normalization (BLG-JAT-018)
  // -------------------------------------------------------------
  const normalized = normalizeOcrText(rawOcrResult.rawText);

  // -------------------------------------------------------------
  // STAGE 4: Structured Job Attribute Extraction (BLG-JAT-018)
  // -------------------------------------------------------------
  const extractedAttributes = extractStructuredJobAttributes(rawOcrResult);

  // If evidence clarity is degraded / insufficient, record an informative warning error
  if (!qualityAssessment.isSufficientForExtraction) {
    errors.push({
      code: 'IMAGE_UNREADABLE',
      message: `Kualitas bukti lamaran tergolong "${qualityAssessment.grade}": ${qualityAssessment.notes.join(' ')}`,
      details: { grade: qualityAssessment.grade, clarityScore: qualityAssessment.estimatedClarityScore },
    });
  }

  return {
    success: errors.length === 0 || errors.every((e) => e.code === 'IMAGE_UNREADABLE'),
    inputFileName: input.fileName,
    qualityAssessment,
    extractedAttributes,
    rawOcr: rawOcrResult,
    normalizedText: normalized.sanitizedFullText,
    errors,
    processingMetadata: {
      pipelineStageReached: 'completed',
      isMockAdapter: !engine.isConfigured,
      providerDecisionStatus: 'BLOCKED_PENDING_DECISION',
      timestamp,
    },
  };
}
