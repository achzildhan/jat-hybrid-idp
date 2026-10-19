import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHitlInspectorModal } from '../../components/admin/AdminHitlInspectorModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { JOB_LEVEL_OPTIONS } from '../../mocks/jatData';
import {
  type AdminRequestQueueItem,
  batchRepository,
} from '../../services/batchRepository';
import type {
  PrototypeActorRole,
  ReviewApplicationRequestInput,
} from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

/**
 * Reconstructed from Approved Stitch Screens:
 * - `9df4e6195ef94e9d908f78483a9b9cd9` ("Admin - JAT Request Queue & Full Table (Enhanced)")
 * - `3d6a420507c24a7094bc7be0c2150474` ("Admin - JAT Request Queue Table (Bulk Action Inactive State)")
 * - `b490bfff7a0946d1af08c7c70b663597` ("Admin - JAT HITL Evidence Review & Inspector")
 *
 * Implements EP-JAT-08 (BLG-JAT-027..030, JAT-BL-11, BR-22..BR-26, BR-31..BR-34, DSN-TBD-03, DSN-TBD-06):
 * - Displays the Request queue strictly for records whose validation status is `Waiting Confirmation` (`BR-32`).
 * - Omits the bulk action toolbar/checkboxes per Confirmed Decision `DSN-TBD-03` so every submission is reviewed
 *   individually via the HITL Evidence Inspector.
 * - Supports search and filtering by Batch, Phase, Date Range, and Job Level (`BR-31`).
 * - Removes a reviewed record from the `Waiting Confirmation` queue once its status changes (`Approved` or `Rejected`)
 *   while preserving the original submission in the underlying application data (`BR-25`, `BR-32`).
 */
export const AdminRequestQueuePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  // Draft & applied filter states for Filter Popover
  const [draftBatchId, setDraftBatchId] = useState<string>('all');
  const [draftPhaseNumber, setDraftPhaseNumber] = useState<'all' | 1 | 2>('all');
  const [draftDateRangeLabel, setDraftDateRangeLabel] = useState<string>('all');
  const [draftJobLevel, setDraftJobLevel] = useState<string>('all');

  const [appliedBatchId, setAppliedBatchId] = useState<string>('all');
  const [appliedPhaseNumber, setAppliedPhaseNumber] = useState<'all' | 1 | 2>('all');
  const [appliedDateRangeLabel, setAppliedDateRangeLabel] = useState<string>('all');
  const [appliedJobLevel, setAppliedJobLevel] = useState<string>('all');

  // Prototype role simulation (BR-33, BR-43, DSN-TBD-02)
  const [actorRole, setActorRole] = useState<PrototypeActorRole>(
    'Admin (Talent Support)'
  );

  // Selected request for HITL Inspector modal
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    null
  );
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error';
    message: string;
    studentDetailPath?: string;
  } | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const handleRepoUpdated = () => {
      setRefreshVersion((v) => v + 1);
    };
    window.addEventListener('jat-repository-updated', handleRepoUpdated);
    return () => {
      window.removeEventListener('jat-repository-updated', handleRepoUpdated);
    };
  }, []);

  const batches = useMemo(
    () => batchRepository.listBatches(),
    [refreshVersion]
  );

  const allWaitingRequests = useMemo(
    () => batchRepository.listWaitingConfirmationRequests(),
    [refreshVersion]
  );

  const filteredRequests = useMemo(
    () =>
      batchRepository.listWaitingConfirmationRequests({
        searchQuery,
        batchId: appliedBatchId,
        phaseNumber: appliedPhaseNumber,
        dateRangeId: appliedDateRangeLabel,
        jobLevel: appliedJobLevel,
      }),
    [
      searchQuery,
      appliedBatchId,
      appliedPhaseNumber,
      appliedDateRangeLabel,
      appliedJobLevel,
      refreshVersion,
    ]
  );

  const selectedInspectionItem: AdminRequestQueueItem | null = useMemo(
    () =>
      selectedApplicationId
        ? batchRepository.getAdminApplicationInspectionById(selectedApplicationId) ??
          null
        : null,
    [selectedApplicationId, refreshVersion]
  );

  const hasActiveFilter =
    appliedBatchId !== 'all' ||
    appliedPhaseNumber !== 'all' ||
    appliedDateRangeLabel !== 'all' ||
    appliedJobLevel !== 'all';

  const handleApplyFilters = () => {
    setAppliedBatchId(draftBatchId);
    setAppliedPhaseNumber(draftPhaseNumber);
    setAppliedDateRangeLabel(draftDateRangeLabel);
    setAppliedJobLevel(draftJobLevel);
    setIsFilterPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setDraftBatchId('all');
    setDraftPhaseNumber('all');
    setDraftDateRangeLabel('all');
    setDraftJobLevel('all');
    setAppliedBatchId('all');
    setAppliedPhaseNumber('all');
    setAppliedDateRangeLabel('all');
    setAppliedJobLevel('all');
    setSearchQuery('');
    setIsFilterPopoverOpen(false);
  };

  const handleSubmitReview = (
    applicationId: string,
    input: ReviewApplicationRequestInput
  ) => {
    const targetItem =
      batchRepository.getAdminApplicationInspectionById(applicationId);
    const updated = batchRepository.reviewApplicationRequest(applicationId, input);
    setSelectedApplicationId(null);
    setRefreshVersion((v) => v + 1);

    const studentName = targetItem?.studentName ?? updated.studentId;
    const studentDetailPath = `/admin/jat/batches/${updated.batchId}/students/${updated.studentId}`;

    if (updated.validationStatus === 'Approved') {
      setFeedbackNotice({
        type: 'success',
        message: `Request lamaran ${updated.company} (${updated.role}) milik ${studentName} berhasil disetujui (Approved). Pengajuan telah dikeluarkan dari antrean Waiting Confirmation dan tetap tersimpan pada riwayat mahasiswa.`,
        studentDetailPath,
      });
    } else {
      setFeedbackNotice({
        type: 'success',
        message: `Request lamaran ${updated.company} (${updated.role}) milik ${studentName} telah ditolak (Rejected) dengan alasan: "${updated.rejectionReason}". Pengajuan telah dikeluarkan dari antrean Waiting Confirmation dan tetap tersimpan pada riwayat mahasiswa.`,
        studentDetailPath,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & BR-28 / Role Simulation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            Konfirmasi Request JAT
          </h1>
          <p className="text-xs text-[#64748B] max-w-2xl leading-relaxed">
            Antrean verifikasi bukti lamaran kerja mandiri peserta (Human-in-the-Loop). Hanya
            menampilkan pengajuan dengan status <strong>Waiting Confirmation</strong> (BR-32).
            Pemeriksaan dilakukan satu per satu melalui HITL Evidence Inspector (DSN-TBD-03).
          </p>
        </div>

        {/* Prototype Role Simulator & BR-28 Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
            <label
              htmlFor="admin-request-role-simulator"
              className="text-[11px] font-bold text-[#475569]"
            >
              Simulasi Peran (BR-33):
            </label>
            <select
              id="admin-request-role-simulator"
              value={actorRole}
              onChange={(e) => setActorRole(e.target.value as PrototypeActorRole)}
              className="text-xs font-extrabold text-[#006878] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
            >
              <option value="Admin (Talent Support)">Admin (Talent Support)</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Student">Student (Tidak Berwenang Review)</option>
            </select>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-2xs text-[11px] font-semibold text-[#475569]">
            <span className="material-symbols-outlined text-[16px] text-[#0BB1CB]">
              info
            </span>
            <span>Status Verifikasi Admin &ne; Status Rekrutmen Perusahaan (BR-28)</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner after Review Decision */}
      {feedbackNotice && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 border text-xs flex flex-wrap items-center justify-between gap-3 ${
            feedbackNotice.type === 'success'
              ? 'bg-[#ECFDF5] border-[#10B981]/40 text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px]">
              {feedbackNotice.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-bold">{feedbackNotice.message}</span>
          </div>
          <div className="flex items-center gap-2">
            {feedbackNotice.studentDetailPath && (
              <Link
                to={feedbackNotice.studentDetailPath}
                className="px-3 py-1 rounded-lg bg-white border border-[#10B981]/40 text-[#047857] font-extrabold hover:bg-[#D1FAE5] transition-colors"
              >
                Lihat di Detail Mahasiswa &rarr;
              </Link>
            )}
            <button
              type="button"
              onClick={() => setFeedbackNotice(null)}
              aria-label="Tutup notifikasi"
              className="text-xs font-bold underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Control Bar (Stitch 9df4e619) */}
      <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            aria-label="Cari nama student, perusahaan, atau role pada antrean Request"
            placeholder="Cari nama student, perusahaan, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1E293B] placeholder:text-[#64748B] shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
          />
        </div>

        {/* Filter Button & Popover Anchor */}
        <div className="relative flex items-center gap-2.5">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFilterPopoverOpen((prev) => !prev)}
            aria-expanded={isFilterPopoverOpen}
            aria-label="Filter Data Request JAT"
            className="h-10 px-4 bg-white border border-[#CBD5E1] rounded-xl shadow-2xs text-[#006878] text-xs font-extrabold flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Filter</span>
            {hasActiveFilter && (
              <span className="w-2 h-2 rounded-full bg-[#0BB1CB]" />
            )}
          </button>

          {/* Filter Popover Panel (Reconstructed from Stitch 9df4e619) */}
          {isFilterPopoverOpen && (
            <div
              role="dialog"
              aria-label="Panel Filter Data Request JAT"
              className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#CBD5E1] p-5 z-50 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0BB1CB] text-[20px]">
                    tune
                  </span>
                  <h2 className="text-sm font-extrabold text-[#1E293B]">
                    Filter Data JAT
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterPopoverOpen(false)}
                  aria-label="Tutup panel filter"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Batch Filter */}
                <div className="space-y-1">
                  <label
                    htmlFor="request-filter-batch"
                    className="font-bold text-[#475569] block"
                  >
                    Batch
                  </label>
                  <select
                    id="request-filter-batch"
                    value={draftBatchId}
                    onChange={(e) => setDraftBatchId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold"
                  >
                    <option value="all">Semua Batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phase Filter */}
                <div className="space-y-1">
                  <label
                    htmlFor="request-filter-phase"
                    className="font-bold text-[#475569] block"
                  >
                    Phase
                  </label>
                  <select
                    id="request-filter-phase"
                    value={String(draftPhaseNumber)}
                    onChange={(e) =>
                      setDraftPhaseNumber(
                        e.target.value === 'all'
                          ? 'all'
                          : (Number(e.target.value) as 1 | 2)
                      )
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold"
                  >
                    <option value="all">Semua Phase</option>
                    <option value="1">Phase 1</option>
                    <option value="2">Phase 2</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-1">
                  <label
                    htmlFor="request-filter-range"
                    className="font-bold text-[#475569] block"
                  >
                    Date Range
                  </label>
                  <select
                    id="request-filter-range"
                    value={draftDateRangeLabel}
                    onChange={(e) => setDraftDateRangeLabel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold"
                  >
                    <option value="all">Semua Range</option>
                    <option value="Date Range 1">Date Range 1</option>
                    <option value="Date Range 2">Date Range 2</option>
                  </select>
                </div>

                {/* Job Level Filter */}
                <div className="space-y-1">
                  <label
                    htmlFor="request-filter-joblevel"
                    className="font-bold text-[#475569] block"
                  >
                    Job Level
                  </label>
                  <select
                    id="request-filter-joblevel"
                    value={draftJobLevel}
                    onChange={(e) => setDraftJobLevel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold"
                  >
                    <option value="all">Semua Job Level</option>
                    {JOB_LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preselected Status Notice (BR-32) */}
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#B45309] text-[18px] shrink-0 mt-0.5">
                    hourglass_top
                  </span>
                  <div className="text-[11px] text-[#92400E]">
                    <span className="font-extrabold uppercase tracking-wider block">
                      Antrean Aktif (BR-32)
                    </span>
                    <span>
                      Menampilkan berkas dengan status{' '}
                      <strong>Waiting Confirmation</strong> untuk ditinjau.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-4 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Request Queue Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <h2 className="text-sm font-extrabold text-[#1E293B]">
              Antrean Konfirmasi Bukti Lamaran Mahasiswa (Waiting Confirmation)
            </h2>
          </div>
          <span className="text-xs font-bold text-[#64748B]">
            Menampilkan {filteredRequests.length} dari {allWaitingRequests.length} data
            menunggu verifikasi
          </span>
        </div>

        {allWaitingRequests.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <h3 className="text-sm font-extrabold text-[#1E293B]">
              Semua Request Telah Diverifikasi (Antrean Kosong)
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Tidak ada pengajuan bukti lamaran yang berstatus Waiting Confirmation saat ini.
              Seluruh pengajuan yang telah ditinjau tetap tersimpan pada halaman detail
              masing-masing mahasiswa.
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#1E293B]">
                Tidak Ada Request yang Sesuai Filter
              </h3>
              <p className="text-xs text-[#64748B]">
                Tidak ditemukan pengajuan Waiting Confirmation untuk kriteria pencarian atau
                filter yang dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Reset Pencarian &amp; Filter</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0] text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                  <th className="py-3.5 px-5">BATCH</th>
                  <th className="py-3.5 px-4">PHASE</th>
                  <th className="py-3.5 px-4">DATE RANGE</th>
                  <th className="py-3.5 px-4">STUDENT</th>
                  <th className="py-3.5 px-4">COMPANY</th>
                  <th className="py-3.5 px-4">ROLE</th>
                  <th className="py-3.5 px-4">JOB LEVEL</th>
                  <th className="py-3.5 px-4">DATE APPLIED</th>
                  <th className="py-3.5 px-4 text-center">STATUS JAT</th>
                  <th className="py-3.5 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredRequests.map((item) => {
                  const { application } = item;
                  return (
                    <tr
                      key={application.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-5 font-extrabold text-[#1E293B]">
                        {item.batchName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#334155]">
                        Phase {application.phaseNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#1E293B] block">
                          {application.dateRangeLabel}
                        </span>
                        {item.dateRangeStartDate && item.dateRangeEndDate && (
                          <span className="text-[11px] text-[#64748B]">
                            {formatDateId(item.dateRangeStartDate)} &ndash;{' '}
                            {formatDateId(item.dateRangeEndDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/jat/batches/${item.batchId}/students/${item.studentId}`}
                          className="font-extrabold text-[#006878] hover:underline block"
                        >
                          {item.studentName}
                        </Link>
                        <span className="text-[11px] text-[#64748B]">
                          {item.bootcampCohortName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#1E293B] block">
                          {application.company}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {application.location} &bull; {application.workSystem}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                        {application.role}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#334155] block">
                          {application.jobLevel}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {application.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#1E293B] block">
                          {formatDateId(application.dateApplied)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            item.isWithinConfiguredDateRange
                              ? 'text-[#047857]'
                              : 'text-[#B91C1C]'
                          }`}
                        >
                          {item.isWithinConfiguredDateRange
                            ? 'Sesuai Range'
                            : 'Di Luar Range'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={application.validationStatus} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicationId(application.id)}
                          aria-label={`Konfirmasi request ${item.studentName} di ${application.company}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-extrabold shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Konfirmasi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HITL Evidence Review & Inspector Modal (Stitch b490bfff) */}
      <AdminHitlInspectorModal
        isOpen={Boolean(selectedInspectionItem)}
        item={selectedInspectionItem}
        actorRole={actorRole}
        onClose={() => setSelectedApplicationId(null)}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
};
