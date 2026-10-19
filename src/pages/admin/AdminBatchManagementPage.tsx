import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DeleteBatchModal } from '../../components/admin/DeleteBatchModal';
import { batchRepository } from '../../services/batchRepository';
import { getPhaseOverallStartEnd } from '../../services/batchValidator';
import type { JatBatch } from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

/**
 * Reconstructed from Approved Stitch Screen `c9da5cf3e5f84e1ea151c48d4838b0a1`:
 * "Admin - JAT Batch Management"
 * Implements EP-JAT-01 (JAT-BL-01, JAT-BL-16, BR-09, DSN-TBD-05).
 */
export const AdminBatchManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState<JatBatch[]>(() => batchRepository.listBatches());
  const [pageSize, setPageSize] = useState(10);
  const [batchToDelete, setBatchToDelete] = useState<JatBatch | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;
    const q = searchQuery.trim().toLowerCase();
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.affiliatedCohorts.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [batches, searchQuery]);

  const displayedBatches = useMemo(
    () => filteredBatches.slice(0, pageSize),
    [filteredBatches, pageSize]
  );

  const totalParticipants = useMemo(
    () => batches.reduce((sum, b) => sum + b.participants.length, 0),
    [batches]
  );

  const totalCompletedRatio = useMemo(() => {
    let completed = 0;
    let target = 0;
    batches.forEach((b) => {
      b.participants.forEach((p) => {
        completed += p.phase1CompletedCount + p.phase2CompletedCount;
        target += p.phase1TargetCount + p.phase2TargetCount;
      });
    });
    if (target === 0) return '0%';
    return `${Math.round((completed / target) * 1000) / 10}%`;
  }, [batches]);

  const handleConfirmDelete = (typedName: string) => {
    if (!batchToDelete) return;
    const deletedName = batchToDelete.name;
    batchRepository.deleteBatch(batchToDelete.id, typedName);
    setBatches(batchRepository.listBatches());
    setBatchToDelete(null);
    setFeedbackToast(`Batch "${deletedName}" berhasil dihapus.`);
  };

  const handleResetDemoData = () => {
    const reset = batchRepository.resetToDefault();
    setBatches(reset);
    setSearchQuery('');
    setFeedbackToast('Data demo batch dikembalikan ke kondisi awal.');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            Job Application Tracker
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Kelola jadwal batch JAT, konfigurasi fase (Phase 1 &amp; Phase 2), rentang tanggal, dan
            target lamaran per level pekerjaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
              search
            </span>
            <input
              type="text"
              aria-label="Cari Nama Batch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Batch..."
              className="w-full pl-10 pr-8 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0BB1CB]/20 focus:border-[#0BB1CB] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Bersihkan pencarian"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
          >
            Reset Data Demo
          </button>

          {/* Primary Create Action */}
          <Link
            to="/admin/jat/batches/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0BB1CB] hover:bg-[#006878] text-white font-semibold text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Buat Batch Baru</span>
          </Link>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackToast && (
        <div
          role="status"
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-xs font-semibold text-[#047857]"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{feedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-[#047857] hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Batch Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
        {displayedBatches.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#1E293B]">Batch Tidak Ditemukan</h2>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada batch JAT yang cocok dengan kata kunci "${searchQuery}".`
                  : 'Belum ada batch JAT yang terdaftar.'}
              </p>
            </div>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0BB1CB] text-white text-xs font-bold hover:bg-[#006878] transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            ) : (
              <Link
                to="/admin/jat/batches/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0BB1CB] text-white text-xs font-bold hover:bg-[#006878] transition-colors"
              >
                + Buat Batch Baru
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Batch Name
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Phase 1 Start
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Phase 1 End
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Phase 2 Start
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Phase 2 End
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Total Peserta
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748B] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-sm">
                {displayedBatches.map((batch) => {
                  const p1Dates = getPhaseOverallStartEnd(batch.phase1);
                  const p2Dates = getPhaseOverallStartEnd(batch.phase2);

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-[#F8FAFC]/80 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <Link
                            to={`/admin/jat/batches/${batch.id}`}
                            className="font-bold text-[#1E293B] group-hover:text-[#006878] transition-colors"
                          >
                            {batch.name}
                          </Link>
                          <span className="text-xs text-[#64748B] mt-0.5">
                            {batch.affiliatedCohorts.map((c) => c.name).join(', ') ||
                              'Tanpa Batch Terafiliasi'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#475569] tabular-nums">
                        {formatDateId(p1Dates.startDate)}
                      </td>
                      <td className="py-4 px-4 text-[#475569] tabular-nums">
                        {formatDateId(p1Dates.endDate)}
                      </td>
                      <td className="py-4 px-4 text-[#475569] tabular-nums">
                        {batch.phase2.enabled ? (
                          formatDateId(p2Dates.startDate)
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F1F5F9] text-[11px] font-semibold text-[#64748B]">
                            Opsional (Nonaktif)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-[#475569] tabular-nums">
                        {batch.phase2.enabled ? formatDateId(p2Dates.endDate) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#1E293B] tabular-nums">
                          {batch.participants.length} Siswa
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/jat/batches/${batch.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0BB1CB]/40 text-[#006878] bg-[#E6F7F9]/40 hover:bg-[#0BB1CB] hover:text-white font-semibold text-xs transition-all cursor-pointer"
                          >
                            <span>Lihat Detail</span>
                            <span className="material-symbols-outlined text-[15px]">
                              arrow_forward
                            </span>
                          </button>
                          <Link
                            to={`/admin/jat/batches/${batch.id}/edit`}
                            aria-label={`Edit ${batch.name}`}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#475569] hover:text-[#006878] hover:bg-[#F1F5F9] transition-colors"
                            title="Edit Jadwal & Target Batch"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </Link>
                          <button
                            type="button"
                            aria-label={`Hapus ${batch.name}`}
                            onClick={() => setBatchToDelete(batch)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEF2F2] hover:border-[#EF4444]/30 transition-colors cursor-pointer"
                            title="Hapus Batch (BR-09)"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC]/60 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <span>Show:</span>
            <select
              aria-label="Jumlah baris per halaman"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1 font-semibold text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#0BB1CB]"
            >
              <option value={10}>10 Data</option>
              <option value={25}>25 Data</option>
              <option value={50}>50 Data</option>
            </select>
            <span className="ml-2 text-[#64748B]">
              Menampilkan {displayedBatches.length} dari {filteredBatches.length} batch
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40"
              aria-label="Halaman sebelumnya"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0BB1CB] text-white font-bold text-xs shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40"
              aria-label="Halaman berikutnya"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Summary Cards (Stitch c9da5cf3 bottom section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6F7F9] flex items-center justify-center text-[#006878]">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Total Active Cohorts</p>
            <h2 className="text-xl font-extrabold text-[#1E293B] tabular-nums">
              {batches.length} Batches
            </h2>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#047857]">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Enrolled Participants</p>
            <h2 className="text-xl font-extrabold text-[#1E293B] tabular-nums">
              {totalParticipants} Students
            </h2>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-[#B45309]">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Application Submission Rate</p>
            <h2 className="text-xl font-extrabold text-[#1E293B] tabular-nums">
              {totalCompletedRatio} Avg.
            </h2>
          </div>
        </div>
      </div>

      {/* Delete Batch Modal (BR-09 & DSN-TBD-05) */}
      <DeleteBatchModal
        isOpen={Boolean(batchToDelete)}
        batchName={batchToDelete?.name || ''}
        participantCount={batchToDelete?.participants.length || 0}
        onCancel={() => setBatchToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
