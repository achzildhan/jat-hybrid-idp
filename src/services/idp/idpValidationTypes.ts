import type {
  Br39AttributeKey,
  IdpAttributeCheckStatus,
  IdpAttributeFinding,
  JobLevel,
  PositionType,
  ValidationSource,
  ValidationStatus,
  WorkSystem,
} from '../../types/jat';
import type {
  EvidenceQualityGrade,
  IdpExtractionResult,
} from './idpExtractionTypes';

/**
 * EP-JAT-06 (BLG-JAT-020, BLG-JAT-021, BLG-JAT-022):
 * Typed contracts for Hybrid IDP Validation:
 * - Deterministic rule checks (files, dates, active range, vacancy closed signals).
 * - Attribute comparison (lexical similarity > 70% per BR-40, provenance tracking).
 * - Optional semantic validation (mock adapter pending provider approval per DEC-06).
 * - Decision policy for Approved, Rejected, and Waiting Confirmation (BR-38).
 */

export interface SubmittedApplicationForm {
  applicationId?: string;
  batchId?: string;
  studentId?: string;
  dateApplied: string; // ISO YYYY-MM-DD
  role: string;
  company: string;
  location: string;
  position: PositionType;
  jobLevel: JobLevel;
  workSystem: WorkSystem;
  yearsOfExperience: string;
  vacancyUrl: string;
  evidenceFileName: string;
  evidenceFileSizeBytes?: number;
  evidenceMimeType?: string;
  referenceDate: string; // ISO YYYY-MM-DD
  activeDateRangeWindow?: {
    startDate: string;
    endDate: string;
    label?: string;
  };
}

export interface DeterministicCheckResult {
  passed: boolean;
  isDateWithinActiveRange: boolean;
  isNonFutureDate: boolean;
  isSupportedFileFormat: boolean;
  isNonEmptyFile: boolean;
  isFileSizeValid?: boolean;
  isMagicBytesValid?: boolean;
  isVacancyOpen: boolean;
  violations: string[];
}

export interface AttributeComparisonItem {
  attributeKey: Br39AttributeKey;
  label: string;
  submittedValue: string;
  extractedValue: string | null;
  /**
   * Attribute-level Sørensen–Dice lexical similarity score (0.0 to 1.0).
   * Preserved as null when extracted attribute is missing/unverified (BR-18, BR-40).
   */
  lexicalSimilarityScore?: number | null;
  similarityScore: number; // 0.0 to 1.0 compatibility alias
  status: IdpAttributeCheckStatus;
  note?: string;
}

export interface SemanticModelMetadata {
  provider: string;
  modelOrVersion?: string;
  isMock: boolean;
  executionStatus:
    | 'REAL_EXECUTION'
    | 'MOCK_FIXTURE'
    | 'BLOCKED_PENDING_DECISION';
  timestamp: string;
}

export interface SemanticComparisonInput {
  submitted: SubmittedApplicationForm;
  extraction: IdpExtractionResult;
}

export interface SemanticComparisonResult {
  roleSemanticSimilarity: number; // 0.0 to 1.0
  companySemanticMatch: boolean;
  jobLevelExperienceAlignment: {
    aligned: boolean;
    reason?: string;
  };
  semanticNotes: string[];
  metadata: SemanticModelMetadata;
}

/**
 * Modular semantic comparator interface.
 * Implemented via MockSemanticComparatorAdapter if no approved production model exists.
 */
export interface SemanticComparator {
  readonly providerName: string;
  readonly isConfigured: boolean;
  compareSemantics(
    input: SemanticComparisonInput
  ): Promise<SemanticComparisonResult>;
}

export interface IdpValidationPolicyResult {
  validationStatus: ValidationStatus;
  overallComplianceScore: number; // 0 to 100 percentage
  summaryReason: string;
  deterministicResult: DeterministicCheckResult;
  attributeFindings: IdpAttributeFinding[];
  evidenceQualityGrade: EvidenceQualityGrade;
  requiresHumanReview: boolean;
  humanReviewReason?: string;
  validationSource: ValidationSource;
  semanticResult?: SemanticComparisonResult;
  evaluatedAt: string;
}
