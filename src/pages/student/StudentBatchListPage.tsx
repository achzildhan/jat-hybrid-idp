import React from 'react';
import { Link } from 'react-router-dom';
import { useStudentPrototype } from '../../context/StudentPrototypeContext';
import { batchRepository } from '../../services/batchRepository';
import { evaluateBatchAccess } from '../../services/batchValidator';
import type { PeriodWindowStatus } from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

const PERIOD_BADGE_CONFIG: Record<
  PeriodWindowStatus,
  { label: string; className: string; dotClass: string }
> = {
  Active: {
    label: 'Active (Periode Berjalan)',
    className: 'bg-[#ECFDF5] text-[#047857] border-[#10B981]/40',
    dotClass: 'bg-[#10B981]',
  },
  Upcoming: {
    label: 'Upcoming (Belum Dimulai)',
    className: 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/40',
    dotClass: 'bg-[#F59E0B]',
  },
  Expired: {
    label: 'Expired (Periode Berakhir)',
    className: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    dotClass: 'bg-[#64748B]',
  },
  Inactive: {
    label: 'Tidak Aktif',
    className: 'bg-[#F8FAFB] text-[#94A3B8] border-[#E2E8F0]',
    dotClass: 'bg-[#94A3B8]',
  },
};

/**
 * Reconstructed from Approved Stitch Screen:
 * - `a77fcde96d034478948b467133c09b3a` ("Student - JAT Batch List")
 *
 * Implements EP-JAT-03 (BLG-JAT-009, BLG-JAT-010, BLG-JAT-011):
 * - Displays batches assigned to the currently selected synthetic Student.
 * - Shows exact Phase 1 and optional Phase 2 start/end dates configured by Admin (BR-04, BR-06).
 * - Differentiates Active, Upcoming, Expired, and Inactive period states (BR-07).
 * - Displays an empty state when the selected Student has no assigned batch.
 */
export const StudentBatchListPage: React.FC = () => {
  const { selectedStudentId, selectedStudent, referenceDate, setSelectedStudentId } =
    useStudentPrototype();

  const studentBatches = batchRepository.listBatchesForStudent(selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Talent Support Horizontal Sub-Navigation Tabs (Stitch a77fcde9) */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-6 overflow-x-auto">
        {[
          { label: 'Layanan Talent Support', active: false },
          { label: 'Job Application Tracking', active: true },
          { label: 'Talent Support Recording Practice', active: false },
          { label: 'Job Connector', active: false },
        ].map((tab) => (
          <div
            key={tab.label}
            className={`pb-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              tab.active
                ? 'border-[#0BB1CB] text-[#006878]'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Page Title & Student Context Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-[#1E293B]">
              Job Application Tracking (JAT)
            </h1>
            {selectedStudent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F7F9] text-[#006878] border border-[#0BB1CB]/30">
                {selectedStudent.readinessBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B]">
            Pantau jadwal periode Phase 1 &amp; Phase 2, target level pekerjaan, serta progres
            pencapaian kuota lamaran Anda sesuai konfigurasi Talent Support.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#F8FAFB] px-4 py-2.5 rounded-xl border border-[#E2E8F0]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Peserta Aktif
            </p>
            <p className="text-xs font-extrabold text-[#1E293B]">
              {selectedStudent?.name ?? '-'}
            </p>
          </div>
          <div className="h-7 w-px bg-[#E2E8F0]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Batch Terdaftar
            </p>
            <p className="text-xs font-extrabold text-[#006878]">
              {studentBatches.length} Batch JAT
            </p>
          </div>
        </div>
      </div>

      {/* Empty State when Student has NO assigned batch */}
      {studentBatches.length === 0 ? (
        <div
          role="region"
          aria-label="Empty State Batch JAT"
          className="bg-white rounded-xl p-10 border border-[#E2E8F0] shadow-xs text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[28px]">event_busy</span>
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-base font-extrabold text-[#1E293B]">
              Belum Ada Batch JAT yang Ditugaskan
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Mahasiswa <strong>{selectedStudent?.name}</strong> ({selectedStudent?.email}) saat ini
              belum terdaftar pada Batch Job Application Tracking mana pun. Silakan hubungi tim
              Talent Support atau pilih mahasiswa lain pada bar simulasi di atas.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedStudentId('stu-1')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">person_check</span>
              <span>Lihat Contoh Student Terdaftar (Marvin McKinney)</span>
            </button>
            <Link
              to="/admin/jat/batches"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFB] text-[#1E293B] text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              <span>Kelola Peserta di Admin Portal</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Student Batch List Table (Stitch a77fcde9) */
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-[#1E293B]">
                Daftar Batch Job Application Tracking Anda
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Menampilkan jadwal periode yang disinkronkan langsung dari konfigurasi Admin (BR-06).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Batch JAT</th>
                  <th className="py-3.5 px-6">Phase 1 Periode</th>
                  <th className="py-3.5 px-6">Phase 2 Periode</th>
                  <th className="py-3.5 px-6">Status Periode</th>
                  <th className="py-3.5 px-6">Target &amp; Progres Kuota</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {studentBatches.map((batch) => {
                  const viewModel = batchRepository.getStudentBatchView(
                    batch.id,
                    selectedStudentId,
                    referenceDate
                  );
                  const access = evaluateBatchAccess(batch, referenceDate);
                  const p1Access = access.phase1Access;
                  const p2Access = access.phase2Access;
                  const periodBadge = PERIOD_BADGE_CONFIG[access.periodStatus];

                  const overallCompleted = viewModel?.overallCompletedCount ?? 0;
                  const overallTarget = viewModel?.overallTargetCount ?? 0;
                  const overallPct = viewModel?.overallPercentage ?? 0;

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-[#F8FAFB]/80 transition-colors"
                    >
                      {/* Batch Name */}
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-[#1E293B] text-sm">
                          {batch.name}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {batch.affiliatedCohorts.map((c) => c.name).join(', ')}
                        </div>
                      </td>

                      {/* Phase 1 Periode */}
                      <td className="py-4 px-6">
                        {p1Access.startDate && p1Access.endDate ? (
                          <div className="space-y-1">
                            <div className="font-bold text-[#1E293B]">
                              {formatDateId(p1Access.startDate)} &ndash;{' '}
                              {formatDateId(p1Access.endDate)}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                              <span>{p1Access.dateRanges.length} Date Range</span>
                              <span>&bull;</span>
                              <span>Target: {p1Access.totalTargetCount} Lamaran</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] italic">
                            Belum ada rentang tanggal dikonfigurasi
                          </span>
                        )}
                      </td>

                      {/* Phase 2 Periode (Optional per BR-04) */}
                      <td className="py-4 px-6">
                        {!p2Access.enabled ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1F5F9] text-[#64748B]">
                            Tidak Diaktifkan (Opsional &mdash; BR-04)
                          </span>
                        ) : p2Access.startDate && p2Access.endDate ? (
                          <div className="space-y-1">
                            <div className="font-bold text-[#1E293B]">
                              {formatDateId(p2Access.startDate)} &ndash;{' '}
                              {formatDateId(p2Access.endDate)}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                              <span>{p2Access.dateRanges.length} Date Range</span>
                              <span>&bull;</span>
                              <span>Target: {p2Access.totalTargetCount} Lamaran</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] italic">
                            Belum ada rentang tanggal dikonfigurasi
                          </span>
                        )}
                      </td>

                      {/* Period Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${periodBadge.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${periodBadge.dotClass}`}
                          />
                          {periodBadge.label}
                        </span>
                      </td>

                      {/* Target & Progress */}
                      <td className="py-4 px-6">
                        <div className="w-48 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-[#1E293B]">
                              {overallCompleted} / {overallTarget} Lamaran
                            </span>
                            <span className="font-bold text-[#006878]">{overallPct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#0BB1CB] transition-all"
                              style={{ width: `${overallPct}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            Phase 1: {viewModel?.phase1.completedCount ?? 0}/
                            {p1Access.totalTargetCount}
                            {p2Access.enabled &&
                              ` • Phase 2: ${viewModel?.phase2.completedCount ?? 0}/${p2Access.totalTargetCount}`}
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/student/talent-support/jat/${batch.id}`}
                          aria-label={`Detail ${batch.name}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          <span>Detail</span>
                          <span className="material-symbols-outlined text-[15px]">
                            arrow_forward
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
