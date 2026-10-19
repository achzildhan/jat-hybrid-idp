import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AddProofOfApplicationDrawer } from '../../components/student/AddProofOfApplicationDrawer';
import { DeleteStudentApplicationModal } from '../../components/student/DeleteStudentApplicationModal';
import { StudentApplicationDetailDrawer } from '../../components/student/StudentApplicationDetailDrawer';
import { useStudentPrototype } from '../../context/StudentPrototypeContext';
import {
  batchRepository,
  type StudentPhaseProgress,
} from '../../services/batchRepository';
import type {
  PeriodWindowStatus,
  StudentApplicationRecord,
  ValidationStatus,
} from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

const WINDOW_STATUS_BADGE: Record<
  PeriodWindowStatus,
  { label: string; className: string; dotClass: string }
> = {
  Active: {
    label: 'Active Window',
    className: 'bg-[#ECFDF5] text-[#047857] border-[#10B981]/40',
    dotClass: 'bg-[#10B981]',
  },
  Upcoming: {
    label: 'Upcoming (Belum Dimulai)',
    className: 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/40',
    dotClass: 'bg-[#F59E0B]',
  },
  Expired: {
    label: 'Expired (Berakhir)',
    className: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    dotClass: 'bg-[#64748B]',
  },
  Inactive: {
    label: 'Inactive (Tidak Aktif)',
    className: 'bg-[#F8FAFB] text-[#94A3B8] border-[#E2E8F0]',
    dotClass: 'bg-[#94A3B8]',
  },
};

/**
 * Reconstructed from Approved Stitch Screens:
 * - `918596734f4148218b40ed1af860711d` ("Student - JAT Batch Detail & Tracking (Enhanced)")
 * - `2d36097898c1414292eb4cf45aad180c` ("Student - JAT Application Detail & Status Variants")
 * - `acd1310968e246268e1d56fea1c76283` ("Student - JAT Delete Proof Confirmation Modal (Enhanced)")
 *
 * Implements EP-JAT-03, EP-JAT-04 & EP-JAT-07:
 * - Displays batch details, Phase 1 and optional Phase 2 (BR-04), deduplicated date ranges (JAT-BL-14),
 *   and configured job-level targets using the single shared Admin data source (BR-06).
 * - Differentiates Active, Upcoming, Expired, and Inactive states with inclusive boundary handling (BR-07).
 * - Respects phase and date-range access rules when presenting the "+ Add Proof of Application" action (BR-07).
 * - Opens AddProofOfApplicationDrawer (Stitch `384daeed`) to validate and persist new student submissions.
 * - Displays standardized JAT Validation Status (`Approved`, `Waiting Confirmation`, `Rejected` — BR-22, DSN-TBD-01)
 *   and validation feedback/reasons (`BR-23`, `BR-24`, `BR-25`) consistently across list and detail views (`BLG-JAT-023`..`026`).
 * - Clearly labels mock/simulated validation outcomes (`BR-27`, `BR-37`) and isolates each student's records (`BR-33`).
 * - Keeps JAT Validation Status strictly separate from external employer recruitment progress (`BR-28`).
 */
export const StudentBatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { selectedStudentId, selectedStudent, referenceDate, setSelectedStudentId } =
    useStudentPrototype();

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ValidationStatus>('ALL');
  const [isAddProofDrawerOpen, setIsAddProofDrawerOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [applicationToDelete, setApplicationToDelete] =
    useState<StudentApplicationRecord | null>(null);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Synchronize Student list & detail drawer whenever repository state changes (BLG-JAT-025, BLG-JAT-026)
  useEffect(() => {
    const handleRepositoryUpdated = () => {
      setRefreshVersion((v) => v + 1);
    };
    window.addEventListener('jat-repository-updated', handleRepositoryUpdated);
    return () => {
      window.removeEventListener('jat-repository-updated', handleRepositoryUpdated);
    };
  }, []);

  const viewModel = useMemo(
    () =>
      batchId
        ? batchRepository.getStudentBatchView(batchId, selectedStudentId, referenceDate)
        : undefined,
    [batchId, selectedStudentId, referenceDate, refreshVersion]
  );

  const rawBatch = useMemo(
    () => (batchId ? batchRepository.getBatchById(batchId) : undefined),
    [batchId, refreshVersion]
  );

  /**
   * BR-33 & BLG-JAT-025:
   * Selected application for the detail drawer is retrieved strictly scoped to `batchId` and `selectedStudentId`
   * so another student's submission is never exposed, and any status update in `batchRepository` is immediately
   * reflected in both the table and the open drawer.
   */
  const selectedApplication = useMemo(
    () =>
      batchId && selectedApplicationId
        ? batchRepository.getStudentApplicationById(
            batchId,
            selectedStudentId,
            selectedApplicationId
          ) ?? null
        : null,
    [batchId, selectedStudentId, selectedApplicationId, refreshVersion]
  );

  const filteredApplications = useMemo(() => {
    if (!viewModel) return [];
    let list = viewModel.applications;

    if (statusFilter !== 'ALL') {
      list = list.filter((app) => app.validationStatus === statusFilter);
    }

    if (jobSearchQuery.trim()) {
      const q = jobSearchQuery.trim().toLowerCase();
      list = list.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q) ||
          app.jobLevel.toLowerCase().includes(q) ||
          app.evidenceFileName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [viewModel, statusFilter, jobSearchQuery]);


  if (!rawBatch) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] shadow-xs text-center space-y-4">
        <h1 className="text-lg font-extrabold text-[#1E293B]">Batch JAT Tidak Ditemukan</h1>
        <p className="text-xs text-[#64748B]">
          Batch yang Anda cari tidak tersedia atau telah dihapus oleh Admin.
        </p>
        <Link
          to="/student/talent-support/jat"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0BB1CB] text-white text-xs font-bold"
        >
          Kembali ke Daftar Batch JAT
        </Link>
      </div>
    );
  }

  if (!viewModel) {
    const firstEnrolled = rawBatch.participants[0];
    return (
      <div className="space-y-4">
        <Link
          to="/student/talent-support/jat"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006878] hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Kembali ke Daftar Batch JAT</span>
        </Link>

        <div
          role="region"
          aria-label="Akses Batch Ditolak atau Belum Terdaftar"
          className="bg-white rounded-xl p-10 border border-[#E2E8F0] shadow-xs text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <div className="space-y-1 max-w-lg mx-auto">
            <h1 className="text-base font-extrabold text-[#1E293B]">
              Mahasiswa Belum Terdaftar di {rawBatch.name}
            </h1>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Mahasiswa <strong>{selectedStudent?.name}</strong> tidak terdaftar sebagai peserta
              pada <strong>{rawBatch.name}</strong>. Pilih batch yang ditugaskan kepada Anda atau
              ganti peserta simulasi.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {firstEnrolled && (
              <button
                type="button"
                onClick={() => setSelectedStudentId(firstEnrolled.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors"
              >
                <span>Ganti ke Peserta {firstEnrolled.name}</span>
              </button>
            )}
            <Link
              to="/student/talent-support/jat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] text-xs font-bold"
            >
              <span>Kembali ke Daftar Batch</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    batch,
    access,
    phase1,
    phase2,
    overallCompletedCount,
    overallTargetCount,
    overallPercentage,
    applications,
  } = viewModel;

  const periodBadge = WINDOW_STATUS_BADGE[access.periodStatus];

  const approvedCount = applications.filter((a) => a.validationStatus === 'Approved').length;
  const waitingCount = applications.filter(
    (a) => a.validationStatus === 'Waiting Confirmation'
  ).length;
  const rejectedCount = applications.filter((a) => a.validationStatus === 'Rejected').length;

  const renderPhaseCard = (phase: StudentPhaseProgress, title: string) => {
    const phaseBadge = WINDOW_STATUS_BADGE[phase.windowStatus];
    const phasePct =
      phase.totalTargetCount > 0
        ? Math.min(100, Math.round((phase.completedCount / phase.totalTargetCount) * 100))
        : 0;

    return (
      <section
        aria-label={title}
        className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col justify-between space-y-5"
      >
        <div className="space-y-4">
          {/* Phase Card Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-[#1E293B]">{title}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${phaseBadge.className}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${phaseBadge.dotClass}`} />
                  {phaseBadge.label}
                </span>
              </div>
              {phase.enabled && phase.startDate && phase.endDate ? (
                <p className="text-xs font-semibold text-[#475569] mt-1">
                  Periode Keseluruhan: <strong>{formatDateId(phase.startDate)}</strong> &ndash;{' '}
                  <strong>{formatDateId(phase.endDate)}</strong>
                </p>
              ) : (
                <p className="text-xs text-[#94A3B8] mt-1">
                  {!phase.enabled
                    ? 'Fase opsional ini tidak diaktifkan pada batch ini (BR-04).'
                    : 'Belum ada rentang tanggal yang dikonfigurasi pada fase ini.'}
                </p>
              )}
            </div>

            {phase.enabled && phase.totalTargetCount > 0 && (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Progres Fase
                </span>
                <span className="text-sm font-extrabold text-[#006878]">
                  {phase.completedCount} / {phase.totalTargetCount} Lamaran ({phasePct}%)
                </span>
              </div>
            )}
          </div>

          {/* Empty / Inactive State for Optional Phase 2 or Unconfigured Ranges */}
          {!phase.enabled ? (
            <div className="rounded-xl bg-[#F8FAFB] border border-dashed border-[#CBD5E1] p-6 text-center space-y-1.5">
              <span className="material-symbols-outlined text-[24px] text-[#94A3B8]">
                event_Repeat
              </span>
              <h3 className="text-xs font-extrabold text-[#475569]">
                Phase 2 Tidak Diaktifkan (Opsional &mdash; BR-04)
              </h3>
              <p className="text-[11px] text-[#64748B] max-w-md mx-auto">
                Batch ini hanya mewajibkan penyelesaian kuota pada Phase 1. Anda tidak perlu
                mengajukan bukti lamaran tambahan untuk Phase 2.
              </p>
            </div>
          ) : phase.dateRanges.length === 0 ? (
            <div className="rounded-xl bg-[#F8FAFB] border border-dashed border-[#CBD5E1] p-6 text-center space-y-1.5">
              <h3 className="text-xs font-extrabold text-[#475569]">
                Belum Ada Rentang Tanggal (Date Range)
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Admin belum menambahkan rentang tanggal untuk {title}.
              </p>
            </div>
          ) : (
            /* Date Ranges & Job Level Targets List */
            <div className="space-y-4">
              {phase.dateRanges.map((range) => {
                const rangeBadge = WINDOW_STATUS_BADGE[range.windowStatus];
                const isTargetAchieved =
                  range.totalTargetCount > 0 && range.completedCount >= range.totalTargetCount;

                return (
                  <div
                    key={range.id}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      range.windowStatus === 'Active'
                        ? 'border-[#0BB1CB] bg-[#E6F7F9]/25'
                        : 'border-[#E2E8F0] bg-[#F8FAFB]/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-extrabold text-[#1E293B]">
                            {range.label}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${rangeBadge.className}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${rangeBadge.dotClass}`}
                            />
                            {rangeBadge.label}
                          </span>
                          {isTargetAchieved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#10B981]/40">
                              Target Achieved
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-[#475569] mt-0.5">
                          {formatDateId(range.startDate)} &ndash; {formatDateId(range.endDate)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#1E293B]">
                          {range.completedCount} / {range.totalTargetCount}
                        </span>
                        <span className="text-[10px] text-[#64748B] block">Target Range</span>
                      </div>
                    </div>

                    {/* Per-Job-Level Target Progress Bars */}
                    <div className="space-y-2 pt-1 border-t border-[#E2E8F0]">
                      {range.targetProgress.map((t) => {
                        const pct =
                          t.targetCount > 0
                            ? Math.min(100, Math.round((t.completedCount / t.targetCount) * 100))
                            : 0;
                        return (
                          <div key={t.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#334155]">{t.jobLevel}</span>
                              <span className="font-extrabold text-[#0F172A]">
                                {t.completedCount} / {t.targetCount} Lamaran ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct >= 100 ? 'bg-[#10B981]' : 'bg-[#0BB1CB]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/talent-support/jat"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006878] hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Kembali ke Daftar Batch JAT</span>
        </Link>
      </div>

      {/* Hero Batch Header & 4 KPI Cards (Stitch 91859673) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-[#1E293B]">{batch.name}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${periodBadge.className}`}
              >
                <span className={`w-2 h-2 rounded-full ${periodBadge.dotClass}`} />
                {periodBadge.label}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Cohort Terafiliasi:{' '}
              <strong className="text-[#334155]">
                {batch.affiliatedCohorts.map((c) => c.name).join(', ')}
              </strong>
            </p>
          </div>

          {/* Period-Gated Action Button (+ Add Proof of Application — BR-07) */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              type="button"
              disabled={!access.canSubmitApplication}
              onClick={() => setIsAddProofDrawerOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs ${
                access.canSubmitApplication
                  ? 'bg-[#0BB1CB] hover:bg-[#006878] text-white cursor-pointer'
                  : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {access.canSubmitApplication ? 'add_circle' : 'lock'}
              </span>
              <span>+ Add Proof of Application</span>
            </button>
            <span className="text-[11px] font-medium text-[#64748B]">
              Tanggal Referensi: <strong>{formatDateId(referenceDate)}</strong>
            </span>
          </div>
        </div>

        {/* Period Access Status Banner (BR-07 & BR-15) */}
        <div
          role="status"
          className={`rounded-xl px-4 py-3 border text-xs flex items-start gap-2.5 ${
            access.canSubmitApplication
              ? 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]'
              : 'bg-[#FFFBEB] border-[#F59E0B]/40 text-[#92400E]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
            {access.canSubmitApplication ? 'verified' : 'schedule'}
          </span>
          <div className="space-y-1">
            <p className="font-bold">{access.accessMessage}</p>
            {submissionNotice && (
              <p className="text-[11px] font-bold text-[#0F172A] bg-white/80 px-3 py-1.5 rounded-lg border border-[#CBD5E1]">
                {submissionNotice}
              </p>
            )}
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Target Quota */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFB] p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Target Keseluruhan
              </span>
              <div className="text-lg font-extrabold text-[#1E293B]">
                {overallCompletedCount} / {overallTargetCount}
              </div>
              <span className="text-[11px] text-[#006878] font-bold">
                {overallPercentage}% Kuota Terpenuhi
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-[#0BB1CB] flex items-center justify-center text-xs font-extrabold text-[#006878]">
              {overallPercentage}%
            </div>
          </div>

          {/* Card 2: Phase 1 Quota */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFB] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Phase 1 Quota
            </span>
            <div className="text-lg font-extrabold text-[#1E293B]">
              {phase1.completedCount} / {phase1.totalTargetCount} Lamaran
            </div>
            <p className="text-[11px] text-[#64748B]">
              {phase1.startDate && phase1.endDate
                ? `${formatDateId(phase1.startDate)} – ${formatDateId(phase1.endDate)}`
                : 'Belum ada rentang tanggal'}
            </p>
          </div>

          {/* Card 3: Phase 2 Quota (Optional BR-04) */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFB] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Phase 2 Quota (Opsional)
            </span>
            {phase2.enabled ? (
              <>
                <div className="text-lg font-extrabold text-[#1E293B]">
                  {phase2.completedCount} / {phase2.totalTargetCount} Lamaran
                </div>
                <p className="text-[11px] text-[#64748B]">
                  {phase2.startDate && phase2.endDate
                    ? `${formatDateId(phase2.startDate)} – ${formatDateId(phase2.endDate)}`
                    : 'Belum ada rentang tanggal'}
                </p>
              </>
            ) : (
              <>
                <div className="text-sm font-extrabold text-[#64748B] pt-1">
                  Tidak Diaktifkan
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Phase 2 bersifat opsional (BR-04)
                </p>
              </>
            )}
          </div>

          {/* Card 4: Validation Status Summary (Strictly distinct from recruitment progress per BR-28) */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFB] p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Status Validasi Bukti (BR-22)
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                Approved: {approvedCount}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFFBEB] text-[#B45309]">
                Waiting: {waitingCount}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF2F2] text-[#B91C1C]">
                Rejected: {rejectedCount}
              </span>
            </div>
            <p className="text-[10px] text-[#64748B]">
              Terpisah dari progres rekrutmen perusahaan (BR-28)
            </p>
          </div>
        </div>
      </div>

      {/* Phase 1 & Phase 2 Configuration & Progress Cards (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPhaseCard(phase1, 'Phase 1')}
        {renderPhaseCard(phase2, 'Phase 2')}
      </div>

      {/* Student's Applied Jobs Section (Bottom of Stitch 91859673) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1E293B]">
                Riwayat Bukti Lamaran Anda (Applied Jobs)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Daftar pengajuan bukti lamaran kerja Anda pada {batch.name}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                aria-label="Cari riwayat lamaran"
                placeholder="Cari perusahaan atau posisi..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
              />
            </div>
          </div>

          {/* Explicit BR-28 Separation Callout */}
          <div className="rounded-lg bg-[#F8FAFB] border border-[#E2E8F0] px-3.5 py-2.5 text-[11px] text-[#475569] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#0BB1CB]">info</span>
            <span>
              <strong>Catatan (BR-28):</strong> Status Validasi JAT (
              <code className="font-bold">Approved</code>,{' '}
              <code className="font-bold">Waiting Confirmation</code>,{' '}
              <code className="font-bold">Rejected</code>) merupakan status verifikasi bukti
              screenshot oleh Talent Support dan bukan status tahapan rekrutmen dari perusahaan.
            </span>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              ['ALL', 'Approved', 'Waiting Confirmation', 'Rejected'] as const
            ).map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#0BB1CB] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st}
                </button>
              );
            })}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-bold text-[#475569]">
              Belum Ada Bukti Lamaran yang Sesuai Kriteria
            </p>
            <p className="text-[11px] text-[#64748B]">
              Tidak ada pengajuan lamaran yang ditemukan untuk filter pencarian saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-6">Tanggal Lamar</th>
                  <th className="py-3 px-6">Perusahaan &amp; Role</th>
                  <th className="py-3 px-6">Fase &amp; Date Range</th>
                  <th className="py-3 px-6">Job Level &amp; Tipe</th>
                  <th className="py-3 px-6">Bukti Unggahan</th>
                  <th className="py-3 px-6">Tahapan Rekrutmen Perusahaan (BR-28)</th>
                  <th className="py-3 px-6">Status Validasi JAT &amp; Feedback</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredApplications.map((app) => {
                  const recruitmentStage = app.recruitmentStage ?? 'Applied';
                  const isApproved = app.validationStatus === 'Approved';
                  const isWaiting = app.validationStatus === 'Waiting Confirmation';
                  const isRejected = app.validationStatus === 'Rejected';

                  return (
                    <tr key={app.id} className="hover:bg-[#F8FAFB]/80">
                      <td className="py-3.5 px-6 font-semibold text-[#1E293B]">
                        {formatDateId(app.dateApplied)}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-[#1E293B]">{app.company}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {app.role} &bull; {app.location}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-bold text-[#334155]">
                          Phase {app.phaseNumber}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">
                          {app.dateRangeLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-[#1E293B]">{app.jobLevel}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {app.position} &bull; {app.workSystem}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006878]">
                          <span className="material-symbols-outlined text-[14px]">
                            attachment
                          </span>
                          {app.evidenceFileName}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]">
                          {recruitmentStage}
                        </span>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">
                          Progres Eksternal
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge status={app.validationStatus} />
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F8FAFB] text-[#475569] border border-[#CBD5E1]">
                              {isWaiting ? 'Belum Diproses' : 'Simulasi Mock (BR-37)'}
                            </span>
                          </div>

                          {isRejected && (
                            <p className="text-[11px] text-[#B91C1C] max-w-xs font-medium">
                              Alasan:{' '}
                              {app.rejectionReason?.trim()
                                ? app.rejectionReason
                                : 'Alasan penolakan belum tercatat pada data simulasi.'}
                            </p>
                          )}

                          {isApproved && app.reviewFeedback && (
                            <p className="text-[11px] text-[#047857] max-w-xs">
                              Feedback: {app.reviewFeedback}
                            </p>
                          )}

                          {isWaiting && (
                            <p className="text-[11px] text-[#B45309] max-w-xs">
                              Menunggu verifikasi Talent Support (belum ada hasil validasi).
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicationId(app.id)}
                            aria-label={`Lihat detail pengajuan ${app.company}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[11px] font-bold text-[#006878] transition-colors cursor-pointer"
                          >
                            <span>Lihat Detail</span>
                          </button>

                          {isApproved ? (
                            <span
                              title="Pengajuan yang telah Approved dikunci"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-[#F1F5F9] text-[#64748B]"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                lock
                              </span>
                              Locked
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setApplicationToDelete(app)}
                              aria-label={`Hapus pengajuan ${app.company}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[11px] font-bold text-[#B91C1C] transition-colors cursor-pointer"
                            >
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Proof of Application Slide-Over Drawer (Stitch 384daeed — EP-JAT-04) */}
      <AddProofOfApplicationDrawer
        isOpen={isAddProofDrawerOpen}
        batch={batch}
        studentId={selectedStudentId}
        referenceDate={referenceDate}
        access={access}
        onClose={() => setIsAddProofDrawerOpen(false)}
        onSubmitApplication={(input, refDate) => {
          const created = batchRepository.submitStudentApplication(input, refDate);
          setRefreshVersion((v) => v + 1);
          if (created.validationStatus === 'Rejected') {
            setSubmissionNotice(
              `Pengajuan untuk ${created.company} (${created.role}) telah dicatat namun otomatis berstatus Rejected karena Date Applied (${created.dateApplied}) berada di luar rentang tanggal aktif batch (BR-14 & BR-45 / DSN-TBD-04).`
            );
          } else {
            setSubmissionNotice(
              `Bukti lamaran untuk ${created.company} (${created.role}) berhasil diterima untuk pemrosesan verifikasi (Status: Waiting Confirmation). Catatan (BR-15): Berhasil mengunggah berkas berarti bukti telah diterima oleh sistem, bukan berarti pengajuan telah disetujui (Approved).`
            );
          }
          return { id: created.id };
        }}
        onSubmitSuccess={() => {
          setIsAddProofDrawerOpen(false);
        }}
      />

      {/* Student Application Detail & Status Variants Slide-Over Drawer (Stitch 2d360978 — EP-JAT-07) */}
      <StudentApplicationDetailDrawer
        isOpen={Boolean(selectedApplication)}
        application={selectedApplication}
        onClose={() => setSelectedApplicationId(null)}
        onRequestDelete={(app) => {
          setApplicationToDelete(app);
        }}
      />

      {/* Student Delete Proof Confirmation Modal (Stitch acd13109 — EP-JAT-07) */}
      <DeleteStudentApplicationModal
        isOpen={Boolean(applicationToDelete)}
        application={applicationToDelete}
        onCancel={() => setApplicationToDelete(null)}
        onConfirmDelete={(appId) => {
          if (!batchId) return;
          const deletedCompany = applicationToDelete?.company ?? 'Perusahaan';
          batchRepository.deleteStudentApplication(
            batchId,
            selectedStudentId,
            appId,
            true
          );
          if (selectedApplicationId === appId) {
            setSelectedApplicationId(null);
          }
          setApplicationToDelete(null);
          setRefreshVersion((v) => v + 1);
          setSubmissionNotice(
            `Bukti pengajuan lamaran untuk ${deletedCompany} telah berhasil ditarik kembali dan dihapus.`
          );
        }}
      />
    </div>
  );
};


