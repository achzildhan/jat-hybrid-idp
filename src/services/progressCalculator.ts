import type {
  CreateOrUpdateBatchInput,
  DateRangeConfig,
  JatBatch,
  JobLevel,
  ParticipantPacingStatus,
  PeriodWindowStatus,
  PhaseConfig,
  RecruitmentStage,
  StudentApplicationRecord,
  StudentParticipant,
} from '../types/jat';
import {
  calculatePhaseTotalTarget,
  deduplicateDateRanges,
  evaluatePeriodWindowStatus,
  getPhaseOverallStartEnd,
} from './batchValidator';

/**
 * ============================================================================
 * EP-JAT-10 — Progress Monitoring & Synchronization Engine
 * (`BLG-JAT-035`, `BLG-JAT-036`, `BLG-JAT-037`, `BLG-JAT-038`)
 * ============================================================================
 *
 * ### 1. Authoritative Source of Truth (`BR-06`, `JAT-BL-14`)
 * - All configured batch dates, phases (`phase1`, `phase2`), `dateRanges`,
 *   job-level `targets`, enrolled `participants`, and `applications` live in the
 *   single shared repository (`MockBatchRepository` in `src/services/batchRepository.ts`).
 * - Both Admin views and Student views read from this single store and pass date ranges
 *   through `deduplicateDateRanges(...)` so Student-facing dates are always identical
 *   to Admin configuration (`BR-06`) and duplicate ranges cannot appear (`JAT-BL-14`).
 *
 * ### 2. Separation of JAT Validation Status vs External Recruitment Progress (`BR-28`)
 * - `validationStatus` (`Approved`, `Waiting Confirmation`, `Rejected`) measures only
 *   whether the Student's uploaded proof screenshot complies with Dibimbing JAT rules.
 * - `recruitmentStage` (`Applied`, `HR Screening`, `User Interview`, `Offer`,
 *   `Rejected by Employer`) tracks the external employer's hiring pipeline.
 * - Validation `Approved` is NEVER treated as employer hiring success; both dimensions
 *   are computed and surfaced separately in `BatchMonitoringSummary` and
 *   `StudentRecruitmentPipelineSummary`.
 *
 * ### 3. Isolated Quota Progress Formula & Product Owner Confirmation (`TBD-CALC-01`)
 * - Current PRD (`JAT-BL-13`, `JAT-BL-15`) and Business Rules (`BR-28`, `BR-29`) require
 *   consistent target/progress recalculation, but do not formally lock down whether a
 *   completed quota slot in production counts:
 *   1. `'hybrid_baseline_and_approved'` (Default Prototype Rule): Uses each participant's
 *      initial historical baseline plus verified (`Approved`) application deltas, or
 *   2. `'strict_approved_applications'`: Counts strictly stored `StudentApplicationRecord`
 *      items with `validationStatus === 'Approved'`, or
 *   3. `'submitted_non_rejected'`: Counts `Approved` + `Waiting Confirmation` submissions
 *      while excluding `Rejected`.
 * - This rule is isolated in `PROGRESS_CALCULATION_POLICY` below and marked with
 *   `decisionId: 'TBD-CALC-01'` (`requiresProductOwnerConfirmation: true`) so it can be
 *   switched in one place once confirmed by the Product Owner / Talent Support lead.
 */

export type QuotaCountingPolicyMode =
  | 'hybrid_baseline_and_approved'
  | 'strict_approved_applications'
  | 'submitted_non_rejected';

export interface ProgressCalculationPolicyMetadata {
  decisionId: 'TBD-CALC-01';
  requiresProductOwnerConfirmation: boolean;
  activeMode: QuotaCountingPolicyMode;
  shortLabel: string;
  formulaDescription: string;
  pacingThresholds: {
    completedRatio: number;
    onTrackRatio: number;
  };
}

export const PROGRESS_CALCULATION_POLICY: ProgressCalculationPolicyMetadata = {
  decisionId: 'TBD-CALC-01',
  requiresProductOwnerConfirmation: true,
  activeMode: 'hybrid_baseline_and_approved',
  shortLabel: 'Hybrid Baseline + Approved Quota (TBD-CALC-01)',
  formulaDescription:
    'Kuota target JAT dihitung dari counter progres peserta yang disinkronkan terhadap bukti lamaran berstatus Approved (serta mempertahankan validitas historis saat edit periode sesuai BR-42). Status rekrutmen perusahaan (Applied, HR Screening, User Interview, Offer, Rejected by Employer) dihitung pada kanal terpisah (BR-28).',
  pacingThresholds: {
    completedRatio: 1.0,
    onTrackRatio: 0.7,
  },
};

export type TargetAchievementCode =
  | 'Achieved'
  | 'In Progress'
  | 'Not Achieved'
  | 'Not Started';

export interface EvaluatedTargetRow {
  phaseNumber: 1 | 2;
  dateRangeId: string;
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  windowStatus: PeriodWindowStatus;
  targetId: string;
  jobLevel: JobLevel;
  targetCount: number;
  completedCount: number;
  waitingConfirmationCount: number;
  rejectedCount: number;
  achievementCode: TargetAchievementCode;
  achievementLabelId: 'Tercapai' | 'Dalam Progres' | 'Tidak Tercapai' | 'Belum Dimulai';
}

export interface StudentRecruitmentPipelineSummary {
  totalApplications: number;
  byStage: Record<RecruitmentStage, number>;
  activeInEmployerPipelineCount: number;
  advancedBeyondAppliedCount: number;
}

export interface BatchMonitoringSummary {
  batchId: string;
  batchName: string;
  policyMetadata: ProgressCalculationPolicyMetadata;
  enrolledParticipantsCount: number;
  phase1TargetPerStudent: number;
  phase2TargetPerStudent: number;
  totalTargetPerStudent: number;
  cohortPhase1Completed: number;
  cohortPhase1Capacity: number;
  cohortPhase2Completed: number;
  cohortPhase2Capacity: number;
  cohortTotalCompleted: number;
  cohortTotalCapacity: number;
  cohortCompletionPercentage: number;
  pacingDistribution: {
    Completed: number;
    'On Track': number;
    'Needs Reminder': number;
  };
  validationBreakdown: {
    totalSubmissions: number;
    Approved: number;
    'Waiting Confirmation': number;
    Rejected: number;
    approvalRatePercentage: number;
  };
  recruitmentPipelineBreakdown: StudentRecruitmentPipelineSummary;
  lastRecalculatedAt?: string;
  lastRecalculatedBy?: string;
}

export interface ParticipantPacingTransition {
  studentId: string;
  studentName: string;
  previousPacingStatus: ParticipantPacingStatus;
  nextPacingStatus: ParticipantPacingStatus;
  previousPhase1Target: number;
  nextPhase1Target: number;
  previousPhase2Target: number;
  nextPhase2Target: number;
}

export interface ConsequentialBatchEditImpact {
  isConsequential: boolean;
  hasDateRangeChanges: boolean;
  hasTargetChanges: boolean;
  previousPhase1Target: number;
  nextPhase1Target: number;
  previousPhase2Target: number;
  nextPhase2Target: number;
  previousTotalTarget: number;
  nextTotalTarget: number;
  affectedParticipantsCount: number;
  pacingTransitions: ParticipantPacingTransition[];
  preservedHistoricalSubmissionsCount: number;
  summaryPoints: string[];
}

/**
 * Evaluates a participant's pacing status (`Completed`, `On Track`, `Needs Reminder`)
 * from their Phase 1 & Phase 2 completed counts and configured targets.
 */
export function evaluateParticipantPacingStatus(
  phase1CompletedCount: number,
  phase1TargetCount: number,
  phase2CompletedCount = 0,
  phase2TargetCount = 0,
  phase2Enabled = false
): ParticipantPacingStatus {
  const totalTarget = phase1TargetCount + (phase2Enabled ? phase2TargetCount : 0);
  const totalCompleted = phase1CompletedCount + (phase2Enabled ? phase2CompletedCount : 0);

  if (totalTarget <= 0) {
    return 'On Track';
  }

  // Primary milestone check against Phase 1 target (consistent with EP-JAT-01/02/03 baseline)
  const p1Met = phase1TargetCount > 0 && phase1CompletedCount >= phase1TargetCount;
  const allMet = totalCompleted >= totalTarget;

  if (p1Met || allMet) {
    return 'Completed';
  }

  const p1Ratio = phase1TargetCount > 0 ? phase1CompletedCount / phase1TargetCount : 0;
  if (p1Ratio >= PROGRESS_CALCULATION_POLICY.pacingThresholds.onTrackRatio) {
    return 'On Track';
  }

  return 'Needs Reminder';
}

/**
 * Evaluates the achievement state of a single Date Range / Job Level target row
 * (`Achieved` / `Tercapai`, `In Progress` / `Dalam Progres`, `Not Achieved` / `Tidak Tercapai`,
 * `Not Started` / `Belum Dimulai`) relative to `referenceDate` (`BLG-JAT-038`).
 */
export function evaluateTargetAchievementState(
  completedCount: number,
  targetCount: number,
  windowStatus: PeriodWindowStatus
): {
  achievementCode: TargetAchievementCode;
  achievementLabelId: 'Tercapai' | 'Dalam Progres' | 'Tidak Tercapai' | 'Belum Dimulai';
} {
  if (targetCount > 0 && completedCount >= targetCount) {
    return { achievementCode: 'Achieved', achievementLabelId: 'Tercapai' };
  }

  if (completedCount === 0 && (windowStatus === 'Upcoming' || windowStatus === 'Inactive')) {
    return { achievementCode: 'Not Started', achievementLabelId: 'Belum Dimulai' };
  }

  if (windowStatus === 'Expired' && completedCount < targetCount) {
    return { achievementCode: 'Not Achieved', achievementLabelId: 'Tidak Tercapai' };
  }

  return { achievementCode: 'In Progress', achievementLabelId: 'Dalam Progres' };
}

/**
 * Computes external employer recruitment pipeline statistics strictly separate from
 * JAT evidence validation status (`BR-28`).
 */
export function computeRecruitmentPipelineSummary(
  applications: StudentApplicationRecord[]
): StudentRecruitmentPipelineSummary {
  const byStage: Record<RecruitmentStage, number> = {
    Applied: 0,
    'HR Screening': 0,
    'User Interview': 0,
    Offering: 0,
    'Rejected by Employer': 0,
  };

  for (const app of applications) {
    const stage: RecruitmentStage = app.recruitmentStage ?? 'Applied';
    byStage[stage] = (byStage[stage] ?? 0) + 1;
  }

  const activeInEmployerPipelineCount =
    byStage.Applied + byStage['HR Screening'] + byStage['User Interview'] + byStage.Offering;
  const advancedBeyondAppliedCount =
    byStage['HR Screening'] + byStage['User Interview'] + byStage.Offering;

  return {
    totalApplications: applications.length,
    byStage,
    activeInEmployerPipelineCount,
    advancedBeyondAppliedCount,
  };
}

/**
 * Computes a participant's synchronized Phase 1 and Phase 2 completed counts from stored
 * applications and participant baseline according to the active `QuotaCountingPolicyMode` (`TBD-CALC-01`).
 */
export function computeParticipantPhaseCompletedCounts(
  participant: StudentParticipant,
  batchApplications: StudentApplicationRecord[],
  mode: QuotaCountingPolicyMode = PROGRESS_CALCULATION_POLICY.activeMode
): { phase1CompletedCount: number; phase2CompletedCount: number } {
  const studentApps = batchApplications.filter((a) => a.studentId === participant.id);

  const countForPhase = (phaseNumber: 1 | 2, storedBaseline: number): number => {
    const phaseApps = studentApps.filter((a) => a.phaseNumber === phaseNumber);
    const approvedCount = phaseApps.filter((a) => a.validationStatus === 'Approved').length;
    const nonRejectedCount = phaseApps.filter((a) => a.validationStatus !== 'Rejected').length;

    if (mode === 'strict_approved_applications') {
      return approvedCount;
    }
    if (mode === 'submitted_non_rejected') {
      return Math.max(storedBaseline, nonRejectedCount);
    }
    // Default 'hybrid_baseline_and_approved':
    // Never drops below actual Approved application records in the repository while respecting
    // the participant's stored progress counter updated on approval/retraction deltas.
    return Math.max(storedBaseline, approvedCount);
  };

  return {
    phase1CompletedCount: countForPhase(1, participant.phase1CompletedCount),
    phase2CompletedCount: countForPhase(2, participant.phase2CompletedCount),
  };
}

/**
 * Builds the per-range, per-job-level target achievement matrix for a Student in a Phase (`BLG-JAT-035`, `BLG-JAT-038`).
 */
export function computeStudentPhaseTargetMatrix(
  phase: PhaseConfig,
  participant: StudentParticipant,
  studentApplications: StudentApplicationRecord[],
  referenceDate = '2025-03-10'
): EvaluatedTargetRow[] {
  if (!phase.enabled) return [];
  const dedupedRanges = deduplicateDateRanges(phase.dateRanges);
  if (dedupedRanges.length === 0) return [];

  const phaseApps = studentApplications.filter((a) => a.phaseNumber === phase.phaseNumber);
  const approvedAppsInPhase = phaseApps.filter((a) => a.validationStatus === 'Approved');

  const storedPhaseCompleted =
    phase.phaseNumber === 1
      ? participant.phase1CompletedCount
      : participant.phase2CompletedCount;

  // Historical baseline completions not individually itemized as Approved records
  let unallocatedBaseline = Math.max(0, storedPhaseCompleted - approvedAppsInPhase.length);

  const rows: EvaluatedTargetRow[] = [];

  dedupedRanges.forEach((range, rIdx) => {
    const windowStatus = evaluatePeriodWindowStatus(
      range.startDate,
      range.endDate,
      referenceDate
    );

    range.targets.forEach((target) => {
      const matchingRangeTargetApps = phaseApps.filter(
        (a) =>
          (a.dateRangeId === range.id || a.dateRangeLabel === range.label) &&
          a.jobLevel === target.jobLevel
      );

      const directApproved = matchingRangeTargetApps.filter(
        (a) => a.validationStatus === 'Approved'
      ).length;
      const waitingConfirmationCount = matchingRangeTargetApps.filter(
        (a) => a.validationStatus === 'Waiting Confirmation'
      ).length;
      const rejectedCount = matchingRangeTargetApps.filter(
        (a) => a.validationStatus === 'Rejected'
      ).length;

      const cap = Math.max(0, target.targetCount);
      const roomForBaseline = Math.max(0, cap - directApproved);
      const allocatedFromBaseline = Math.min(roomForBaseline, unallocatedBaseline);
      unallocatedBaseline = Math.max(0, unallocatedBaseline - allocatedFromBaseline);

      const completedCount = directApproved + allocatedFromBaseline;

      // Determine effective window status for row achievement evaluation
      const effectiveWindowStatus: PeriodWindowStatus =
        completedCount > 0 && windowStatus === 'Upcoming' ? 'Active' : windowStatus;

      const { achievementCode, achievementLabelId } = evaluateTargetAchievementState(
        completedCount,
        cap,
        effectiveWindowStatus
      );

      rows.push({
        phaseNumber: phase.phaseNumber,
        dateRangeId: range.id,
        dateRangeLabel: range.label || `Date Range ${rIdx + 1}`,
        startDate: range.startDate,
        endDate: range.endDate,
        windowStatus,
        targetId: target.id,
        jobLevel: target.jobLevel,
        targetCount: cap,
        completedCount,
        waitingConfirmationCount,
        rejectedCount,
        achievementCode,
        achievementLabelId,
      });
    });
  });

  return rows;
}

/**
 * Derives a comprehensive Batch Monitoring Summary from stored batch, participant, and
 * application records without any hardcoded numbers (`BLG-JAT-035`, `BLG-JAT-036`, `JAT-BL-15`, `BR-28`).
 */
export function computeBatchMonitoringSummary(
  batch: JatBatch,
  batchApplications: StudentApplicationRecord[]
): BatchMonitoringSummary {
  const phase1TargetPerStudent = calculatePhaseTotalTarget(batch.phase1);
  const phase2TargetPerStudent = calculatePhaseTotalTarget(batch.phase2);
  const totalTargetPerStudent = phase1TargetPerStudent + phase2TargetPerStudent;

  const enrolledParticipantsCount = batch.participants.length;
  const cohortPhase1Capacity = enrolledParticipantsCount * phase1TargetPerStudent;
  const cohortPhase2Capacity = enrolledParticipantsCount * phase2TargetPerStudent;
  const cohortTotalCapacity = cohortPhase1Capacity + cohortPhase2Capacity;

  let cohortPhase1Completed = 0;
  let cohortPhase2Completed = 0;
  const pacingDistribution: Record<ParticipantPacingStatus, number> = {
    Completed: 0,
    'On Track': 0,
    'Needs Reminder': 0,
  };

  for (const participant of batch.participants) {
    cohortPhase1Completed += participant.phase1CompletedCount;
    cohortPhase2Completed += batch.phase2.enabled ? participant.phase2CompletedCount : 0;
    pacingDistribution[participant.pacingStatus] =
      (pacingDistribution[participant.pacingStatus] ?? 0) + 1;
  }

  const cohortTotalCompleted = cohortPhase1Completed + cohortPhase2Completed;
  const cohortCompletionPercentage =
    cohortTotalCapacity > 0
      ? Math.min(100, Math.round((cohortTotalCompleted / cohortTotalCapacity) * 1000) / 10)
      : 0;

  const approvedCount = batchApplications.filter(
    (a) => a.validationStatus === 'Approved'
  ).length;
  const waitingCount = batchApplications.filter(
    (a) => a.validationStatus === 'Waiting Confirmation'
  ).length;
  const rejectedCount = batchApplications.filter(
    (a) => a.validationStatus === 'Rejected'
  ).length;
  const totalSubmissions = batchApplications.length;
  const approvalRatePercentage =
    totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 0;

  const recruitmentPipelineBreakdown = computeRecruitmentPipelineSummary(batchApplications);

  return {
    batchId: batch.id,
    batchName: batch.name,
    policyMetadata: PROGRESS_CALCULATION_POLICY,
    enrolledParticipantsCount,
    phase1TargetPerStudent,
    phase2TargetPerStudent,
    totalTargetPerStudent,
    cohortPhase1Completed,
    cohortPhase1Capacity,
    cohortPhase2Completed,
    cohortPhase2Capacity,
    cohortTotalCompleted,
    cohortTotalCapacity,
    cohortCompletionPercentage,
    pacingDistribution,
    validationBreakdown: {
      totalSubmissions,
      Approved: approvedCount,
      'Waiting Confirmation': waitingCount,
      Rejected: rejectedCount,
      approvalRatePercentage,
    },
    recruitmentPipelineBreakdown,
    lastRecalculatedAt: batch.lastRecalculatedAt,
    lastRecalculatedBy: batch.lastRecalculatedBy,
  };
}

function serializeDateRanges(ranges: DateRangeConfig[], enabled: boolean): string {
  if (!enabled) return 'disabled';
  return deduplicateDateRanges(ranges)
    .map((r) => `${r.startDate}..${r.endDate}`)
    .join('|');
}

function serializeTargets(ranges: DateRangeConfig[], enabled: boolean): string {
  if (!enabled) return 'disabled';
  return deduplicateDateRanges(ranges)
    .map((r) =>
      r.targets.map((t) => `${t.jobLevel}:${t.targetCount}`).join(',')
    )
    .join('|');
}

/**
 * Evaluates the consequential impact of editing a batch's date ranges or targets (`BR-08`, `BR-14`, `BR-29`, `BR-42`)
 * so the Admin confirmation dialog can explain the exact impact before applying changes.
 */
export function computeConsequentialBatchEditImpact(
  existingBatch: JatBatch,
  nextInput: CreateOrUpdateBatchInput,
  batchApplications: StudentApplicationRecord[] = []
): ConsequentialBatchEditImpact {
  const prevP1Dates = serializeDateRanges(existingBatch.phase1.dateRanges, existingBatch.phase1.enabled);
  const nextP1Dates = serializeDateRanges(nextInput.phase1.dateRanges, nextInput.phase1.enabled);
  const prevP2Dates = serializeDateRanges(existingBatch.phase2.dateRanges, existingBatch.phase2.enabled);
  const nextP2Dates = serializeDateRanges(nextInput.phase2.dateRanges, nextInput.phase2.enabled);

  const hasDateRangeChanges = prevP1Dates !== nextP1Dates || prevP2Dates !== nextP2Dates;

  const prevP1TargetsStr = serializeTargets(existingBatch.phase1.dateRanges, existingBatch.phase1.enabled);
  const nextP1TargetsStr = serializeTargets(nextInput.phase1.dateRanges, nextInput.phase1.enabled);
  const prevP2TargetsStr = serializeTargets(existingBatch.phase2.dateRanges, existingBatch.phase2.enabled);
  const nextP2TargetsStr = serializeTargets(nextInput.phase2.dateRanges, nextInput.phase2.enabled);

  const previousPhase1Target = calculatePhaseTotalTarget(existingBatch.phase1);
  const nextPhase1Target = calculatePhaseTotalTarget(nextInput.phase1);
  const previousPhase2Target = calculatePhaseTotalTarget(existingBatch.phase2);
  const nextPhase2Target = calculatePhaseTotalTarget(nextInput.phase2);

  const previousTotalTarget = previousPhase1Target + previousPhase2Target;
  const nextTotalTarget = nextPhase1Target + nextPhase2Target;

  const hasTargetChanges =
    prevP1TargetsStr !== nextP1TargetsStr ||
    prevP2TargetsStr !== nextP2TargetsStr ||
    previousTotalTarget !== nextTotalTarget;

  const isConsequential = hasDateRangeChanges || hasTargetChanges;

  const pacingTransitions: ParticipantPacingTransition[] = [];
  for (const p of existingBatch.participants) {
    const nextStatus = evaluateParticipantPacingStatus(
      p.phase1CompletedCount,
      nextPhase1Target,
      p.phase2CompletedCount,
      nextPhase2Target,
      nextInput.phase2.enabled
    );
    if (
      nextStatus !== p.pacingStatus ||
      p.phase1TargetCount !== nextPhase1Target ||
      p.phase2TargetCount !== nextPhase2Target
    ) {
      pacingTransitions.push({
        studentId: p.id,
        studentName: p.name,
        previousPacingStatus: p.pacingStatus,
        nextPacingStatus: nextStatus,
        previousPhase1Target: p.phase1TargetCount,
        nextPhase1Target,
        previousPhase2Target: p.phase2TargetCount,
        nextPhase2Target,
      });
    }
  }

  const preservedHistoricalSubmissionsCount = batchApplications.filter(
    (a) => a.validationStatus !== 'Rejected'
  ).length;

  const summaryPoints: string[] = [];
  if (hasDateRangeChanges) {
    const p1Window = getPhaseOverallStartEnd(nextInput.phase1);
    summaryPoints.push(
      `Sinkronisasi Tanggal (BR-06 & JAT-BL-14): Jadwal Phase 1 (${p1Window.startDate ?? '-'} s/d ${p1Window.endDate ?? '-'}) dan Phase 2 (${nextInput.phase2.enabled ? 'Aktif' : 'Nonaktif'}) akan langsung diperbarui pada tampilan Student tanpa duplikasi rentang.`
    );
  }
  if (hasTargetChanges) {
    summaryPoints.push(
      `Perubahan Target Kuota (BR-08 & BR-29): Target per siswa berubah dari ${previousTotalTarget} menjadi ${nextTotalTarget} lamaran (Phase 1: ${previousPhase1Target} → ${nextPhase1Target}, Phase 2: ${previousPhase2Target} → ${nextPhase2Target}).`
    );
  }
  if (existingBatch.participants.length > 0) {
    const statusShiftCount = pacingTransitions.filter(
      (t) => t.previousPacingStatus !== t.nextPacingStatus
    ).length;
    summaryPoints.push(
      `Hitung Ulang Peserta Terdaftar: ${existingBatch.participants.length} peserta akan disinkronkan targetnya${statusShiftCount > 0 ? ` (${statusShiftCount} peserta mengalami perubahan status pacing)` : ''}.`
    );
  }
  if (hasDateRangeChanges && preservedHistoricalSubmissionsCount > 0) {
    summaryPoints.push(
      `Perlindungan Validitas Historis (BR-42): ${preservedHistoricalSubmissionsCount} pengajuan lamaran yang dibuat sebelum perubahan rentang tanggal tetap dipertahankan validitasnya.`
    );
  }

  return {
    isConsequential,
    hasDateRangeChanges,
    hasTargetChanges,
    previousPhase1Target,
    nextPhase1Target,
    previousPhase2Target,
    nextPhase2Target,
    previousTotalTarget,
    nextTotalTarget,
    affectedParticipantsCount: existingBatch.participants.length,
    pacingTransitions,
    preservedHistoricalSubmissionsCount,
    summaryPoints,
  };
}
