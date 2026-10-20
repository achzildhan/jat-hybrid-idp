import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AddStudentToBatchModal } from '../../components/admin/AddStudentToBatchModal';
import { DeleteBatchModal } from '../../components/admin/DeleteBatchModal';
import { ParticipantFilterPopover } from '../../components/admin/ParticipantFilterPopover';
import { RemoveParticipantModal } from '../../components/admin/RemoveParticipantModal';
import {
  batchRepository,
  type RecalculationExecutionReport,
} from '../../services/batchRepository';
import { calculatePhaseTotalTarget } from '../../services/batchValidator';
import { PROGRESS_CALCULATION_POLICY } from '../../services/progressCalculator';
import type {
  JatBatch,
  ParticipantPacingStatus,
  PhaseConfig,
  StudentParticipant,
} from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

type PrototypeActorRole = 'Admin (Talent Support)' | 'Super Admin' | 'Student';

/**
 * Reconstructed from Approved Stitch Screens:
 * - `93d2b663d8664507b2767eea7360d0b0` ("Admin - JAT Batch Detail & Participants")
 * - `d802ee8ce2e2415fa87a2e3646b656e9` ("Admin - JAT Batch Detail (Empty State - Belum Ada Siswa)")
 * - `d33b62211dda44a6854f4ce67c93d736` ("Admin - JAT Batch Detail (Pop-up Filter Student Participant)")
 * - `bd86c33d703d43e7898ca8ffcd0ad8b5` ("Admin - JAT Batch Detail (Filter Empty State - Siswa Tidak Ditemukan)")
 * - `a8dababfbebc443fb506c3f6c32e4033` ("Admin - JAT Batch Detail (Modal Tambah Student ke Batch)")
 * - `302304fd4a5b4fde9267a202d583c4bb` ("Admin - Student Detail (Hapus dari Batch Confirmation Modal)")
 *
 * Implements EP-JAT-01, EP-JAT-02 & EP-JAT-10 (BLG-JAT-035, BLG-JAT-036, BLG-JAT-037, JAT-BL-13..15, BR-06, BR-08, BR-28..30, BR-42, BR-43).
 */
export const AdminBatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [refreshTick, setRefreshTick] = useState(0);
  const [batch, setBatch] = useState<JatBatch | undefined>(() =>
    batchId ? batchRepository.getBatchById(batchId) : undefined
  );

  useEffect(() => {
    const handleRepoUpdated = () => {
      if (batchId) {
        setBatch(batchRepository.getBatchById(batchId));
      }
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('jat-repository-updated', handleRepoUpdated);
    return () => {
      window.removeEventListener('jat-repository-updated', handleRepoUpdated);
    };
  }, [batchId]);

  // Prototype role selector for BR-30, BR-43 & DSN-TBD-02 verification
  const [actorRole, setActorRole] = useState<PrototypeActorRole>('Admin (Talent Support)');
  const isApprovedRecalculateRole =
    actorRole === 'Admin (Talent Support)' || actorRole === 'Super Admin';

  // Participant Search & Filter State (EP-JAT-02)
  const [participantSearch, setParticipantSearch] = useState('');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<ParticipantPacingStatus[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
  const [selectedQuotaRange, setSelectedQuotaRange] = useState<
    'all' | 'lt50' | '50to79' | 'gte80'
  >('all');

  // Modals & Feedback State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<StudentParticipant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [recalcReport, setRecalcReport] = useState<RecalculationExecutionReport | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const directoryStudents = useMemo(() => batchRepository.listDirectoryStudents(), []);
  const allCohorts = useMemo(() => batchRepository.listBootcampCohorts(), []);

  const availablePrograms = useMemo(() => {
    const set = new Set<string>();
    directoryStudents.forEach((s) => set.add(s.baseProgram));
    return Array.from(set);
  }, [directoryStudents]);

  const monitoringSummary = useMemo(
    () => (batch ? batchRepository.getBatchMonitoringSummary(batch.id) : undefined),
    [batch, refreshTick]
  );

  const filteredParticipants = useMemo(() => {
    if (!batch) return [];
    return batchRepository.listParticipantsInBatch(batch.id, {
      searchQuery: participantSearch,
      pacingStatuses: selectedStatuses,
      baseProgram: selectedProgram,
      bootcampCohortId: selectedCohortId,
      quotaRange: selectedQuotaRange,
    });
  }, [
    batch,
    participantSearch,
    selectedStatuses,
    selectedProgram,
    selectedCohortId,
    selectedQuotaRange,
    refreshTick,
  ]);

  const activeFilterCount =
    selectedStatuses.length +
    (selectedProgram !== 'all' ? 1 : 0) +
    (selectedCohortId !== 'all' ? 1 : 0) +
    (selectedQuotaRange !== 'all' ? 1 : 0);

  if (!batch) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center space-y-4">
        <h1 className="text-lg font-bold text-[#1E293B]">Batch JAT Tidak Ditemukan</h1>
        <p className="text-xs text-[#64748B]">
          Batch dengan ID &ldquo;{batchId}&rdquo; tidak ditemukan atau telah dihapus.
        </p>
        <Link
          to="/admin/jat/batches"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0BB1CB] text-white text-xs font-bold"
        >
          Kembali ke Daftar Batch
        </Link>
      </div>
    );
  }

  const handleRecalculateProgress = () => {
    setErrorBanner(null);
    try {
      const report = batchRepository.recalculateBatchProgressWithReport(batch.id, actorRole);
      setBatch(report.batch);
      setRecalcReport(report);
      setStatusBanner(report.message);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal menghitung ulang progres batch. Silakan coba lagi.';
      setErrorBanner(msg);
      setStatusBanner(null);
      setRecalcReport(null);
    }
  };

  const handleConfirmDelete = (typedName: string) => {
    batchRepository.deleteBatch(batch.id, typedName);
    setIsDeleteModalOpen(false);
    navigate('/admin/jat/batches');
  };

  const handleConfirmAddStudents = (selectedIds: string[]) => {
    const updated = batchRepository.addParticipantsToBatch(batch.id, selectedIds);
    setBatch(updated);
    setIsAddStudentModalOpen(false);
    setRecalcReport(null);
    setStatusBanner(
      `${selectedIds.length} mahasiswa berhasil ditambahkan ke ${batch.name}. Total peserta saat ini: ${updated.participants.length} siswa.`
    );
  };

  const handleConfirmRemoveParticipant = () => {
    if (!participantToRemove) return;
    const removedName = participantToRemove.name;
    const updated = batchRepository.removeParticipantFromBatch(
      batch.id,
      participantToRemove.id,
      true
    );
    setBatch(updated);
    setParticipantToRemove(null);
    setRecalcReport(null);
    setStatusBanner(
      `Mahasiswa "${removedName}" telah dihapus dari keanggotaan ${batch.name}. Identitas dan riwayat lamaran tetap diarsipkan.`
    );
  };

  const handleToggleFilterStatus = (status: ParticipantPacingStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleResetParticipantFilters = () => {
    setParticipantSearch('');
    setSelectedStatuses([]);
    setSelectedProgram('all');
    setSelectedCohortId('all');
    setSelectedQuotaRange('all');
  };

  const renderPhaseScheduleCard = (title: string, phase: PhaseConfig, isOptional = false) => {
    const totalTarget = calculatePhaseTotalTarget(phase);

    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-5 rounded-full ${
                phase.enabled ? 'bg-[#0BB1CB]' : 'bg-slate-300'
              }`}
            />
            <h2 className="text-sm font-bold text-[#1E293B]">{title}</h2>
            {isOptional && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#64748B]">
                {phase.enabled ? 'Aktif' : 'Opsional — Nonaktif'}
              </span>
            )}
          </div>
          {phase.enabled && (
            <span className="text-xs font-bold text-[#006878] bg-[#E6F7F9] px-2.5 py-1 rounded-md tabular-nums">
              Total Target: {totalTarget} Lamaran
            </span>
          )}
        </div>

        {!phase.enabled || phase.dateRanges.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#64748B] flex-1 flex items-center justify-center">
            Phase 2 tidak diaktifkan untuk batch ini (Opsional).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC]/50">
                  <th className="py-2.5 px-4">Date Period</th>
                  <th className="py-2.5 px-4">Start Date</th>
                  <th className="py-2.5 px-4">End Date</th>
                  <th className="py-2.5 px-4">Job Level</th>
                  <th className="py-2.5 px-4 text-right">Target Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {phase.dateRanges.map((range, rIdx) =>
                  range.targets.map((target, tIdx) => (
                    <tr key={`${range.id}-${target.id}`} className="hover:bg-[#F8FAFC]/60">
                      <td className="py-3 px-4 font-semibold text-[#1E293B]">
                        {tIdx === 0 ? range.label || `Date Range ${rIdx + 1}` : ''}
                      </td>
                      <td className="py-3 px-4 text-[#475569] tabular-nums">
                        {tIdx === 0 ? formatDateId(range.startDate) : ''}
                      </td>
                      <td className="py-3 px-4 text-[#475569] tabular-nums">
                        {tIdx === 0 ? formatDateId(range.endDate) : ''}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F1F5F9] font-semibold text-[#1E293B]">
                          {target.jobLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#006878] tabular-nums">
                        {target.targetCount} Lamaran
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Batch Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link to="/admin/jat/batches" className="hover:text-[#006878] font-medium">
              JAT Batch Management
            </Link>
            <span>/</span>
            <span className="text-[#1E293B] font-semibold">{batch.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              {batch.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
              {batch.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
            <span>Batch Bootcamp Terafiliasi:</span>
            {batch.affiliatedCohorts.map((c) => (
              <span
                key={c.id}
                className="px-2 py-0.5 rounded bg-[#F1F5F9] font-semibold text-[#1E293B]"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Header Action Buttons & Role-Gated Recalculate Control (BLG-JAT-036, BR-30, BR-43, DSN-TBD-02) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1">
            <label
              htmlFor="prototype-actor-role-select"
              className="text-[11px] font-bold text-[#64748B]"
            >
              Peran Aktor:
            </label>
            <select
              id="prototype-actor-role-select"
              data-testid="recalculate-role-select"
              aria-label="Pilih Peran Aktor untuk Otorisasi Recalculate"
              value={actorRole}
              onChange={(e) => setActorRole(e.target.value as PrototypeActorRole)}
              className="bg-transparent text-xs font-bold text-[#1E293B] focus:outline-none cursor-pointer"
            >
              <option value="Admin (Talent Support)">Admin (Talent Support)</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Student">Student (Tanpa Akses)</option>
            </select>
          </div>

          {isApprovedRecalculateRole ? (
            <button
              type="button"
              onClick={handleRecalculateProgress}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0BB1CB] bg-[#E6F7F9]/50 hover:bg-[#0BB1CB] text-[#006878] hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Recalculate Progress</span>
            </button>
          ) : (
            <span
              data-testid="recalculate-role-restricted-badge"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#FFFBEB] border border-[#F59E0B]/30 text-[11px] font-semibold text-[#B45309]"
            >
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Sinkronisasi khusus Admin / Super Admin</span>
            </span>
          )}

          <Link
            to={`/admin/jat/batches/${batch.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
            <span>Edit Batch</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#EF4444]/40 bg-[#FEF2F2] hover:bg-[#DC2626] text-[#B91C1C] hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Hapus Batch</span>
          </button>
        </div>
      </div>

      {errorBanner && (
        <div
          role="alert"
          data-testid="recalculate-error-banner"
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/30 text-xs font-semibold text-[#B91C1C]"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {statusBanner && (
        <div
          role="status"
          data-testid="recalculate-status-banner"
          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold ${
            recalcReport?.status === 'no-op'
              ? 'bg-[#E6F7F9]/80 border-[#0BB1CB]/40 text-[#003E49]'
              : 'bg-[#ECFDF5] border-[#10B981]/30 text-[#047857]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {recalcReport?.status === 'no-op' ? 'published_with_changes' : 'check_circle'}
            </span>
            <span>{statusBanner}</span>
            {recalcReport && (
              <span
                data-testid="recalculate-execution-mode-badge"
                className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/80 border border-current/20"
              >
                {recalcReport.status === 'updated' ? 'Updated' : 'No-Op (Sinkron)'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setStatusBanner(null);
              setRecalcReport(null);
            }}
            className="hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Batch Progress Monitoring & Synchronization Summary (EP-JAT-10: BLG-JAT-035, BLG-JAT-036, BLG-JAT-037, JAT-BL-15, BR-28) */}
      {monitoringSummary && (
        <div
          data-testid="batch-monitoring-summary-section"
          className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#1E293B]">
                  Monitoring Progres Kuota &amp; Sinkronisasi Batch
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#E6F7F9] text-[#006878] text-[10px] font-bold uppercase tracking-wider">
                  Data Terpusat &amp; Terpadu
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Metrik diturunkan langsung dari konfigurasi jadwal, peserta aktif, dan berkas
                lamaran yang tersimpan pada repositori bersama (bukan angka statis).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span
                data-testid="calculation-policy-badge"
                title={PROGRESS_CALCULATION_POLICY.formulaDescription}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFFBEB] border border-[#F59E0B]/30 text-[#92400E] font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">rule</span>
                <span>
                  Formula Kuota: Hanya Lamaran Approved
                </span>
              </span>
              <span
                data-testid="permission-policy-badge"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span>Hak Akses Perhitungan: Admin &amp; Super Admin</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Cohort Quota Achievement */}
            <div
              data-testid="monitoring-card-cohort-quota"
              className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Pencapaian Kuota Cohort</span>
                <span className="material-symbols-outlined text-[18px] text-[#006878]">
                  monitoring
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  data-testid="monitoring-cohort-completed-ratio"
                  className="text-xl font-extrabold text-[#1E293B] tabular-nums"
                >
                  {monitoringSummary.cohortTotalCompleted} / {monitoringSummary.cohortTotalCapacity}
                </span>
                <span
                  data-testid="monitoring-cohort-completion-pct"
                  className="text-sm font-extrabold text-[#006878] tabular-nums"
                >
                  {monitoringSummary.cohortCompletionPercentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0BB1CB] rounded-full transition-all"
                  style={{ width: `${monitoringSummary.cohortCompletionPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-[#64748B]">
                Target per siswa:{' '}
                <strong data-testid="monitoring-per-student-target" className="text-[#1E293B]">
                  {monitoringSummary.totalTargetPerStudent} Lamaran
                </strong>{' '}
                (P1: {monitoringSummary.phase1TargetPerStudent}, P2:{' '}
                {monitoringSummary.phase2TargetPerStudent})
              </p>
            </div>

            {/* 2. Pacing Distribution */}
            <div
              data-testid="monitoring-card-pacing"
              className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Distribusi Pacing Peserta</span>
                <span className="material-symbols-outlined text-[18px] text-[#006878]">
                  groups
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#10B981]/20">
                  <div
                    data-testid="monitoring-pacing-completed"
                    className="text-base font-extrabold text-[#047857] tabular-nums"
                  >
                    {monitoringSummary.pacingDistribution.Completed}
                  </div>
                  <div className="text-[10px] font-bold text-[#047857]">Completed</div>
                </div>
                <div className="p-2 rounded-lg bg-[#E6F7F9] border border-[#0BB1CB]/20">
                  <div
                    data-testid="monitoring-pacing-ontrack"
                    className="text-base font-extrabold text-[#006878] tabular-nums"
                  >
                    {monitoringSummary.pacingDistribution['On Track']}
                  </div>
                  <div className="text-[10px] font-bold text-[#006878]">On Track</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FFFBEB] border border-[#F59E0B]/20">
                  <div
                    data-testid="monitoring-pacing-reminder"
                    className="text-base font-extrabold text-[#B45309] tabular-nums"
                  >
                    {monitoringSummary.pacingDistribution['Needs Reminder']}
                  </div>
                  <div className="text-[10px] font-bold text-[#B45309]">Needs Reminder</div>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Total Peserta Aktif:{' '}
                <strong data-testid="monitoring-participant-count" className="text-[#1E293B]">
                  {monitoringSummary.enrolledParticipantsCount} Siswa
                </strong>
              </p>
            </div>

            {/* 3. JAT Evidence Validation Breakdown */}
            <div
              data-testid="monitoring-card-validation"
              className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Status Validasi Bukti JAT</span>
                <span className="material-symbols-outlined text-[18px] text-[#006878]">
                  verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#10B981]/20">
                  <div
                    data-testid="monitoring-validation-approved"
                    className="text-base font-extrabold text-[#047857] tabular-nums"
                  >
                    {monitoringSummary.validationBreakdown.Approved}
                  </div>
                  <div className="text-[10px] font-bold text-[#047857]">Approved</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FFFBEB] border border-[#F59E0B]/20">
                  <div
                    data-testid="monitoring-validation-waiting"
                    className="text-base font-extrabold text-[#B45309] tabular-nums"
                  >
                    {monitoringSummary.validationBreakdown['Waiting Confirmation']}
                  </div>
                  <div className="text-[10px] font-bold text-[#B45309]">Waiting</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/20">
                  <div
                    data-testid="monitoring-validation-rejected"
                    className="text-base font-extrabold text-[#B91C1C] tabular-nums"
                  >
                    {monitoringSummary.validationBreakdown.Rejected}
                  </div>
                  <div className="text-[10px] font-bold text-[#B91C1C]">Rejected</div>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Total Berkas Tercatat:{' '}
                <strong className="text-[#1E293B]">
                  {monitoringSummary.validationBreakdown.totalSubmissions} Lamaran
                </strong>
              </p>
            </div>

            {/* 4. External Employer Recruitment Pipeline Breakdown (BR-28) */}
            <div
              data-testid="monitoring-card-recruitment-pipeline"
              className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Tahapan Rekrutmen Perusahaan</span>
                <span className="material-symbols-outlined text-[18px] text-[#006878]">
                  work_history
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white border border-[#E2E8F0] font-semibold text-[#475569]">
                  Applied:{' '}
                  <strong data-testid="monitoring-recruitment-applied">
                    {monitoringSummary.recruitmentPipelineBreakdown.byStage.Applied}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#E2E8F0] font-semibold text-[#475569]">
                  HR Screening:{' '}
                  <strong data-testid="monitoring-recruitment-hr">
                    {monitoringSummary.recruitmentPipelineBreakdown.byStage['HR Screening']}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#E2E8F0] font-semibold text-[#475569]">
                  Interview:{' '}
                  <strong data-testid="monitoring-recruitment-interview">
                    {monitoringSummary.recruitmentPipelineBreakdown.byStage['User Interview']}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#10B981]/30 font-semibold text-[#047857]">
                  Offering:{' '}
                  <strong data-testid="monitoring-recruitment-offering">
                    {monitoringSummary.recruitmentPipelineBreakdown.byStage.Offering}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#EF4444]/30 font-semibold text-[#B91C1C]">
                  Rejected by Employer:{' '}
                  <strong data-testid="monitoring-recruitment-employer-rejected">
                    {monitoringSummary.recruitmentPipelineBreakdown.byStage['Rejected by Employer']}
                  </strong>
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] leading-snug">
                Terpisah dari status validasi bukti JAT; progres rekrutmen perusahaan tidak mengubah
                hitungan kuota validasi JAT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phase 1 & Phase 2 Configuration Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPhaseScheduleCard('Phase 1 — Jadwal & Target (Wajib)', batch.phase1, false)}
        {renderPhaseScheduleCard('Phase 2 — Jadwal & Target (Opsional)', batch.phase2, true)}
      </div>

      {/* Student Participant on This Batch Section (Stitch 93d2b663, d802ee8c, d33b6221, bd86c33d) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-visible">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">
              Student Participant on This Batch ({batch.participants.length} Siswa)
            </h2>
            <p className="text-xs text-[#64748B]">
              Kelola peserta terdaftar, pantau progres pemenuhan target Phase 1 &amp; Phase 2, dan
              inspeksi detail aktivitas lamaran siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {batch.participants.length > 0 && (
              <>
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    aria-label="Cari Nama atau Email Siswa"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Cari nama, email, atau cohort..."
                    className="w-full h-9 pl-9 pr-7 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
                  />
                  {participantSearch && (
                    <button
                      type="button"
                      aria-label="Bersihkan pencarian peserta"
                      onClick={() => setParticipantSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterPopoverOpen((prev) => !prev)}
                    className={`h-9 px-3.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeFilterCount > 0 || isFilterPopoverOpen
                        ? 'bg-[#E6F7F9] border-[#0BB1CB] text-[#006878]'
                        : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#0BB1CB] text-white text-[10px] font-bold leading-none">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <ParticipantFilterPopover
                    isOpen={isFilterPopoverOpen}
                    selectedStatuses={selectedStatuses}
                    selectedProgram={selectedProgram}
                    selectedCohortId={selectedCohortId}
                    selectedQuotaRange={selectedQuotaRange}
                    programs={availablePrograms}
                    cohorts={allCohorts}
                    onToggleStatus={handleToggleFilterStatus}
                    onChangeProgram={setSelectedProgram}
                    onChangeCohort={setSelectedCohortId}
                    onChangeQuotaRange={setSelectedQuotaRange}
                    onReset={handleResetParticipantFilters}
                    onClose={() => setIsFilterPopoverOpen(false)}
                  />
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsAddStudentModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ Tambah Student</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips Bar (Stitch bd86c33d) */}
        {(activeFilterCount > 0 || participantSearch.trim() !== '') &&
          batch.participants.length > 0 && (
            <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#64748B] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">filter_list</span>
                Filter Aktif:
              </span>
              {participantSearch.trim() !== '' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold">
                  Kata Kunci: &ldquo;{participantSearch}&rdquo;
                </span>
              )}
              {selectedStatuses.map((st) => (
                <span
                  key={st}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold"
                >
                  Status: {st}
                </span>
              ))}
              {selectedProgram !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold">
                  Track: {selectedProgram}
                </span>
              )}
              {selectedCohortId !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold">
                  Cohort: {allCohorts.find((c) => c.id === selectedCohortId)?.name || selectedCohortId}
                </span>
              )}
              {selectedQuotaRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold">
                  Kuota: {selectedQuotaRange}
                </span>
              )}
              <button
                type="button"
                onClick={handleResetParticipantFilters}
                className="text-[#006878] hover:underline font-bold ml-1 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}

        {batch.participants.length === 0 ? (
          /* Stitch Screen d802ee8c: Empty State - Belum Ada Siswa di Batch Ini */
          <div className="py-14 px-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F7F9] text-[#006878] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">group_add</span>
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#1E293B]">
                Belum Ada Siswa di Batch Ini
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Jadwal dan target lamaran untuk <strong>{batch.name}</strong> telah aktif, namun
                belum ada peserta yang terdaftar. Tambahkan siswa dari direktori bootcamp untuk
                memulai pemantauan JAT.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ Tambah Student ke Batch</span>
              </button>
            </div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          /* Stitch Screen bd86c33d: Filter Empty State - Tidak Ada Siswa yang Sesuai Filter */
          <div className="py-14 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E6F7F9] text-[#006878] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">person_search</span>
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#1E293B]">
                Tidak Ada Siswa yang Sesuai Filter
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Kriteria filter atau kata kunci pencarian yang Anda terapkan tidak cocok dengan data
                peserta di batch ini. Coba ubah atau reset filter Anda.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetParticipantFilters}
                className="h-9 px-4 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Filter</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Base Program</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Target Progress</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredParticipants.map((student) => {
                  const initials = student.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const p1Pct =
                    student.phase1TargetCount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (student.phase1CompletedCount / student.phase1TargetCount) * 100
                          )
                        )
                      : 0;

                  return (
                    <tr key={student.id} className="hover:bg-[#F8FAFC]/80 group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#006878] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <Link
                              to={`/admin/jat/batches/${batch.id}/students/${student.id}`}
                              className="font-bold text-[#1E293B] group-hover:text-[#006878] transition-colors block"
                            >
                              {student.name}
                            </Link>
                            <span className="text-xs text-[#64748B]">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-[#1E293B]">
                        {student.baseProgram}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-xs font-semibold">
                          {student.bootcampCohortName}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1.5 min-w-[160px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#64748B] font-medium">Phase 1:</span>
                            <span className="font-bold text-[#1E293B] tabular-nums">
                              {student.phase1CompletedCount}/{student.phase1TargetCount} Lamaran
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0BB1CB] rounded-full"
                              style={{ width: `${p1Pct}%` }}
                            />
                          </div>
                          {batch.phase2.enabled && (
                            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                              <span>Phase 2:</span>
                              <span className="font-semibold tabular-nums">
                                {student.phase2CompletedCount}/{student.phase2TargetCount} Lamaran
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            student.pacingStatus === 'On Track' ||
                            student.pacingStatus === 'Completed'
                              ? 'bg-[#ECFDF5] text-[#047857]'
                              : 'bg-[#FFFBEB] text-[#B45309]'
                          }`}
                        >
                          {student.pacingStatus}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/jat/batches/${batch.id}/students/${student.id}`}
                            aria-label={`Lihat detail ${student.name}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#0BB1CB]/40 bg-[#E6F7F9]/40 hover:bg-[#0BB1CB] text-[#006878] hover:text-white text-xs font-bold transition-colors"
                            title="Lihat Detail Progres & Applied Jobs Siswa"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              visibility
                            </span>
                            <span>Detail</span>
                          </Link>
                          <button
                            type="button"
                            aria-label={`Hapus ${student.name} dari batch`}
                            onClick={() => setParticipantToRemove(student)}
                            className="w-8 h-8 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus Student dari Batch"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              person_remove
                            </span>
                          </button>
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

      {/* Add Student to Batch Modal (Stitch a8dababf & 7cbdaf40) */}
      <AddStudentToBatchModal
        isOpen={isAddStudentModalOpen}
        batchName={batch.name}
        availableStudents={directoryStudents}
        enrolledStudentIds={batch.participants.map((p) => p.id)}
        cohorts={allCohorts}
        onClose={() => setIsAddStudentModalOpen(false)}
        onConfirmAdd={handleConfirmAddStudents}
      />

      {/* Remove Participant Confirmation Modal (Stitch 302304fd) */}
      <RemoveParticipantModal
        isOpen={Boolean(participantToRemove)}
        batchName={batch.name}
        participant={participantToRemove}
        applicationCount={
          participantToRemove
            ? batchRepository.listStudentApplications(batch.id, participantToRemove.id).length
            : 0
        }
        onCancel={() => setParticipantToRemove(null)}
        onConfirmRemove={handleConfirmRemoveParticipant}
      />

      {/* Delete Batch Modal (BR-09 & DSN-TBD-05) */}
      <DeleteBatchModal
        isOpen={isDeleteModalOpen}
        batchName={batch.name}
        participantCount={batch.participants.length}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
