import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminHitlInspectorModal } from '../../components/admin/AdminHitlInspectorModal';
import { RemoveParticipantModal } from '../../components/admin/RemoveParticipantModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  batchRepository,
  type AdminRequestQueueItem,
} from '../../services/batchRepository';
import { getPhaseOverallStartEnd } from '../../services/batchValidator';
import {
  computeRecruitmentPipelineSummary,
  computeStudentPhaseTargetMatrix,
} from '../../services/progressCalculator';
import type { JatBatch, PhaseConfig, ValidationStatus } from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

/**
 * Reconstructed from Approved Stitch Screens:
 * - `6f2eb1bb2f5e44248e5c823b9b55a665` ("Admin - Student Progress & Applied Jobs Inspection")
 * - `77e360af2adb4f1385af29ac679ffe4e` ("Admin - Student Detail (Filter Applied Jobs Popover)")
 * - `302304fd4a5b4fde9267a202d583c4bb` ("Admin - Student Detail (Hapus dari Batch Confirmation Modal)")
 *
 * Implements EP-JAT-02 (BLG-JAT-005..007), EP-JAT-08 HITL Inspection, EP-JAT-09 Applied Jobs Management (BLG-JAT-031..034, JAT-BL-12, BR-28, BR-31),
 * & EP-JAT-10 Progress Monitoring (BLG-JAT-035, BLG-JAT-037, JAT-BL-15, BR-28):
 * - Displays participant identity, cohort, contact details, and readiness badge.
 * - Displays batch, Phase 1 / Phase 2 date-range & job-level target progress matrix derived from stored prototype data.
 * - Displays student's Applied Jobs in this batch with search and single/combined filtering by
 *   Phase, Date Range, and Validation Status (`BR-31`), preserving the distinction between
 *   validation status and recruitment progress (`BR-28`).
 * - Synchronizes automatically when Student submissions or Admin review actions occur.
 */
export const AdminStudentDetailPage: React.FC = () => {
  const { batchId, studentId } = useParams<{ batchId: string; studentId: string }>();
  const navigate = useNavigate();

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const handleRepoUpdated = () => {
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('jat-repository-updated', handleRepoUpdated);
    return () => {
      window.removeEventListener('jat-repository-updated', handleRepoUpdated);
    };
  }, []);

  const batch = useMemo<JatBatch | undefined>(
    () => (batchId ? batchRepository.getBatchById(batchId) : undefined),
    [batchId, refreshTick]
  );

  const participant = useMemo(
    () =>
      batchId && studentId
        ? batchRepository.getParticipantInBatch(batchId, studentId)
        : undefined,
    [batchId, studentId, refreshTick]
  );

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  // Draft & applied filter states for Applied Jobs Popover (Stitch 77e360af, BLG-JAT-031..033, BR-31)
  const [draftPhaseNumber, setDraftPhaseNumber] = useState<'all' | 1 | 2>('all');
  const [draftDateRange, setDraftDateRange] = useState<string>('all');
  const [draftValidationStatus, setDraftValidationStatus] = useState<
    'all' | ValidationStatus
  >('all');

  const [appliedPhaseNumber, setAppliedPhaseNumber] = useState<'all' | 1 | 2>('all');
  const [appliedDateRange, setAppliedDateRange] = useState<string>('all');
  const [appliedValidationStatus, setAppliedValidationStatus] = useState<
    'all' | ValidationStatus
  >('all');

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [inspectedApplicationId, setInspectedApplicationId] = useState<string | null>(null);

  const allStudentApplications = useMemo(
    () =>
      batchId && studentId
        ? batchRepository.listStudentApplications(batchId, studentId)
        : [],
    [batchId, studentId, refreshTick]
  );

  const studentRecruitmentSummary = useMemo(
    () => computeRecruitmentPipelineSummary(allStudentApplications),
    [allStudentApplications]
  );

  const availableDateRangeLabels = useMemo(() => {
    const labels = new Set<string>();
    if (batch) {
      for (const r of batch.phase1.dateRanges) {
        if (r.label) labels.add(r.label);
      }
      if (batch.phase2.enabled) {
        for (const r of batch.phase2.dateRanges) {
          if (r.label) labels.add(r.label);
        }
      }
    }
    for (const app of allStudentApplications) {
      if (app.dateRangeLabel) labels.add(app.dateRangeLabel);
    }
    return Array.from(labels);
  }, [batch, allStudentApplications]);

  const filteredApplications = useMemo(
    () =>
      batchId && studentId
        ? batchRepository.listStudentApplications(batchId, studentId, {
            searchQuery: jobSearchQuery,
            phaseNumber: appliedPhaseNumber,
            dateRange: appliedDateRange,
            validationStatus: appliedValidationStatus,
          })
        : [],
    [
      batchId,
      studentId,
      jobSearchQuery,
      appliedPhaseNumber,
      appliedDateRange,
      appliedValidationStatus,
      refreshTick,
    ]
  );

  const activeFilterCount =
    (appliedPhaseNumber !== 'all' ? 1 : 0) +
    (appliedDateRange !== 'all' ? 1 : 0) +
    (appliedValidationStatus !== 'all' ? 1 : 0);

  const hasActiveFilterOrSearch =
    activeFilterCount > 0 || jobSearchQuery.trim().length > 0;

  const handleOpenFilterPopover = () => {
    setDraftPhaseNumber(appliedPhaseNumber);
    setDraftDateRange(appliedDateRange);
    setDraftValidationStatus(appliedValidationStatus);
    setIsFilterPopoverOpen((prev) => !prev);
  };

  const handleApplyAppliedJobsFilters = () => {
    setAppliedPhaseNumber(draftPhaseNumber);
    setAppliedDateRange(draftDateRange);
    setAppliedValidationStatus(draftValidationStatus);
    setIsFilterPopoverOpen(false);
  };

  const handleResetAppliedJobsFilters = () => {
    setDraftPhaseNumber('all');
    setDraftDateRange('all');
    setDraftValidationStatus('all');
    setAppliedPhaseNumber('all');
    setAppliedDateRange('all');
    setAppliedValidationStatus('all');
    setJobSearchQuery('');
    setIsFilterPopoverOpen(false);
  };

  const inspectedItem: AdminRequestQueueItem | null = useMemo(
    () =>
      inspectedApplicationId
        ? batchRepository.getAdminApplicationInspectionById(inspectedApplicationId) ?? null
        : null,
    [inspectedApplicationId, refreshTick]
  );

  if (!batch || !participant) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center space-y-4">
        <h1 className="text-lg font-bold text-[#1E293B]">Data Peserta Tidak Ditemukan</h1>
        <p className="text-xs text-[#64748B]">
          Peserta tidak ditemukan pada batch ini atau telah dihapus dari keanggotaan batch.
        </p>
        <Link
          to={batch ? `/admin/jat/batches/${batch.id}` : '/admin/jat/batches'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0BB1CB] text-white text-xs font-bold"
        >
          Kembali ke Detail Batch
        </Link>
      </div>
    );
  }

  const initials = participant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const approvedAppsCount = allStudentApplications.filter(
    (a) => a.validationStatus === 'Approved'
  ).length;
  const approvalRate =
    allStudentApplications.length > 0
      ? `${Math.round((approvedAppsCount / allStudentApplications.length) * 100)}%`
      : participant.phase1TargetCount > 0
        ? `${Math.round((participant.phase1CompletedCount / participant.phase1TargetCount) * 100)}%`
        : '0%';

  const handleConfirmRemove = () => {
    batchRepository.removeParticipantFromBatch(batch.id, participant.id, true);
    setIsRemoveModalOpen(false);
    navigate(`/admin/jat/batches/${batch.id}`);
  };

  const renderPhaseProgressMatrix = (phase: PhaseConfig, phaseTitle: string) => {
    const overallDates = getPhaseOverallStartEnd(phase);
    const isPhase1 = phase.phaseNumber === 1;
    const matrixRows = computeStudentPhaseTargetMatrix(
      phase,
      participant,
      allStudentApplications
    );

    if (!phase.enabled || matrixRows.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E293B]">{phaseTitle}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-bold">
              Opsional — Nonaktif
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Phase 2 tidak diaktifkan pada konfigurasi {batch.name}.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E2E8F0] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-lg border border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#1E293B]">{phaseTitle}</span>
            <span className="text-xs text-[#64748B]">
              ({formatDateId(overallDates.startDate)} &ndash; {formatDateId(overallDates.endDate)})
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isPhase1
                ? 'bg-[#E6F7F9] text-[#006878]'
                : 'bg-[#F1F5F9] text-[#475569]'
            }`}
          >
            {isPhase1 ? 'Active Cycle' : 'Phase 2 Cycle'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F1F5F9] text-[#475569] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg">Range Interval</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Job Level</th>
                <th className="py-3 px-4 text-center">Target Progress</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Status Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {matrixRows.map((row, idx) => {
                const prevRow = idx > 0 ? matrixRows[idx - 1] : null;
                const isFirstTargetInRange = !prevRow || prevRow.dateRangeId !== row.dateRangeId;

                return (
                  <tr key={`${row.dateRangeId}-${row.targetId}`} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-bold text-[#1E293B]">
                      {isFirstTargetInRange ? row.dateRangeLabel : ''}
                    </td>
                    <td className="py-3 px-4 text-[#475569] tabular-nums">
                      {isFirstTargetInRange ? formatDateId(row.startDate) : ''}
                    </td>
                    <td className="py-3 px-4 text-[#475569] tabular-nums">
                      {isFirstTargetInRange ? formatDateId(row.endDate) : ''}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1E293B]">{row.jobLevel}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#006878] tabular-nums">
                      {row.completedCount} / {row.targetCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.achievementCode === 'Achieved' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#047857]">
                          {row.achievementLabelId}
                        </span>
                      ) : row.achievementCode === 'In Progress' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309]">
                          {row.achievementLabelId}
                        </span>
                      ) : row.achievementCode === 'Not Achieved' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C]">
                          {row.achievementLabelId}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#64748B]">
                          {row.achievementLabelId}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-[#64748B]"
          >
            <Link to="/admin/jat/batches" className="hover:text-[#006878] font-medium">
              JAT Batch Management
            </Link>
            <span>/</span>
            <Link
              to={`/admin/jat/batches/${batch.id}`}
              className="hover:text-[#006878] font-medium"
            >
              {batch.name}
            </Link>
            <span>/</span>
            <span className="text-[#1E293B] font-semibold">{participant.name}</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            Detail Student
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to={`/admin/jat/batches/${batch.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Kembali ke Detail Batch</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsRemoveModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_remove</span>
            <span>Hapus dari {batch.name}</span>
          </button>
        </div>
      </div>

      {/* Student Identity & Summary Card (Stitch 6f2eb1bb) */}
      <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#006878] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#1E293B]">{participant.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F9] text-[#006878] text-xs font-bold">
                {participant.bootcampCohortName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-xs font-bold">
                {participant.readinessBadge}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>{participant.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>{participant.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>{participant.baseProgram}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Micro Stats */}
        <div className="flex flex-wrap items-center gap-6 bg-[#F8FAFC] border border-[#E2E8F0] px-5 py-3.5 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Target Phase 1
            </span>
            <span className="text-lg font-extrabold text-[#006878] tabular-nums">
              {participant.phase1CompletedCount} / {participant.phase1TargetCount}
            </span>
          </div>

          <div className="w-px h-8 bg-[#E2E8F0]" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Target Phase 2
            </span>
            <span className="text-lg font-extrabold text-[#1E293B] tabular-nums">
              {batch.phase2.enabled
                ? `${participant.phase2CompletedCount} / ${participant.phase2TargetCount}`
                : 'Nonaktif'}
            </span>
          </div>

          <div className="w-px h-8 bg-[#E2E8F0]" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Approval Rate
            </span>
            <span className="text-lg font-extrabold text-[#047857] tabular-nums">
              {approvalRate}
            </span>
          </div>

          <div className="w-px h-8 bg-[#E2E8F0]" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Status Pacing
            </span>
            <span
              className={`mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                participant.pacingStatus === 'On Track' ||
                participant.pacingStatus === 'Completed'
                  ? 'bg-[#ECFDF5] text-[#047857]'
                  : 'bg-[#FFFBEB] text-[#B45309]'
              }`}
            >
              {participant.pacingStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Phase 1 & Phase 2 Progress Matrices */}
      <div className="space-y-5">
        {renderPhaseProgressMatrix(batch.phase1, 'Phase 1')}
        {renderPhaseProgressMatrix(batch.phase2, 'Phase 2')}
      </div>

      {/* Applied Jobs Section (Stitch 6f2eb1bb & 77e360af) */}
      <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E2E8F0] space-y-5">
        <div
          data-testid="student-recruitment-pipeline-summary"
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-[#1E293B]">
            <span className="material-symbols-outlined text-[18px] text-[#006878]">
              work_history
            </span>
            <span>Ringkasan Tahapan Rekrutmen Perusahaan (Terpisah dari Validasi JAT):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] font-semibold text-[#475569]">
              Applied: <strong>{studentRecruitmentSummary.byStage.Applied}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] font-semibold text-[#475569]">
              HR Screening: <strong>{studentRecruitmentSummary.byStage['HR Screening']}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] font-semibold text-[#475569]">
              User Interview: <strong>{studentRecruitmentSummary.byStage['User Interview']}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#ECFDF5] border border-[#10B981]/30 font-semibold text-[#047857]">
              Offering: <strong>{studentRecruitmentSummary.byStage.Offering}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#FEF2F2] border border-[#EF4444]/30 font-semibold text-[#B91C1C]">
              Rejected by Employer:{' '}
              <strong>{studentRecruitmentSummary.byStage['Rejected by Employer']}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[#1E293B]">
                Applied Jobs ({filteredApplications.length})
              </h2>
              <span
                data-testid="applied-jobs-total-badge"
                className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-bold tabular-nums"
              >
                {filteredApplications.length} / {allStudentApplications.length} Data
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Daftar bukti lamaran kerja yang telah diajukan {participant.name} pada {batch.name}.
              Status Validasi JAT (<span className="font-semibold text-[#1E293B]">Approved</span>,{' '}
              <span className="font-semibold text-[#1E293B]">Waiting Confirmation</span>,{' '}
              <span className="font-semibold text-[#1E293B]">Rejected</span>) terpisah dari Tahapan
              Rekrutmen perusahaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative">
            {/* Search Input */}
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                search
              </span>
              <input
                type="text"
                aria-label="Cari company atau role lamaran"
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                placeholder="Cari nama company / role..."
                className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
              />
            </div>

            {/* Filter Applied Jobs Trigger (Stitch 77e360af) */}
            <div className="relative">
              <button
                type="button"
                aria-label="Filter Applied Jobs"
                aria-expanded={isFilterPopoverOpen}
                onClick={handleOpenFilterPopover}
                className={`h-10 px-3.5 rounded-lg border text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                  activeFilterCount > 0 || isFilterPopoverOpen
                    ? 'bg-[#E6F7F9] border-[#0BB1CB] text-[#006878]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span
                    data-testid="active-filter-count-badge"
                    className="px-1.5 py-0.5 rounded-full bg-[#0BB1CB] text-white text-[10px] font-extrabold leading-none"
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Applied Jobs Popover Card (Stitch 77e360af) */}
              {isFilterPopoverOpen && (
                <div
                  role="dialog"
                  aria-label="Panel Filter Applied Jobs"
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-4 z-30 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                        Filter Applied Jobs
                      </h3>
                      <p className="text-[11px] text-[#64748B]">
                        Saring lamaran berdasarkan Phase, Date Range, atau Status
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Tutup Panel Filter"
                      onClick={() => setIsFilterPopoverOpen(false)}
                      className="text-[#64748B] hover:text-[#1E293B] p-1 rounded-lg cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Phase Filter */}
                    <div className="space-y-1">
                      <label
                        htmlFor="filter-applied-jobs-phase"
                        className="block text-[11px] font-bold text-[#475569]"
                      >
                        Phase
                      </label>
                      <select
                        id="filter-applied-jobs-phase"
                        aria-label="Filter Phase"
                        value={draftPhaseNumber}
                        onChange={(e) =>
                          setDraftPhaseNumber(
                            e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2),
                          )
                        }
                        className="w-full h-9 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
                      >
                        <option value="all">Semua Phase</option>
                        <option value="1">Phase 1</option>
                        <option value="2">Phase 2</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-1">
                      <label
                        htmlFor="filter-applied-jobs-date-range"
                        className="block text-[11px] font-bold text-[#475569]"
                      >
                        Date Range
                      </label>
                      <select
                        id="filter-applied-jobs-date-range"
                        aria-label="Filter Date Range"
                        value={draftDateRange}
                        onChange={(e) => setDraftDateRange(e.target.value)}
                        className="w-full h-9 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
                      >
                        <option value="all">Semua Date Range</option>
                        {availableDateRangeLabels.map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Validasi JAT Filter */}
                    <div className="space-y-1">
                      <label
                        htmlFor="filter-applied-jobs-status"
                        className="block text-[11px] font-bold text-[#475569]"
                      >
                        Status Validasi JAT
                      </label>
                      <select
                        id="filter-applied-jobs-status"
                        aria-label="Filter Status Validasi"
                        value={draftValidationStatus}
                        onChange={(e) =>
                          setDraftValidationStatus(
                            e.target.value as 'all' | ValidationStatus,
                          )
                        }
                        className="w-full h-9 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
                      >
                        <option value="all">Semua Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Waiting Confirmation">Waiting Confirmation</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] gap-2">
                    <button
                      type="button"
                      onClick={handleResetAppliedJobsFilters}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyAppliedJobsFilters}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Terapkan Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilterOrSearch && (
              <button
                type="button"
                aria-label="Reset semua filter Applied Jobs"
                onClick={handleResetAppliedJobsFilters}
                className="h-10 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Summary Chips */}
        {hasActiveFilterOrSearch && (
          <div
            data-testid="applied-jobs-active-filters"
            className="flex flex-wrap items-center gap-2 pt-1 text-xs"
          >
            <span className="text-[11px] font-semibold text-[#64748B]">Filter Aktif:</span>
            {appliedPhaseNumber !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F7F9] text-[#006878] text-[11px] font-bold">
                Phase: Phase {appliedPhaseNumber}
              </span>
            )}
            {appliedDateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F7F9] text-[#006878] text-[11px] font-bold">
                Periode: {appliedDateRange}
              </span>
            )}
            {appliedValidationStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F7F9] text-[#006878] text-[11px] font-bold">
                Status JAT: {appliedValidationStatus}
              </span>
            )}
            {jobSearchQuery.trim().length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-bold">
                Pencarian: &ldquo;{jobSearchQuery.trim()}&rdquo;
              </span>
            )}
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div className="py-10 px-4 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
            <span className="material-symbols-outlined text-[28px] text-[#64748B]">
              work_off
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1E293B]">
                Belum Ada Data Lamaran yang Cocok
              </h3>
              <p className="text-xs text-[#64748B]">
                {hasActiveFilterOrSearch
                  ? 'Tidak ada data lamaran yang sesuai dengan kombinasi pencarian atau filter yang dipilih.'
                  : 'Mahasiswa ini belum mengunggah bukti lamaran kerja pada batch ini.'}
              </p>
            </div>
            {hasActiveFilterOrSearch && (
              <div>
                <button
                  type="button"
                  data-testid="empty-state-reset-filter-btn"
                  onClick={handleResetAppliedJobsFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F1F5F9] text-[#475569] text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5 rounded-l-lg">Date Applied</th>
                    <th className="py-3 px-3.5">Created At</th>
                    <th className="py-3 px-3.5">Phase</th>
                    <th className="py-3 px-3.5">Date Range</th>
                    <th className="py-3 px-3.5">Role</th>
                    <th className="py-3 px-3.5">Company</th>
                    <th className="py-3 px-3.5">Location</th>
                    <th className="py-3 px-3.5">Position</th>
                    <th className="py-3 px-3.5">Job Level</th>
                    <th className="py-3 px-3.5">Work System</th>
                    <th className="py-3 px-3.5">Tahapan Rekrutmen Perusahaan</th>
                    <th className="py-3 px-3.5">Bukti</th>
                    <th className="py-3 px-3.5">Status JAT</th>
                    <th className="py-3 px-3.5 rounded-r-lg text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      data-testid={`applied-job-row-${app.id}`}
                      className="hover:bg-[#F8FAFC]"
                    >
                      <td className="py-3.5 px-3.5 font-medium text-[#1E293B] tabular-nums whitespace-nowrap">
                        {formatDateId(app.dateApplied)}
                      </td>
                      <td className="py-3.5 px-3.5 text-[#64748B] tabular-nums whitespace-nowrap">
                        {formatDateId(app.createdAt)}
                      </td>
                      <td className="py-3.5 px-3.5 text-[#475569] font-semibold whitespace-nowrap">
                        Phase {app.phaseNumber}
                      </td>
                      <td className="py-3.5 px-3.5 text-[#475569] whitespace-nowrap">
                        {app.dateRangeLabel}
                      </td>
                      <td className="py-3.5 px-3.5 font-bold text-[#1E293B]">{app.role}</td>
                      <td className="py-3.5 px-3.5 font-semibold text-[#1E293B]">{app.company}</td>
                      <td className="py-3.5 px-3.5 text-[#475569]">{app.location}</td>
                      <td className="py-3.5 px-3.5 text-[#475569]">{app.position}</td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#F1F5F9] font-semibold text-[#475569]">
                          {app.jobLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-[#475569] whitespace-nowrap">
                        {app.workSystem}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span
                          data-testid={`applied-job-recruitment-status-${app.id}`}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-semibold text-[#475569]"
                        >
                          {app.recruitmentStage ?? 'Applied'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-[#006878] font-semibold">
                        {app.evidenceFileName}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <StatusBadge status={app.validationStatus} />
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectedApplicationId(app.id)}
                          data-testid={`student-detail-inspect-btn-${app.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#E6F7F9] hover:border-[#0BB1CB]/40 text-[11px] font-bold text-[#006878] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">fact_check</span>
                          <span>Periksa</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dynamic Table Footer Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9] text-xs text-[#64748B]">
              <span data-testid="applied-jobs-footer-count">
                Menampilkan <strong className="text-[#1E293B]">{filteredApplications.length}</strong>{' '}
                dari <strong className="text-[#1E293B]">{allStudentApplications.length}</strong> data
                lamaran
              </span>
              <span>
                Klik tombol <strong className="text-[#006878]">Periksa</strong> untuk melihat bukti
                screenshot &amp; hasil ekstraksi IDP
              </span>
            </div>
          </div>
        )}
      </div>

      {/* HITL Evidence Inspector Modal (Stitch b490bfff) */}
      <AdminHitlInspectorModal
        isOpen={Boolean(inspectedItem)}
        item={inspectedItem}
        actorRole="Admin (Talent Support)"
        onClose={() => setInspectedApplicationId(null)}
        onSubmitReview={(applicationId, input) => {
          batchRepository.reviewApplicationRequest(applicationId, input);
          setInspectedApplicationId(null);
          setRefreshTick((t) => t + 1);
        }}
      />

      {/* Remove Participant Confirmation Modal (Stitch 302304fd) */}
      <RemoveParticipantModal
        isOpen={isRemoveModalOpen}
        batchName={batch.name}
        participant={participant}
        applicationCount={allStudentApplications.length}
        onCancel={() => setIsRemoveModalOpen(false)}
        onConfirmRemove={handleConfirmRemove}
      />
    </div>
  );
};
