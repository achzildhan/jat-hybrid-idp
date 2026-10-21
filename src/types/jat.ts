/**
 * Domain types for Job Application Tracking (JAT) Hybrid IDP Prototype
 * Strictly aligned with docs/PRD.md, docs/Business-Rules.md, docs/System-Requirements.md, and docs/DESIGN.md
 */

/**
 * Confirmed Decision DSN-TBD-01 & BR-22:
 * Validation status is standardized across Student and Admin portals to:
 * 'Approved', 'Rejected', or 'Waiting Confirmation'.
 */
export type ValidationStatus = 'Approved' | 'Rejected' | 'Waiting Confirmation';

export type JobLevel =
  | 'Junior Level'
  | 'Mid Level'
  | 'Senior Level'
  | 'Lead / Managerial'
  | 'Internship';

export type WorkSystem = 'Remote / WFH' | 'Hybrid' | 'Onsite';

export type PositionType = 'Full-time' | 'Internship' | 'Contract' | 'Freelance';

export type ReadinessBadge = 'Portofolio Siap' | 'Review CV Selesai' | 'On Boarding';

export type ParticipantPacingStatus = 'On Track' | 'Needs Reminder' | 'Completed';

export interface JobLevelTarget {
  id: string;
  jobLevel: JobLevel;
  targetCount: number; // Number of required job applications
}

export interface DateRangeConfig {
  id: string;
  label: string; // e.g., "Date Range 1"
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  targets: JobLevelTarget[];
}

export interface PhaseConfig {
  phaseNumber: 1 | 2;
  enabled: boolean; // Phase 1 is always required; Phase 2 is optional (BR-04)
  dateRanges: DateRangeConfig[];
}

export interface BootcampCohortOption {
  id: string;
  name: string;
  program: string;
  studentCount: number;
}

/**
 * EP-JAT-02 (BLG-JAT-007):
 * StudentIdentity represents the standalone Bootcamp Student record in the directory,
 * kept distinct from batch membership (StudentParticipant) so removing a student from a
 * JAT batch does not erase their identity.
 */
export interface StudentIdentity {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  baseProgram: string;
  bootcampCohortId: string;
  bootcampCohortName: string;
  readinessBadge: ReadinessBadge;
}

/**
 * EP-JAT-02 (BLG-JAT-005..007):
 * StudentParticipant represents a Student's active membership and derived target progress
 * within a specific JAT Batch.
 */
export interface StudentParticipant extends StudentIdentity {
  phase1CompletedCount: number;
  phase1TargetCount: number;
  phase2CompletedCount: number;
  phase2TargetCount: number;
  pacingStatus: ParticipantPacingStatus;
  enrolledAt?: string;
}

export interface EvidenceFileMetadata {
  name: string;
  size: number; // File size in bytes
  type: string; // Browser-reported MIME type (e.g., 'image/png', 'image/jpeg')
  headerBytes?: number[]; // Optional magic bytes when inspected
}

/**
 * BR-28: External employer recruitment progress/status is strictly distinct from
 * JAT proof validation status ('Approved' | 'Rejected' | 'Waiting Confirmation').
 */
export type RecruitmentStage =
  | 'Applied'
  | 'HR Screening'
  | 'User Interview'
  | 'Offering'
  | 'Rejected by Employer';

/**
 * BR-25, BR-27 & BR-37: Explicit provenance of the validation outcome in the prototype.
 * Clearly distinguishes unprocessed/pending submissions and simulated/mock outcomes from
 * real production AI validation.
 */
export type ValidationSource =
  | 'Pending Verification'
  | 'Simulated Rule Check (Mock)'
  | 'Simulated Human Review (Talent Support)';

/**
 * BR-33, BR-43 & DSN-TBD-02:
 * Documented prototype role model for JAT actions.
 * Both 'Admin (Talent Support)' and 'Super Admin' have identical authority in JAT.
 * 'Student' is unauthorized for Admin HITL review actions.
 */
export type PrototypeActorRole =
  | 'Admin (Talent Support)'
  | 'Super Admin'
  | 'Student';

/**
 * DSN-TBD-06 & BR-39:
 * All 7 required attributes that must be displayed individually in the HITL Evidence Inspector checklist.
 */
export type Br39AttributeKey =
  | 'dateApplied'
  | 'role'
  | 'company'
  | 'location'
  | 'position'
  | 'jobLevel'
  | 'workSystem';

export type IdpAttributeCheckStatus =
  | 'Matched'
  | 'Fuzzy Match (>70%)'
  | 'Ambiguous / Unclear'
  | 'Mismatch'
  | 'Unverified';

export interface IdpAttributeFinding {
  attributeKey: Br39AttributeKey;
  label: string;
  submittedValue: string;
  extractedValue: string | null; // BR-18: null when unknown/unreadable, never guessed
  status: IdpAttributeCheckStatus;
  /**
   * Attribute-level Sørensen–Dice lexical similarity score (0.0 to 1.0).
   * Strictly null when extracted value is missing or unverified (BR-18, BR-40).
   */
  lexicalSimilarityScore?: number | null;
  note?: string;
}

/**
 * BR-25: Traceable human review action log entry.
 * Does not invent personal reviewer names or server timestamps when not provided.
 */
export interface HumanReviewHistoryEntry {
  id: string;
  action: 'Approved' | 'Rejected';
  resultingStatus: ValidationStatus;
  rejectionReason?: string;
  reviewFeedback?: string;
  actorRole: PrototypeActorRole;
  reviewedBy?: string;
  reviewedAt?: string;
}

/**
 * Synthetic Job Application Submission record associated with a student and batch.
 * Preserved in archive when a participant is removed from a batch (no silent deletion).
 */
export interface StudentApplicationRecord {
  id: string;
  batchId: string;
  studentId: string;
  phaseNumber: 1 | 2;
  dateRangeId: string;
  dateRangeLabel: string;
  dateApplied: string; // ISO YYYY-MM-DD
  createdAt: string;
  role: string;
  company: string;
  location: string;
  position: PositionType;
  jobLevel: JobLevel;
  workSystem: WorkSystem;
  yearsOfExperience: string;
  vacancyUrl: string;
  evidenceFileName: string;
  evidenceFileSize?: number;
  evidenceMimeType?: string;
  validationStatus: ValidationStatus;
  rejectionReason?: string;
  reviewFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  validationSource?: ValidationSource;
  recruitmentStage?: RecruitmentStage;
  validationFindings?: IdpAttributeFinding[];
  reviewHistory?: HumanReviewHistoryEntry[];
  /**
   * BR-42: Snapshot of the valid date range active at the time the Student submitted the application,
   * so subsequent Admin edits to the batch's date ranges do not invalidate an already-valid submission.
   */
  submittedDateRangeWindow?: {
    startDate: string;
    endDate: string;
  };
}

export interface UpdateApplicationValidationInput {
  validationStatus: ValidationStatus;
  rejectionReason?: string;
  reviewFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  validationSource?: ValidationSource;
  actorRole?: PrototypeActorRole;
}

export interface ReviewApplicationRequestInput {
  decision: 'Approved' | 'Rejected';
  confirmed: boolean;
  rejectionReason?: string;
  reviewFeedback?: string;
  actorRole?: PrototypeActorRole;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CreateStudentApplicationInput {
  batchId: string;
  studentId: string;
  dateApplied: string; // ISO YYYY-MM-DD
  role: string;
  company: string;
  location: string;
  position: PositionType | '';
  yearsOfExperience: string;
  jobLevel: JobLevel | '';
  workSystem: WorkSystem | '';
  vacancyUrl: string;
  evidenceFile: EvidenceFileMetadata | null;
  recruitmentStage?: RecruitmentStage;
}

export interface JatBatch {
  id: string;
  name: string; // Program / Batch Name (BR-01, BR-02)
  status: 'Active' | 'Upcoming' | 'Completed';
  affiliatedCohorts: BootcampCohortOption[];
  phase1: PhaseConfig;
  phase2: PhaseConfig; // Optional phase (BR-04)
  participants: StudentParticipant[];
  lastRecalculatedAt?: string;
  lastRecalculatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateBatchInput {
  name: string;
  affiliatedCohortIds: string[];
  phase1: PhaseConfig;
  phase2: PhaseConfig;
}

/**
 * EP-JAT-03 (BLG-JAT-009..012, BR-06, BR-07):
 * Deterministic period window state relative to a reference date (YYYY-MM-DD).
 * Boundaries are inclusive: startDate <= referenceDate <= endDate => 'Active'.
 */
export type PeriodWindowStatus = 'Active' | 'Upcoming' | 'Expired' | 'Inactive';


