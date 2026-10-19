import {
  INITIAL_MOCK_APPLICATIONS,
  INITIAL_MOCK_BATCHES,
  MOCK_BOOTCAMP_COHORTS,
  MOCK_STUDENT_DIRECTORY,
} from '../mocks/jatData';
import type {
  BootcampCohortOption,
  CreateOrUpdateBatchInput,
  CreateStudentApplicationInput,
  HumanReviewHistoryEntry,
  IdpAttributeFinding,
  JatBatch,
  JobLevel,
  ParticipantPacingStatus,
  PositionType,
  PrototypeActorRole,
  ReadinessBadge,
  ReviewApplicationRequestInput,
  StudentApplicationRecord,
  StudentIdentity,
  StudentParticipant,
  UpdateApplicationValidationInput,
  ValidationStatus,
  WorkSystem,
} from '../types/jat';
import {
  type BatchAccessEvaluation,
  calculatePhaseTotalTarget,
  deduplicateDateRanges,
  type EvaluatedDateRange,
  evaluateBatchAccess,
  type PhaseAccessEvaluation,
  validateBatchDeleteConfirmation,
  validateBatchInput,
  validateEvidenceFile,
  validateParticipantAddition,
  validateStudentApplicationSubmission,
} from './batchValidator';
import {
  type BatchMonitoringSummary,
  computeBatchMonitoringSummary,
  computeConsequentialBatchEditImpact,
  computeParticipantPhaseCompletedCounts,
  type ConsequentialBatchEditImpact,
  evaluateParticipantPacingStatus,
  PROGRESS_CALCULATION_POLICY,
} from './progressCalculator';


const STORAGE_KEY = 'jat_hybrid_idp_batches_v1';
const APPLICATIONS_STORAGE_KEY = 'jat_hybrid_idp_applications_v1';

export interface ParticipantFilterOptions {
  searchQuery?: string;
  pacingStatuses?: ParticipantPacingStatus[];
  baseProgram?: string;
  bootcampCohortId?: string;
  quotaRange?: 'all' | 'lt50' | '50to79' | 'gte80';
}

export interface RequestQueueFilterOptions {
  searchQuery?: string;
  batchId?: string;
  phaseNumber?: 'all' | 1 | 2;
  dateRangeId?: string;
  jobLevel?: string;
}

/**
 * EP-JAT-09 (BLG-JAT-031..033, JAT-BL-12, BR-31):
 * Filter criteria for a Student's Applied Jobs table in Admin Student Detail.
 */
export interface StudentApplicationFilterOptions {
  searchQuery?: string;
  phaseNumber?: 'all' | 1 | 2;
  dateRange?: string;
  validationStatus?: 'all' | ValidationStatus;
}

/**
 * EP-JAT-10 (BLG-JAT-037, BR-08):
 * Options for updating a batch, allowing callers to enforce consequential impact confirmation.
 */
export interface UpdateBatchOptions {
  confirmedConsequentialImpact?: boolean;
  actorRole?: PrototypeActorRole;
}

/**
 * EP-JAT-10 (BLG-JAT-036, BLG-JAT-037, BR-29, BR-30, BR-43, DSN-TBD-02):
 * Detailed execution report returned when recalculating batch progress.
 */
export interface RecalculationExecutionReport {
  status: 'updated' | 'no-op';
  batch: JatBatch;
  changedParticipantCount: number;
  deduplicatedRangesCount: number;
  actorRole: PrototypeActorRole;
  recalculatedAt: string;
  message: string;
}

export interface AdminRequestQueueItem {
  application: StudentApplicationRecord;
  batchId: string;
  batchName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  bootcampCohortName: string;
  dateRangeStartDate?: string;
  dateRangeEndDate?: string;
  isWithinConfiguredDateRange: boolean;
  isSupportedEvidenceFormat: boolean;
  attributeChecklist: IdpAttributeFinding[];
}

export interface StudentTargetProgressItem {
  id: string;
  jobLevel: string;
  completedCount: number;
  targetCount: number;
}

export interface StudentDateRangeProgress extends EvaluatedDateRange {
  completedCount: number;
  targetProgress: StudentTargetProgressItem[];
}

export interface StudentPhaseProgress extends Omit<PhaseAccessEvaluation, 'dateRanges'> {
  completedCount: number;
  dateRanges: StudentDateRangeProgress[];
}

export interface StudentBatchViewModel {
  batch: JatBatch;
  participant: StudentParticipant;
  referenceDate: string;
  access: BatchAccessEvaluation;
  phase1: StudentPhaseProgress;
  phase2: StudentPhaseProgress;
  overallCompletedCount: number;
  overallTargetCount: number;
  overallPercentage: number;
  applications: StudentApplicationRecord[];
}


/**
 * Isolated Mock Repository / Service Adapter for JAT Batches & Participants.
 * Keeps synthetic state separate from UI components so a real backend adapter can replace it later.
 *
 * Architectural & Data Consistency Guarantees (EP-JAT-01 & EP-JAT-02):
 * - StudentIdentity (directory) and StudentParticipant (batch membership) are kept distinct.
 * - Duplicate membership of the same Student in the same batch is rejected.
 * - Removing a participant from a batch requires explicit confirmation (confirmed === true)
 *   and does NOT silently delete the StudentIdentity or historical StudentApplicationRecord items.
 */
export class MockBatchRepository {
  private batches: JatBatch[];
  private studentDirectory: StudentIdentity[];
  private applications: StudentApplicationRecord[];
  private activeRole: PrototypeActorRole = 'Admin (Talent Support)';
  private activeStudentId: string = 'stu-1';

  constructor(
    initialData?: JatBatch[],
    initialDirectory?: StudentIdentity[],
    initialApplications?: StudentApplicationRecord[]
  ) {
    this.studentDirectory = initialDirectory
      ? structuredClone(initialDirectory)
      : structuredClone(MOCK_STUDENT_DIRECTORY);

    if (initialData) {
      this.batches = structuredClone(initialData);
    } else {
      this.batches = this.loadFromStorage();
    }

    if (initialApplications) {
      this.applications = structuredClone(initialApplications);
    } else {
      this.applications = this.loadApplicationsFromStorage();
    }
  }

  private loadFromStorage(): JatBatch[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as JatBatch[];
        }
      }
    } catch {
      // Fallback to default fixtures
    }
    return structuredClone(INITIAL_MOCK_BATCHES);
  }

  private loadApplicationsFromStorage(): StudentApplicationRecord[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as StudentApplicationRecord[];
        }
      }
    } catch {
      // Fallback to default fixtures
    }
    return structuredClone(INITIAL_MOCK_APPLICATIONS);
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.batches));
          window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(this.applications));
        }
        window.dispatchEvent(new CustomEvent('jat-repository-updated'));
      }
    } catch {
      // Ignore storage errors in test environments
    }
  }

  /**
   * EP-JAT-11 (BLG-JAT-039, BR-33, BR-43, DSN-TBD-02):
   * Prototype Actor Role & Session Management.
   * Defaults to 'Admin (Talent Support)' for backward compatibility.
   */
  public getActiveRole(): PrototypeActorRole {
    return this.activeRole;
  }

  public setActiveRole(role: PrototypeActorRole): void {
    this.activeRole = role;
  }

  public getActiveStudentId(): string {
    return this.activeStudentId;
  }

  public setActiveStudentId(studentId: string): void {
    this.activeStudentId = studentId;
  }

  public resetActiveSession(): void {
    this.activeRole = 'Admin (Talent Support)';
    this.activeStudentId = 'stu-1';
  }

  /**
   * Enforces role authorization for administrative JAT actions.
   * Both 'Admin (Talent Support)' and 'Super Admin' are authorized (DSN-TBD-02, BR-43).
   * 'Student' is unauthorized (BR-30, BR-33).
   */
  public assertAdminAccess(
    actorRole?: PrototypeActorRole,
    actionDescription = 'tindakan ini'
  ): PrototypeActorRole {
    const role = actorRole ?? this.activeRole;
    if (role !== 'Admin (Talent Support)' && role !== 'Super Admin') {
      throw new Error(
        `Akses ditolak (BR-33 / BR-43): Hanya peran Admin (Talent Support) atau Super Admin yang berwenang melakukan ${actionDescription}.`
      );
    }
    return role;
  }

  /**
   * Enforces that a Student can only view and act on their own synthetic submission data (BR-33).
   */
  public assertStudentOwnership(
    targetStudentId: string,
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string },
    actionDescription = 'mengakses dan mengelola pengajuan lamaran miliknya sendiri'
  ): void {
    const role = options?.actorRole ?? this.activeRole;
    const sessionStudentId = options?.sessionStudentId ?? this.activeStudentId;
    if (role === 'Student' && sessionStudentId && sessionStudentId !== targetStudentId) {
      throw new Error(
        `Akses ditolak (BR-33): Mahasiswa hanya berhak ${actionDescription}.`
      );
    }
  }

  public resetToDefault(): JatBatch[] {
    this.batches = structuredClone(INITIAL_MOCK_BATCHES);
    this.studentDirectory = structuredClone(MOCK_STUDENT_DIRECTORY);
    this.applications = structuredClone(INITIAL_MOCK_APPLICATIONS);
    this.activeRole = 'Admin (Talent Support)';
    this.activeStudentId = 'stu-1';
    this.persist();
    return this.listBatches();
  }

  public resetToDefaults(): JatBatch[] {
    return this.resetToDefault();
  }

  public listBootcampCohorts(): BootcampCohortOption[] {
    return structuredClone(MOCK_BOOTCAMP_COHORTS);
  }

  /**
   * EP-JAT-02: Returns synthetic Bootcamp Students from the standalone Student Directory.
   * Supports searching by name/email and filtering by cohort or readiness badge.
   */
  public listDirectoryStudents(options?: {
    searchQuery?: string;
    cohortId?: string;
    readinessBadge?: ReadinessBadge | 'all';
  }): StudentIdentity[] {
    let result = structuredClone(this.studentDirectory);

    if (options?.cohortId && options.cohortId !== 'all') {
      result = result.filter((s) => s.bootcampCohortId === options.cohortId);
    }

    if (options?.readinessBadge && options.readinessBadge !== 'all') {
      result = result.filter((s) => s.readinessBadge === options.readinessBadge);
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.baseProgram.toLowerCase().includes(q) ||
          s.bootcampCohortName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getStudentIdentityById(studentId: string): StudentIdentity | undefined {
    const found = this.studentDirectory.find((s) => s.id === studentId);
    return found ? structuredClone(found) : undefined;
  }

  public listBatches(searchQuery?: string): JatBatch[] {
    const all = structuredClone(this.batches);
    if (!searchQuery || !searchQuery.trim()) {
      return all;
    }
    const q = searchQuery.trim().toLowerCase();
    return all.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.affiliatedCohorts.some((c) => c.name.toLowerCase().includes(q))
    );
  }

  public getBatchById(id: string): JatBatch | undefined {
    const found = this.batches.find((b) => b.id === id);
    return found ? structuredClone(found) : undefined;
  }

  /**
   * EP-JAT-02 (BLG-JAT-006):
   * Lists and filters participants belonging to a specific batch using fields available in the data model.
   */
  public listParticipantsInBatch(
    batchId: string,
    filter?: ParticipantFilterOptions
  ): StudentParticipant[] {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    let list = structuredClone(batch.participants);

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.baseProgram.toLowerCase().includes(q) ||
          p.bootcampCohortName.toLowerCase().includes(q)
      );
    }

    if (filter?.pacingStatuses && filter.pacingStatuses.length > 0) {
      list = list.filter((p) => filter.pacingStatuses!.includes(p.pacingStatus));
    }

    if (filter?.baseProgram && filter.baseProgram !== 'all') {
      list = list.filter((p) => p.baseProgram === filter.baseProgram);
    }

    if (filter?.bootcampCohortId && filter.bootcampCohortId !== 'all') {
      list = list.filter((p) => p.bootcampCohortId === filter.bootcampCohortId);
    }

    if (filter?.quotaRange && filter.quotaRange !== 'all') {
      list = list.filter((p) => {
        const pct =
          p.phase1TargetCount > 0
            ? Math.round((p.phase1CompletedCount / p.phase1TargetCount) * 100)
            : 0;
        if (filter.quotaRange === 'lt50') return pct < 50;
        if (filter.quotaRange === '50to79') return pct >= 50 && pct <= 79;
        if (filter.quotaRange === 'gte80') return pct >= 80;
        return true;
      });
    }

    return list;
  }

  public getParticipantInBatch(
    batchId: string,
    studentId: string
  ): StudentParticipant | undefined {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return undefined;
    const participant = batch.participants.find((p) => p.id === studentId);
    return participant ? structuredClone(participant) : undefined;
  }

  /**
   * EP-JAT-02 (BLG-JAT-006 & BLG-JAT-007):
   * Enrolls one or more existing synthetic Students into a JAT Batch.
   * Rejects duplicate membership in the same batch and initializes derived targets consistently.
   */
  public addParticipantsToBatch(
    batchId: string,
    candidateStudentIds: string[],
    options?: { actorRole?: PrototypeActorRole }
  ): JatBatch {
    this.assertAdminAccess(
      options?.actorRole,
      'penambahan peserta ke batch JAT'
    );

    const index = this.batches.findIndex((b) => b.id === batchId);
    if (index === -1) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    const batch = this.batches[index];
    const check = validateParticipantAddition(batch, candidateStudentIds, this.studentDirectory);
    if (!check.valid) {
      throw new Error(check.error || 'Gagal menambahkan mahasiswa ke batch.');
    }

    const uniqueIds = Array.from(new Set(candidateStudentIds.map((id) => id.trim()).filter(Boolean)));
    const p1Target = calculatePhaseTotalTarget(batch.phase1);
    const p2Target = calculatePhaseTotalTarget(batch.phase2);
    const now = new Date().toISOString();

    const newMemberships: StudentParticipant[] = uniqueIds.map((studentId) => {
      const identity = this.studentDirectory.find((s) => s.id === studentId)!;
      // Check if there are any preserved historical approved applications for this student in this batch
      const preservedApprovedP1 = this.applications.filter(
        (a) =>
          a.batchId === batchId &&
          a.studentId === studentId &&
          a.phaseNumber === 1 &&
          a.validationStatus === 'Approved'
      ).length;
      const preservedApprovedP2 = this.applications.filter(
        (a) =>
          a.batchId === batchId &&
          a.studentId === studentId &&
          a.phaseNumber === 2 &&
          a.validationStatus === 'Approved'
      ).length;

      const ratio = p1Target > 0 ? preservedApprovedP1 / p1Target : 0;
      const pacingStatus: ParticipantPacingStatus =
        p1Target > 0 && preservedApprovedP1 >= p1Target
          ? 'Completed'
          : ratio >= 0.7
            ? 'On Track'
            : 'Needs Reminder';

      return {
        ...structuredClone(identity),
        phase1CompletedCount: preservedApprovedP1,
        phase1TargetCount: p1Target,
        phase2CompletedCount: preservedApprovedP2,
        phase2TargetCount: p2Target,
        pacingStatus,
        enrolledAt: now,
      };
    });

    const updatedBatch: JatBatch = {
      ...batch,
      participants: [...batch.participants, ...newMemberships],
      updatedAt: now,
    };

    this.batches[index] = updatedBatch;
    this.persist();
    return structuredClone(updatedBatch);
  }

  /**
   * EP-JAT-02 (BLG-JAT-006, BLG-JAT-007, BR-09, JAT-BL-16):
   * Removes a participant's membership from a JAT Batch only after explicit confirmation.
   * Does NOT delete the underlying StudentIdentity in `this.studentDirectory` or historical
   * submissions in `this.applications`.
   */
  public removeParticipantFromBatch(
    batchId: string,
    studentId: string,
    confirmed: boolean,
    options?: { actorRole?: PrototypeActorRole }
  ): JatBatch {
    this.assertAdminAccess(
      options?.actorRole,
      'penghapusan peserta dari batch JAT'
    );

    if (!confirmed) {
      throw new Error(
        'Penghapusan peserta dibatalkan: konfirmasi eksplisit diperlukan (BR-09).'
      );
    }

    const index = this.batches.findIndex((b) => b.id === batchId);
    if (index === -1) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    const batch = this.batches[index];
    const exists = batch.participants.some((p) => p.id === studentId);
    if (!exists) {
      throw new Error('Peserta tidak ditemukan di dalam batch ini.');
    }

    const now = new Date().toISOString();
    const updatedBatch: JatBatch = {
      ...batch,
      participants: batch.participants.filter((p) => p.id !== studentId),
      updatedAt: now,
    };

    this.batches[index] = updatedBatch;
    this.persist();
    return structuredClone(updatedBatch);
  }

  /**
   * EP-JAT-02 & EP-JAT-09 (BLG-JAT-031..034, JAT-BL-12, BR-31):
   * Lists synthetic application records for a Student in a Batch with support for
   * case-insensitive search and single/combined filtering by Phase, Date Range, and Validation Status.
   * Records remain archived even if the student is removed from the batch.
   */
  public listStudentApplications(
    batchId: string,
    studentId: string,
    filterOrSearch?: string | StudentApplicationFilterOptions,
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string }
  ): StudentApplicationRecord[] {
    this.assertStudentOwnership(
      studentId,
      options,
      'mengakses dan mengelola pengajuan lamaran miliknya sendiri'
    );

    let records = this.applications
      .filter((a) => a.batchId === batchId && a.studentId === studentId)
      .map((a) => structuredClone(a));

    const filter: StudentApplicationFilterOptions =
      typeof filterOrSearch === 'string'
        ? { searchQuery: filterOrSearch }
        : filterOrSearch ?? {};

    if (filter.phaseNumber && filter.phaseNumber !== 'all') {
      records = records.filter(
        (r) => r.phaseNumber === Number(filter.phaseNumber)
      );
    }

    if (filter.dateRange && filter.dateRange !== 'all') {
      records = records.filter(
        (r) =>
          r.dateRangeId === filter.dateRange ||
          r.dateRangeLabel === filter.dateRange
      );
    }

    if (filter.validationStatus && filter.validationStatus !== 'all') {
      records = records.filter(
        (r) => r.validationStatus === filter.validationStatus
      );
    }

    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      records = records.filter(
        (r) =>
          r.company.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.jobLevel.toLowerCase().includes(q) ||
          r.position.toLowerCase().includes(q) ||
          r.workSystem.toLowerCase().includes(q)
      );
    }

    return records;
  }

  public createBatch(
    input: CreateOrUpdateBatchInput,
    options?: { actorRole?: PrototypeActorRole }
  ): JatBatch {
    this.assertAdminAccess(
      options?.actorRole,
      'pembuatan batch JAT'
    );

    const validation = validateBatchInput(input, this.batches);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] || 'Data batch tidak valid.';
      throw new Error(firstError);
    }

    const affiliatedCohorts = MOCK_BOOTCAMP_COHORTS.filter((c) =>
      input.affiliatedCohortIds.includes(c.id)
    );

    const now = new Date().toISOString();
    const newBatch: JatBatch = {
      id: `jat-batch-${Date.now()}`,
      name: input.name.trim(),
      status: 'Active',
      affiliatedCohorts,
      phase1: structuredClone(input.phase1),
      phase2: structuredClone(input.phase2),
      participants: [],
      createdAt: now,
      updatedAt: now,
    };

    newBatch.phase1.dateRanges = deduplicateDateRanges(newBatch.phase1.dateRanges).map(
      (r, idx) => ({
        ...r,
        label: r.label || `Date Range ${idx + 1}`,
      })
    );
    if (newBatch.phase2.enabled) {
      newBatch.phase2.dateRanges = deduplicateDateRanges(newBatch.phase2.dateRanges).map(
        (r, idx) => ({
          ...r,
          label: r.label || `Date Range ${idx + 1}`,
        })
      );
    } else {
      newBatch.phase2.dateRanges = [];
    }

    this.batches.unshift(newBatch);
    this.persist();
    return structuredClone(newBatch);
  }

  /**
   * EP-JAT-10 (BLG-JAT-037, BR-08, BR-29):
   * Previews the consequential impact of editing a batch's date ranges or targets
   * before committing changes.
   */
  public previewBatchEditImpact(
    batchId: string,
    nextInput: CreateOrUpdateBatchInput
  ): ConsequentialBatchEditImpact | undefined {
    const existing = this.batches.find((b) => b.id === batchId);
    if (!existing) return undefined;
    const batchApps = this.applications.filter((a) => a.batchId === batchId);
    return computeConsequentialBatchEditImpact(existing, nextInput, batchApps);
  }

  /**
   * EP-JAT-10 (BLG-JAT-035, BLG-JAT-036, JAT-BL-15, BR-28):
   * Computes the batch monitoring summary directly from stored batch, participant,
   * and application records without hardcoded metrics.
   */
  public getBatchMonitoringSummary(batchId: string): BatchMonitoringSummary | undefined {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return undefined;
    const batchApps = this.applications.filter((a) => a.batchId === batchId);
    return computeBatchMonitoringSummary(batch, batchApps);
  }

  public updateBatch(
    batchId: string,
    input: CreateOrUpdateBatchInput,
    options?: UpdateBatchOptions
  ): JatBatch {
    this.assertAdminAccess(
      options?.actorRole,
      'pembaruan konfigurasi batch JAT'
    );

    const index = this.batches.findIndex((b) => b.id === batchId);
    if (index === -1) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    const existing = this.batches[index];
    const batchApps = this.applications.filter((a) => a.batchId === batchId);
    const impact = computeConsequentialBatchEditImpact(existing, input, batchApps);

    // BR-08: Consequential edits to date ranges or targets require confirmation
    if (impact.isConsequential && options?.confirmedConsequentialImpact === false) {
      throw new Error(
        'Perubahan periode atau target yang berdampak pada peserta wajib dikonfirmasi terlebih dahulu (BR-08 / JAT-BL-14).'
      );
    }

    const validation = validateBatchInput(input, this.batches, batchId);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] || 'Data batch tidak valid.';
      throw new Error(firstError);
    }

    const affiliatedCohorts = MOCK_BOOTCAMP_COHORTS.filter((c) =>
      input.affiliatedCohortIds.includes(c.id)
    );

    // BR-42: Snapshot historical date-range validity for existing submissions before applying new date ranges
    if (impact.hasDateRangeChanges) {
      for (const app of this.applications) {
        if (app.batchId !== batchId || app.submittedDateRangeWindow) continue;
        const oldPhase = app.phaseNumber === 2 ? existing.phase2 : existing.phase1;
        const oldRange =
          oldPhase.dateRanges.find((r) => r.id === app.dateRangeId) ??
          oldPhase.dateRanges.find((r) => r.label === app.dateRangeLabel) ??
          oldPhase.dateRanges[0];
        if (
          oldRange &&
          app.dateApplied >= oldRange.startDate &&
          app.dateApplied <= oldRange.endDate
        ) {
          app.submittedDateRangeWindow = {
            startDate: oldRange.startDate,
            endDate: oldRange.endDate,
          };
        }
      }
    }

    const phase1 = structuredClone(input.phase1);
    const phase2 = structuredClone(input.phase2);

    phase1.dateRanges = deduplicateDateRanges(phase1.dateRanges).map((r, idx) => ({
      ...r,
      label: `Date Range ${idx + 1}`,
    }));
    if (phase2.enabled) {
      phase2.dateRanges = deduplicateDateRanges(phase2.dateRanges).map((r, idx) => ({
        ...r,
        label: `Date Range ${idx + 1}`,
      }));
    } else {
      phase2.dateRanges = [];
    }

    // BR-08 & BR-29: Synchronize participant target counts and completed counts when phase targets change
    const p1Target = calculatePhaseTotalTarget(phase1);
    const p2Target = calculatePhaseTotalTarget(phase2);

    const updatedParticipants = existing.participants.map((p) => {
      const syncedCounts = computeParticipantPhaseCompletedCounts(
        p,
        batchApps,
        PROGRESS_CALCULATION_POLICY.activeMode
      );
      const nextPacing = evaluateParticipantPacingStatus(
        syncedCounts.phase1CompletedCount,
        p1Target,
        syncedCounts.phase2CompletedCount,
        p2Target,
        phase2.enabled
      );
      return {
        ...p,
        phase1CompletedCount: syncedCounts.phase1CompletedCount,
        phase1TargetCount: p1Target,
        phase2CompletedCount: syncedCounts.phase2CompletedCount,
        phase2TargetCount: p2Target,
        pacingStatus: nextPacing,
      };
    });

    const now = new Date().toISOString();
    const updated: JatBatch = {
      ...existing,
      name: input.name.trim(),
      affiliatedCohorts,
      phase1,
      phase2,
      participants: updatedParticipants,
      lastRecalculatedAt: now,
      lastRecalculatedBy: 'Admin (Auto-sync on Schedule Edit)',
      updatedAt: now,
    };

    this.batches[index] = updated;
    this.persist();
    return structuredClone(updated);
  }

  /**
   * BR-09 & DSN-TBD-05: Delete batch only after exact batch name confirmation.
   */
  public deleteBatch(
    batchId: string,
    typedConfirmationName: string,
    options?: { actorRole?: PrototypeActorRole }
  ): void {
    this.assertAdminAccess(
      options?.actorRole,
      'penghapusan batch JAT'
    );

    const existing = this.batches.find((b) => b.id === batchId);
    if (!existing) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    const check = validateBatchDeleteConfirmation(existing.name, typedConfirmationName);
    if (!check.valid) {
      throw new Error(check.error);
    }

    this.batches = this.batches.filter((b) => b.id !== batchId);
    this.persist();
  }

  /**
   * EP-JAT-10 (BLG-JAT-036, BLG-JAT-037, BR-29, BR-30, BR-43, DSN-TBD-02):
   * Executes batch progress recalculation with role enforcement and returns a detailed
   * execution report distinguishing `'updated'` vs `'no-op'` states.
   */
  public recalculateBatchProgressWithReport(
    batchId: string,
    actorRole: PrototypeActorRole | string = 'Admin (Talent Support)'
  ): RecalculationExecutionReport {
    if (actorRole !== 'Admin (Talent Support)' && actorRole !== 'Super Admin') {
      throw new Error(
        'Akses ditolak (BR-30 / BR-43): Hanya peran Admin (Talent Support) atau Super Admin yang diizinkan menjalankan Recalculate Progress.'
      );
    }

    const index = this.batches.findIndex((b) => b.id === batchId);
    if (index === -1) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    const batch = this.batches[index];
    const batchApps = this.applications.filter((a) => a.batchId === batchId);

    const rawP1Len = batch.phase1.dateRanges.length;
    const rawP2Len = batch.phase2.enabled ? batch.phase2.dateRanges.length : 0;

    const dedupedP1Ranges = deduplicateDateRanges(batch.phase1.dateRanges).map((r, idx) => ({
      ...r,
      label: r.label || `Date Range ${idx + 1}`,
    }));
    const dedupedP2Ranges = batch.phase2.enabled
      ? deduplicateDateRanges(batch.phase2.dateRanges).map((r, idx) => ({
          ...r,
          label: r.label || `Date Range ${idx + 1}`,
        }))
      : [];

    const deduplicatedRangesCount =
      Math.max(0, rawP1Len - dedupedP1Ranges.length) +
      Math.max(0, rawP2Len - dedupedP2Ranges.length);

    const nextPhase1 = { ...batch.phase1, dateRanges: dedupedP1Ranges };
    const nextPhase2 = { ...batch.phase2, dateRanges: dedupedP2Ranges };

    const p1Target = calculatePhaseTotalTarget(nextPhase1);
    const p2Target = calculatePhaseTotalTarget(nextPhase2);

    let changedParticipantCount = 0;
    const updatedParticipants = batch.participants.map((p) => {
      const syncedCounts = computeParticipantPhaseCompletedCounts(
        p,
        batchApps,
        PROGRESS_CALCULATION_POLICY.activeMode
      );
      const nextPacing = evaluateParticipantPacingStatus(
        syncedCounts.phase1CompletedCount,
        p1Target,
        syncedCounts.phase2CompletedCount,
        p2Target,
        nextPhase2.enabled
      );

      const didChange =
        p.phase1CompletedCount !== syncedCounts.phase1CompletedCount ||
        p.phase1TargetCount !== p1Target ||
        p.phase2CompletedCount !== syncedCounts.phase2CompletedCount ||
        p.phase2TargetCount !== p2Target ||
        p.pacingStatus !== nextPacing;

      if (didChange) {
        changedParticipantCount += 1;
      }

      return {
        ...p,
        phase1CompletedCount: syncedCounts.phase1CompletedCount,
        phase1TargetCount: p1Target,
        phase2CompletedCount: syncedCounts.phase2CompletedCount,
        phase2TargetCount: p2Target,
        pacingStatus: nextPacing,
      };
    });

    const now = new Date().toISOString();
    const isUpdated = changedParticipantCount > 0 || deduplicatedRangesCount > 0;
    const status: 'updated' | 'no-op' = isUpdated ? 'updated' : 'no-op';

    const updated: JatBatch = {
      ...batch,
      phase1: nextPhase1,
      phase2: nextPhase2,
      participants: updatedParticipants,
      lastRecalculatedAt: now,
      lastRecalculatedBy: actorRole,
      updatedAt: now,
    };

    this.batches[index] = updated;
    this.persist();

    const message = isUpdated
      ? `Progres seluruh siswa (${updated.participants.length} peserta) berhasil dihitung ulang oleh Admin — ${changedParticipantCount} data peserta diperbarui${deduplicatedRangesCount > 0 ? ` dan ${deduplicatedRangesCount} rentang duplikat dibersihkan` : ''}.`
      : `Progres seluruh siswa (${updated.participants.length} peserta) berhasil dihitung ulang oleh Admin — seluruh data target & progres sudah sinkron (tidak ada perubahan nilai / No-Op).`;

    return {
      status,
      batch: structuredClone(updated),
      changedParticipantCount,
      deduplicatedRangesCount,
      actorRole: actorRole as PrototypeActorRole,
      recalculatedAt: now,
      message,
    };
  }

  /**
   * DSN-TBD-02 & BR-30 & BR-43:
   * Both Admin (Talent Support) and Super Admin have authority to Recalculate Progress.
   */
  public recalculateBatchProgress(
    batchId: string,
    actorRole: PrototypeActorRole | string = 'Admin (Talent Support)'
  ): JatBatch {
    return this.recalculateBatchProgressWithReport(batchId, actorRole).batch;
  }

  /**
   * EP-JAT-03 (BLG-JAT-009..011, BR-06):
   * Returns all JAT batches where the specified synthetic Student is an enrolled participant.
   * Uses the exact same batch/phase/date-range objects configured by Admin (BR-06, JAT-BL-14).
   */
  public listBatchesForStudent(
    studentId: string,
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string }
  ): JatBatch[] {
    this.assertStudentOwnership(
      studentId,
      options,
      'melihat daftar batch miliknya sendiri'
    );

    if (!studentId || !studentId.trim()) return [];
    const matched = this.batches.filter((b) =>
      b.participants.some((p) => p.id === studentId)
    );
    return structuredClone(matched).map((b) => ({
      ...b,
      phase1: {
        ...b.phase1,
        dateRanges: deduplicateDateRanges(b.phase1.dateRanges),
      },
      phase2: {
        ...b.phase2,
        dateRanges: b.phase2.enabled ? deduplicateDateRanges(b.phase2.dateRanges) : [],
      },
    }));
  }

  /**
   * EP-JAT-03 (BLG-JAT-009..012, BR-03..BR-08, BR-28):
   * Builds a unified Student View model for a specific batch and student relative to `referenceDate`.
   * - Uses the single shared Admin batch configuration (`phase1`, `phase2`, `dateRanges`, `targets`).
   * - Deduplicates date ranges (`JAT-BL-14`).
   * - Computes progress strictly from the participant's stored progress counters (`phase1CompletedCount`,
   *   `phase2CompletedCount`) and configured targets rather than deriving progress from validation statuses
   *   or conflating with recruitment progress (`BR-28`).
   */
  public getStudentBatchView(
    batchId: string,
    studentId: string,
    referenceDate = '2025-03-10',
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string }
  ): StudentBatchViewModel | undefined {
    this.assertStudentOwnership(
      studentId,
      options,
      'mengakses progres dan pengajuan lamaran miliknya sendiri'
    );

    const rawBatch = this.batches.find((b) => b.id === batchId);
    if (!rawBatch) return undefined;

    const rawParticipant = rawBatch.participants.find((p) => p.id === studentId);
    if (!rawParticipant) return undefined;

    const batch = structuredClone(rawBatch);
    batch.phase1.dateRanges = deduplicateDateRanges(batch.phase1.dateRanges);
    batch.phase2.dateRanges = batch.phase2.enabled
      ? deduplicateDateRanges(batch.phase2.dateRanges)
      : [];

    const participant = structuredClone(rawParticipant);
    const access = evaluateBatchAccess(batch, referenceDate);

    // Ensure target counts match current phase definitions (BR-06, BR-29)
    const p1TotalTarget = access.phase1Access.totalTargetCount;
    const p2TotalTarget = access.phase2Access.totalTargetCount;

    participant.phase1TargetCount = p1TotalTarget;
    participant.phase2TargetCount = p2TotalTarget;

    const phase1 = this.buildStudentPhaseProgress(
      access.phase1Access,
      participant.phase1CompletedCount
    );
    const phase2 = this.buildStudentPhaseProgress(
      access.phase2Access,
      participant.phase2CompletedCount
    );

    const overallCompletedCount = phase1.completedCount + phase2.completedCount;
    const overallTargetCount = phase1.totalTargetCount + phase2.totalTargetCount;
    const overallPercentage =
      overallTargetCount > 0
        ? Math.min(100, Math.round((overallCompletedCount / overallTargetCount) * 100))
        : 0;

    const applications = this.listStudentApplications(batchId, studentId, undefined, options);

    return {
      batch,
      participant,
      referenceDate,
      access,
      phase1,
      phase2,
      overallCompletedCount,
      overallTargetCount,
      overallPercentage,
      applications,
    };
  }

  private buildStudentPhaseProgress(
    phaseAccess: PhaseAccessEvaluation,
    phaseCompletedCount: number
  ): StudentPhaseProgress {
    let remaining = Math.max(0, phaseCompletedCount);

    const dateRanges: StudentDateRangeProgress[] = phaseAccess.dateRanges.map((range) => {
      let rangeCompleted = 0;
      const targetProgress: StudentTargetProgressItem[] = range.targets.map(
        (target, idx, arr) => {
          const cap = Math.max(0, target.targetCount);
          let allocated = 0;
          if (remaining >= cap) {
            allocated = cap;
          } else if (remaining > 0) {
            // If there are multiple remaining targets in this range and remaining < cap,
            // distribute smoothly across targets in the range
            const remainingTargetsInRange = arr.length - idx;
            if (remainingTargetsInRange > 1 && remaining > 1) {
              allocated = Math.min(cap, Math.ceil(remaining / remainingTargetsInRange));
            } else {
              allocated = Math.min(cap, remaining);
            }
          }
          remaining = Math.max(0, remaining - allocated);
          rangeCompleted += allocated;

          return {
            id: target.id,
            jobLevel: target.jobLevel,
            completedCount: allocated,
            targetCount: cap,
          };
        }
      );

      return {
        ...range,
        completedCount: rangeCompleted,
        targetProgress,
      };
    });

    return {
      ...phaseAccess,
      completedCount: Math.max(0, phaseCompletedCount),
      dateRanges,
    };
  }

  /**
   * EP-JAT-04 (BLG-JAT-013..016, BR-07, BR-10..BR-15, BR-45, DSN-TBD-04):
   * Validates and persists a Student's job application submission in the prototype repository.
   * - Enforces active submission window on `referenceDate` (BR-07).
   * - Validates all 10 required fields, non-future `dateApplied` (BR-13), and evidence file format/MIME (BR-11, BR-12).
   * - Assigns initial status `'Waiting Confirmation'` when `dateApplied` is inside an active range
   *   (BR-15: upload means evidence was received for processing, NOT approved).
   * - Assigns initial status `'Rejected'` when `dateApplied` is outside the active date range
   *   per Confirmed Decision `DSN-TBD-04` and `BR-45`.
   */
  public submitStudentApplication(
    input: CreateStudentApplicationInput,
    referenceDate = '2025-03-10',
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string }
  ): StudentApplicationRecord {
    this.assertStudentOwnership(
      input.studentId,
      options,
      'tidak diizinkan mengajukan lamaran atas nama mahasiswa lain'
    );

    const batch = this.batches.find((b) => b.id === input.batchId);
    if (!batch) {
      throw new Error('Batch JAT tidak ditemukan.');
    }

    const isEnrolled = batch.participants.some((p) => p.id === input.studentId);
    if (!isEnrolled) {
      throw new Error('Mahasiswa tidak terdaftar pada batch JAT ini.');
    }

    const access = evaluateBatchAccess(batch, referenceDate);
    if (!access.canSubmitApplication) {
      throw new Error(
        access.accessMessage ||
          'Pengajuan lamaran tidak diizinkan di luar periode aktif batch (BR-07).'
      );
    }

    const validation = validateStudentApplicationSubmission(input, batch, referenceDate);
    if (!validation.valid) {
      const firstError =
        Object.values(validation.errors)[0] || 'Data pengajuan lamaran tidak valid.';
      throw new Error(firstError);
    }

    const now = new Date().toISOString();
    const matchedPhaseCfg =
      validation.matchedPhaseNumber === 2 ? batch.phase2 : batch.phase1;
    const matchedRangeCfg = matchedPhaseCfg.dateRanges.find(
      (r) => r.id === validation.matchedDateRangeId
    );
    const submittedDateRangeWindow =
      validation.initialValidationStatus !== 'Rejected' &&
      matchedRangeCfg &&
      input.dateApplied.trim() >= matchedRangeCfg.startDate &&
      input.dateApplied.trim() <= matchedRangeCfg.endDate
        ? {
            startDate: matchedRangeCfg.startDate,
            endDate: matchedRangeCfg.endDate,
          }
        : undefined;

    const newRecord: StudentApplicationRecord = {
      id: `app-${Date.now()}-${this.applications.length + 1}`,
      batchId: input.batchId,
      studentId: input.studentId,
      phaseNumber: validation.matchedPhaseNumber,
      dateRangeId: validation.matchedDateRangeId,
      dateRangeLabel: validation.matchedDateRangeLabel,
      dateApplied: input.dateApplied.trim(),
      createdAt: now,
      role: input.role.trim(),
      company: input.company.trim(),
      location: input.location.trim(),
      position: input.position as PositionType,
      jobLevel: input.jobLevel as JobLevel,
      workSystem: input.workSystem as WorkSystem,
      yearsOfExperience: input.yearsOfExperience.trim(),
      vacancyUrl: input.vacancyUrl.trim(),
      evidenceFileName: input.evidenceFile!.name.trim(),
      evidenceFileSize: input.evidenceFile!.size,
      evidenceMimeType: input.evidenceFile!.type,
      validationStatus: validation.initialValidationStatus,
      rejectionReason: validation.autoRejectionReason,
      validationSource:
        validation.initialValidationStatus === 'Rejected'
          ? 'Simulated Rule Check (Mock)'
          : 'Pending Verification',
      recruitmentStage: input.recruitmentStage ?? 'Applied',
      submittedDateRangeWindow,
    };

    this.applications.unshift(newRecord);
    this.persist();
    return structuredClone(newRecord);
  }

  /**
   * EP-JAT-07 (BLG-JAT-025, BR-33):
   * Retrieves a single application record strictly scoped to the requesting `batchId` and `studentId`.
   * Never exposes submission/evidence details belonging to another Student (`BR-33`).
   */
  public getStudentApplicationById(
    batchId: string,
    studentId: string,
    applicationId: string,
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string }
  ): StudentApplicationRecord | undefined {
    this.assertStudentOwnership(
      studentId,
      options,
      'mengakses dan mengelola pengajuan lamaran miliknya sendiri'
    );

    if (!batchId || !studentId || !applicationId) return undefined;
    const found = this.applications.find(
      (app) =>
        app.id === applicationId &&
        app.batchId === batchId &&
        app.studentId === studentId
    );
    return found ? structuredClone(found) : undefined;
  }

  /**
   * EP-JAT-07 & EP-JAT-08 (BLG-JAT-025, BLG-JAT-029, BR-22, BR-24, BR-25, BR-28, BR-29, BR-33, BR-37, BR-43, DSN-TBD-02, DSN-TBD-03):
   * Persists a validation status update and traceable human-review metadata in the prototype repository.
   * - Enforces prototype role authorization (`Admin (Talent Support)` or `Super Admin` — BR-33, BR-43, DSN-TBD-02).
   * - Requires an explicit `rejectionReason` when transitioning to `'Rejected'` (`BR-24`, `DSN-TBD-03`).
   * - Records traceable human-review history (`reviewHistory` — `BR-25`) without inventing personal reviewer names or server timestamps.
   * - Synchronizes participant completed counters when transitioning to/from `'Approved'` (`BR-29`).
   * - Preserves external `recruitmentStage` unchanged (`BR-28`: validation status never replaces recruitment progress).
   */
  public updateApplicationValidationStatus(
    applicationId: string,
    input: UpdateApplicationValidationInput
  ): StudentApplicationRecord {
    const actorRole: PrototypeActorRole = input.actorRole ?? 'Admin (Talent Support)';
    if (actorRole !== 'Admin (Talent Support)' && actorRole !== 'Super Admin') {
      throw new Error(
        'Akses ditolak: Hanya peran Admin (Talent Support) atau Super Admin yang berwenang mengubah status validasi JAT (BR-33 / BR-43).'
      );
    }

    const index = this.applications.findIndex((a) => a.id === applicationId);
    if (index === -1) {
      throw new Error('Data pengajuan lamaran tidak ditemukan.');
    }

    const existing = this.applications[index];
    const prevStatus = existing.validationStatus;
    const nextStatus = input.validationStatus;

    if (
      nextStatus !== 'Approved' &&
      nextStatus !== 'Rejected' &&
      nextStatus !== 'Waiting Confirmation'
    ) {
      throw new Error(
        'Status validasi tidak valid. Gunakan Approved, Rejected, atau Waiting Confirmation (BR-22).'
      );
    }

    const trimmedReason = input.rejectionReason?.trim();
    if (nextStatus === 'Rejected' && !trimmedReason) {
      throw new Error(
        'Alasan penolakan (rejection reason) wajib diisi saat mengubah status menjadi Rejected (BR-24).'
      );
    }

    const isReviewed = nextStatus === 'Approved' || nextStatus === 'Rejected';
    const resolvedReviewedBy = isReviewed
      ? input.reviewedBy?.trim() || `${actorRole} (Simulasi Prototype)`
      : undefined;
    const resolvedReviewedAt = isReviewed
      ? input.reviewedAt?.trim() || undefined
      : undefined;
    const resolvedFeedback =
      input.reviewFeedback !== undefined
        ? input.reviewFeedback.trim() || undefined
        : existing.reviewFeedback;

    const existingHistory: HumanReviewHistoryEntry[] = existing.reviewHistory
      ? structuredClone(existing.reviewHistory)
      : [];

    if (isReviewed) {
      existingHistory.push({
        id: `rev-${existing.id}-${existingHistory.length + 1}`,
        action: nextStatus,
        resultingStatus: nextStatus,
        rejectionReason: nextStatus === 'Rejected' ? trimmedReason : undefined,
        reviewFeedback: resolvedFeedback,
        actorRole,
        reviewedBy: resolvedReviewedBy,
        reviewedAt: resolvedReviewedAt,
      });
    }

    const updatedRecord: StudentApplicationRecord = {
      ...existing,
      validationStatus: nextStatus,
      rejectionReason: nextStatus === 'Rejected' ? trimmedReason : undefined,
      reviewFeedback: resolvedFeedback,
      reviewedBy: resolvedReviewedBy,
      reviewedAt: resolvedReviewedAt,
      validationSource:
        input.validationSource ??
        (isReviewed
          ? 'Simulated Human Review (Talent Support)'
          : 'Pending Verification'),
      // BR-28: External recruitment stage is never overwritten by validation status changes
      recruitmentStage: existing.recruitmentStage,
      reviewHistory: existingHistory,
    };

    this.applications[index] = updatedRecord;

    // BR-29: Synchronize participant completed count in batch when transitioning to/from 'Approved'
    if (prevStatus !== nextStatus && (prevStatus === 'Approved' || nextStatus === 'Approved')) {
      const delta = nextStatus === 'Approved' ? 1 : -1;
      const batchIdx = this.batches.findIndex((b) => b.id === existing.batchId);
      if (batchIdx !== -1) {
        const batch = this.batches[batchIdx];
        const p1Target = calculatePhaseTotalTarget(batch.phase1);
        const p2Target = calculatePhaseTotalTarget(batch.phase2);
        const updatedParticipants = batch.participants.map((p) => {
          if (p.id !== existing.studentId) return p;
          const nextP1 =
            existing.phaseNumber === 1
              ? Math.max(0, p.phase1CompletedCount + delta)
              : p.phase1CompletedCount;
          const nextP2 =
            existing.phaseNumber === 2
              ? Math.max(0, p.phase2CompletedCount + delta)
              : p.phase2CompletedCount;
          const pacingStatus = evaluateParticipantPacingStatus(
            nextP1,
            p1Target,
            nextP2,
            p2Target,
            batch.phase2.enabled
          );

          return {
            ...p,
            phase1CompletedCount: nextP1,
            phase1TargetCount: p1Target,
            phase2CompletedCount: nextP2,
            phase2TargetCount: p2Target,
            pacingStatus,
          };
        });
        this.batches[batchIdx] = {
          ...batch,
          participants: updatedParticipants,
        };
      }
    }

    this.persist();
    return structuredClone(updatedRecord);
  }

  /**
   * EP-JAT-08 (BLG-JAT-027, BLG-JAT-028, DSN-TBD-06, BR-14, BR-18, BR-26, BR-39, BR-40):
   * Builds a rich Admin inspection model for a submission record, including:
   * - Batch, Phase, and Date Range context
   * - Deterministic date-window and evidence format verification (`BR-11`, `BR-14`, `BR-26`, `BR-42`)
   * - All 7 `BR-39` required attributes (`Date Applied`, `Role`, `Company`, `Location`, `Position`, `Job Level`, `Work System`)
   *   as confirmed in `DSN-TBD-06`. Unknown/unextracted attributes remain `null` / `Unverified` (`BR-18`).
   */
  private buildAdminRequestQueueItem(
    record: StudentApplicationRecord
  ): AdminRequestQueueItem {
    const batch = this.batches.find((b) => b.id === record.batchId);
    const studentFromBatch = batch?.participants.find((p) => p.id === record.studentId);
    const studentFromDir = this.studentDirectory.find((s) => s.id === record.studentId);

    const phaseConfig =
      record.phaseNumber === 2 ? batch?.phase2 : batch?.phase1;
    const matchedRange =
      phaseConfig?.dateRanges.find((r) => r.id === record.dateRangeId) ??
      phaseConfig?.dateRanges.find((r) => r.label === record.dateRangeLabel) ??
      phaseConfig?.dateRanges[0];

    const dateRangeStartDate = matchedRange?.startDate;
    const dateRangeEndDate = matchedRange?.endDate;

    const isWithinCurrentRange = Boolean(
      dateRangeStartDate &&
        dateRangeEndDate &&
        record.dateApplied >= dateRangeStartDate &&
        record.dateApplied <= dateRangeEndDate
    );

    // BR-42: A submission that was valid inside the configured date range when submitted
    // remains valid even if Admin later changes the date range.
    const isWithinHistoricalSubmittedRange = Boolean(
      record.submittedDateRangeWindow &&
        record.dateApplied >= record.submittedDateRangeWindow.startDate &&
        record.dateApplied <= record.submittedDateRangeWindow.endDate
    );

    const isWithinConfiguredDateRange =
      isWithinCurrentRange || isWithinHistoricalSubmittedRange;

    const evidenceCheck = validateEvidenceFile({
      name: record.evidenceFileName,
      size: record.evidenceFileSize ?? 1024,
      type:
        record.evidenceMimeType ??
        (record.evidenceFileName.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg'),
    });
    const isSupportedEvidenceFormat = evidenceCheck.valid;

    const baseFindings: IdpAttributeFinding[] = [
      {
        attributeKey: 'dateApplied',
        label: 'Date Applied',
        submittedValue: record.dateApplied,
        extractedValue: record.dateApplied,
        status: isWithinConfiguredDateRange ? 'Matched' : 'Mismatch',
        note: isWithinCurrentRange
          ? `Sesuai rentang aktif ${record.dateRangeLabel} (${dateRangeStartDate} – ${dateRangeEndDate}).`
          : isWithinHistoricalSubmittedRange
            ? `Sesuai rentang historis saat pengajuan (${record.submittedDateRangeWindow?.startDate} – ${record.submittedDateRangeWindow?.endDate}) — tetap valid pasca-perubahan jadwal (BR-42).`
            : `Di luar rentang tanggal aktif ${record.dateRangeLabel} (BR-14 / BR-45).`,
      },
      {
        attributeKey: 'role',
        label: 'Role',
        submittedValue: record.role,
        extractedValue: null,
        status: 'Unverified',
        note: 'Belum ada hasil ekstraksi otomatis — wajib diperiksa manual pada gambar bukti (BR-18).',
      },
      {
        attributeKey: 'company',
        label: 'Company',
        submittedValue: record.company,
        extractedValue: null,
        status: 'Unverified',
        note: 'Belum ada hasil ekstraksi otomatis — wajib diperiksa manual pada gambar bukti (BR-18).',
      },
      {
        attributeKey: 'location',
        label: 'Location',
        submittedValue: record.location,
        extractedValue: null,
        status: 'Unverified',
        note: 'Belum ada hasil ekstraksi otomatis — wajib diperiksa manual pada gambar bukti (BR-18).',
      },
      {
        attributeKey: 'position',
        label: 'Position',
        submittedValue: record.position,
        extractedValue: null,
        status: 'Unverified',
        note: 'Belum ada hasil ekstraksi otomatis — wajib diperiksa manual pada gambar bukti (BR-18).',
      },
      {
        attributeKey: 'jobLevel',
        label: 'Job Level',
        submittedValue: record.jobLevel,
        extractedValue: null,
        status: 'Unverified',
        note: 'Belum ada hasil ekstraksi otomatis — wajib diperiksa manual pada gambar bukti (BR-18).',
      },
      {
        attributeKey: 'workSystem',
        label: 'Work System',
        submittedValue: record.workSystem,
        extractedValue: null,
        status: 'Unverified',
        note: 'Belum ada hasil ekstraksi otomatis — wajib diperiksa manual pada gambar bukti (BR-18).',
      },
    ];

    const attributeChecklist: IdpAttributeFinding[] = baseFindings.map((baseItem) => {
      const recordedFinding = record.validationFindings?.find(
        (f) => f.attributeKey === baseItem.attributeKey
      );
      if (!recordedFinding) return baseItem;

      // BR-26: Deterministic date-range check always takes precedence over assistive findings
      if (baseItem.attributeKey === 'dateApplied' && !isWithinConfiguredDateRange) {
        return {
          ...structuredClone(recordedFinding),
          status: 'Mismatch',
          note: `Aturan Deterministik (BR-14 / BR-26): Date Applied (${record.dateApplied}) berada di luar rentang tanggal aktif.`,
        };
      }
      return structuredClone(recordedFinding);
    });

    return {
      application: structuredClone(record),
      batchId: record.batchId,
      batchName: batch?.name ?? record.batchId,
      studentId: record.studentId,
      studentName:
        studentFromBatch?.name ?? studentFromDir?.name ?? `Student (${record.studentId})`,
      studentEmail:
        studentFromBatch?.email ?? studentFromDir?.email ?? '-',
      bootcampCohortName:
        studentFromBatch?.bootcampCohortName ??
        studentFromDir?.bootcampCohortName ??
        '-',
      dateRangeStartDate,
      dateRangeEndDate,
      isWithinConfiguredDateRange,
      isSupportedEvidenceFormat,
      attributeChecklist,
    };
  }

  /**
   * EP-JAT-08 (BLG-JAT-027..029, BR-31, BR-32):
   * Returns only submissions currently in `'Waiting Confirmation'` status.
   * Once a record is reviewed (`Approved` or `Rejected`), it automatically leaves this queue
   * while remaining preserved in `this.applications`.
   */
  public listWaitingConfirmationRequests(
    filter?: RequestQueueFilterOptions,
    options?: { actorRole?: PrototypeActorRole }
  ): AdminRequestQueueItem[] {
    this.assertAdminAccess(
      options?.actorRole,
      'akses ke antrean verifikasi Request Admin'
    );

    let items = this.applications
      .filter((app) => app.validationStatus === 'Waiting Confirmation')
      .map((app) => this.buildAdminRequestQueueItem(app));

    if (filter?.batchId && filter.batchId !== 'all') {
      items = items.filter((item) => item.batchId === filter.batchId);
    }

    if (filter?.phaseNumber && filter.phaseNumber !== 'all') {
      items = items.filter(
        (item) => item.application.phaseNumber === Number(filter.phaseNumber)
      );
    }

    if (filter?.dateRangeId && filter.dateRangeId !== 'all') {
      items = items.filter(
        (item) =>
          item.application.dateRangeId === filter.dateRangeId ||
          item.application.dateRangeLabel === filter.dateRangeId
      );
    }

    if (filter?.jobLevel && filter.jobLevel !== 'all') {
      items = items.filter(
        (item) => item.application.jobLevel === filter.jobLevel
      );
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.studentEmail.toLowerCase().includes(q) ||
          item.batchName.toLowerCase().includes(q) ||
          item.application.company.toLowerCase().includes(q) ||
          item.application.role.toLowerCase().includes(q) ||
          item.application.location.toLowerCase().includes(q) ||
          item.application.jobLevel.toLowerCase().includes(q)
      );
    }

    return items;
  }

  /**
   * EP-JAT-08 (BLG-JAT-027, BLG-JAT-028):
   * Retrieves the full Admin HITL inspection view model for any application ID,
   * whether it is still in `Waiting Confirmation` or has already been reviewed (`Approved` / `Rejected`).
   */
  public getAdminApplicationInspectionById(
    applicationId: string,
    options?: { actorRole?: PrototypeActorRole }
  ): AdminRequestQueueItem | undefined {
    this.assertAdminAccess(
      options?.actorRole,
      'inspeksi bukti lamaran pada panel Admin'
    );

    if (!applicationId) return undefined;
    const found = this.applications.find((a) => a.id === applicationId);
    return found ? this.buildAdminRequestQueueItem(found) : undefined;
  }

  /**
   * EP-JAT-08 (BLG-JAT-028..030, BR-22..BR-26, BR-32..BR-34, BR-43, DSN-TBD-02, DSN-TBD-03):
   * Executes a Human-in-the-Loop (HITL) review decision on a Student submission.
   * - Requires authorized Admin role (`Admin (Talent Support)` or `Super Admin`).
   * - Requires explicit confirmation (`input.confirmed === true`).
   * - Enforces deterministic file-type and date-range rules (`BR-11`, `BR-14`, `BR-26`, `BR-45`) before allowing `'Approved'`.
   * - Enforces mandatory `rejectionReason` when `input.decision === 'Rejected'` (`BR-24`, `DSN-TBD-03`).
   * - Preserves the submission in `this.applications` after it leaves the `Waiting Confirmation` queue (`BR-32`).
   */
  public reviewApplicationRequest(
    applicationId: string,
    input: ReviewApplicationRequestInput
  ): StudentApplicationRecord {
    const actorRole: PrototypeActorRole = input.actorRole ?? 'Admin (Talent Support)';
    if (actorRole !== 'Admin (Talent Support)' && actorRole !== 'Super Admin') {
      throw new Error(
        'Akses ditolak: Hanya peran Admin (Talent Support) atau Super Admin yang berwenang meninjau Request JAT (BR-33 / BR-43).'
      );
    }

    if (!input.confirmed) {
      throw new Error(
        'Tindakan review dibatalkan: konfirmasi eksplisit diperlukan sebelum menyimpan keputusan.'
      );
    }

    const inspection = this.getAdminApplicationInspectionById(applicationId);
    if (!inspection) {
      throw new Error('Data pengajuan lamaran tidak ditemukan.');
    }

    // BR-26: Deterministic rules on file format and date range cannot be silently overridden when approving
    if (input.decision === 'Approved') {
      if (!inspection.isSupportedEvidenceFormat) {
        throw new Error(
          'Keputusan Approved ditolak oleh aturan deterministik (BR-11 / BR-26): Format berkas bukti harus JPG, JPEG, atau PNG.'
        );
      }
      if (!inspection.isWithinConfiguredDateRange) {
        throw new Error(
          'Keputusan Approved ditolak oleh aturan deterministik (BR-14 / BR-26 / BR-45): Date Applied berada di luar rentang tanggal batch yang berlaku.'
        );
      }
    }

    if (input.decision === 'Rejected') {
      const trimmedReason = input.rejectionReason?.trim() ?? '';
      if (!trimmedReason) {
        throw new Error(
          'Alasan penolakan (rejection reason) wajib diisi saat menolak Request JAT (BR-24).'
        );
      }
    }

    return this.updateApplicationValidationStatus(applicationId, {
      validationStatus: input.decision,
      rejectionReason: input.rejectionReason,
      reviewFeedback: input.reviewFeedback,
      actorRole,
      reviewedBy: input.reviewedBy,
      reviewedAt: input.reviewedAt,
      validationSource: 'Simulated Human Review (Talent Support)',
    });
  }

  /**
   * EP-JAT-07 & Stitch Screen `acd1310968e246268e1d56fea1c76283`:
   * Allows a Student to retract/delete their own application proof only after explicit confirmation,
   * and only if it has not already been locked as `'Approved'`.
   * Enforces BR-33 student ownership isolation.
   */
  public deleteStudentApplication(
    batchId: string,
    studentId: string,
    applicationId: string,
    confirmed: boolean,
    options?: { actorRole?: PrototypeActorRole; sessionStudentId?: string }
  ): void {
    this.assertStudentOwnership(
      studentId,
      options,
      'menghapus pengajuan lamaran miliknya sendiri'
    );
    if (!confirmed) {
      throw new Error(
        'Penghapusan pengajuan dibatalkan: konfirmasi eksplisit diperlukan.'
      );
    }

    const index = this.applications.findIndex(
      (a) =>
        a.id === applicationId &&
        a.batchId === batchId &&
        a.studentId === studentId
    );

    if (index === -1) {
      throw new Error(
        'Pengajuan lamaran tidak ditemukan atau Anda tidak memiliki akses ke pengajuan mahasiswa lain (BR-33).'
      );
    }

    const record = this.applications[index];
    if (record.validationStatus === 'Approved') {
      throw new Error(
        'Pengajuan yang telah berstatus Approved sudah dikunci dan tidak dapat dihapus.'
      );
    }

    this.applications.splice(index, 1);
    this.persist();
  }
}

export const batchRepository = new MockBatchRepository();


