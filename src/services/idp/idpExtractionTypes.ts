import type { JobLevel, PositionType, WorkSystem } from '../../types/jat';

/**
 * EP-JAT-05 (BLG-JAT-017, BLG-JAT-018):
 * Typed contracts for Hybrid IDP Image Preprocessing, OCR, and Structured Job Attribute Extraction.
 *
 * Designed to strictly adhere to:
 * - BR-11, BR-12: Allowed image types (JPG, JPEG, PNG) and MIME verification.
 * - BR-18: Evidence-backed attributes only. Missing/unsupported values remain strictly null (never guessed).
 * - BR-26, BR-34: Untrusted inputs; file and OCR outputs are sanitized and validated.
 * - BR-37: Clear labeling of mock/simulated extraction results pending approved production OCR provider.
 * - BR-39: Core attributes (Role, Company, Location, Position, Job Level, Work System, Date Applied).
 * - BR-41: Vacancy closed frasa detection.
 */

export type AllowedImageMimeType = 'image/jpeg' | 'image/jpg' | 'image/png';

export interface EvidenceImageInput {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  headerBytes?: number[];
  /** Optional base64 or raw buffer data for image inspection */
  binaryData?: string | Uint8Array;
  /** Synthetic fixture identifier for reproducible prototype tests */
  fixtureId?: string;
}

export type EvidenceQualityGrade =
  | 'readable'
  | 'blurry'
  | 'cropped'
  | 'incomplete'
  | 'irrelevant'
  | 'unreadable';

export interface EvidenceQualityAssessment {
  grade: EvidenceQualityGrade;
  isSufficientForExtraction: boolean;
  estimatedClarityScore: number; // 0.0 - 1.0
  notes: string[];
}

export interface PreparedImage {
  fileName: string;
  normalizedMimeType: AllowedImageMimeType;
  fileSizeBytes: number;
  headerSignatureValid: boolean;
  qualityAssessment: EvidenceQualityAssessment;
  preprocessed: boolean;
  preprocessingStepsApplied: string[];
}

export interface OcrBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrTextBlock {
  text: string;
  confidence: number; // 0.0 - 1.0
  boundingBox?: OcrBoundingBox;
  lineIndex?: number;
}

export type OcrExecutionStatus =
  | 'REAL_EXECUTION'
  | 'MOCK_FIXTURE'
  | 'BLOCKED_PENDING_DECISION';

export interface OcrEngineMetadata {
  provider: string;
  modelOrVersion?: string;
  isMock: boolean;
  executionStatus: OcrExecutionStatus;
  latencyMs?: number;
  timestamp: string;
}

export interface OcrRawResult {
  rawText: string;
  blocks: OcrTextBlock[];
  detectedLanguage?: string;
  engineMetadata: OcrEngineMetadata;
}

/**
 * Represents a single extracted job attribute with evidence provenance.
 * If evidence does not support a value, value is strictly null (never guessed).
 */
export interface ExtractedAttributeField<T> {
  value: T | null;
  confidence: number; // 0.0 - 1.0
  provenanceText?: string;
  isMissingOrUnknown: boolean;
  extractionNote?: string;
}

export interface ExtractedJobAttributes {
  company: ExtractedAttributeField<string>;
  role: ExtractedAttributeField<string>;
  position: ExtractedAttributeField<PositionType>;
  jobLevel: ExtractedAttributeField<JobLevel>;
  yearsOfExperience: ExtractedAttributeField<string>;
  location: ExtractedAttributeField<string>;
  workSystem: ExtractedAttributeField<WorkSystem>;
  vacancyUrl: ExtractedAttributeField<string>;
  dateApplied: ExtractedAttributeField<string>;
  vacancyClosedDetected: boolean;
  vacancyClosedPhrasesFound: string[];
}

export type IdpExtractionErrorCode =
  | 'INVALID_FILE_FORMAT'
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'CORRUPTED_FILE'
  | 'IMAGE_UNREADABLE'
  | 'PROVIDER_UNCONFIGURED'
  | 'PROVIDER_ERROR'
  | 'MALFORMED_OUTPUT'
  | 'PIPELINE_ERROR';

export interface IdpExtractionError {
  code: IdpExtractionErrorCode;
  message: string;
  details?: unknown;
}

export interface IdpExtractionResult {
  success: boolean;
  inputFileName: string;
  qualityAssessment: EvidenceQualityAssessment;
  extractedAttributes?: ExtractedJobAttributes;
  rawOcr?: OcrRawResult;
  normalizedText?: string;
  errors: IdpExtractionError[];
  processingMetadata: {
    pipelineStageReached:
      | 'validation'
      | 'preprocessing'
      | 'ocr'
      | 'normalization'
      | 'attribute_extraction'
      | 'completed';
    isMockAdapter: boolean;
    providerDecisionStatus: 'BLOCKED_PENDING_DECISION' | 'CONFIGURED';
    timestamp: string;
  };
}

/**
 * Modular OCR engine abstraction.
 * If no approved provider exists, only MockOcrEngineAdapter is implemented.
 */
export interface OcrEngine {
  readonly providerName: string;
  readonly isConfigured: boolean;
  processImage(prepared: PreparedImage): Promise<OcrRawResult>;
}
