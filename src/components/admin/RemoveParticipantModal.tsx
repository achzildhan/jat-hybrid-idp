import React from 'react';
import type { StudentParticipant } from '../../types/jat';

interface RemoveParticipantModalProps {
  isOpen: boolean;
  batchName: string;
  participant: StudentParticipant | null;
  applicationCount: number;
  onCancel: () => void;
  onConfirmRemove: () => void;
}

/**
 * Reconstructed from Approved Stitch Screen `302304fd4a5b4fde9267a202d583c4bb`:
 * "Admin - Student Detail (Hapus dari Batch Confirmation Modal)"
 *
 * Implements EP-JAT-02 (BLG-JAT-006, BLG-JAT-007, BR-09, JAT-BL-16):
 * - Requires explicit Admin confirmation before removing a Student from a batch.
 * - Canceling preserves the participant and all related data.
 * - Documents archival behavior: StudentIdentity and historical application records
 *   are preserved in archive rather than silently deleted.
 */
export const RemoveParticipantModal: React.FC<RemoveParticipantModalProps> = ({
  isOpen,
  batchName,
  participant,
  applicationCount,
  onCancel,
  onConfirmRemove,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen || !participant) return null;

  const handleConfirm = () => {
    if (isProcessing) return; // Prevent duplicate submissions on rapid clicks (BLG-JAT-040)
    setIsProcessing(true);
    try {
      onConfirmRemove();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-participant-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#B91C1C] shrink-0">
              <span className="material-symbols-outlined text-[26px]">person_remove</span>
            </div>
            <div>
              <h3
                id="remove-participant-modal-title"
                className="text-lg font-bold text-[#1E293B] leading-snug"
              >
                Hapus Student dari {batchName}?
              </h3>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Konfirmasi Tindakan Destruktif (BR-09)
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Tutup dialog konfirmasi hapus student"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body & Impact Card */}
        <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
          <p>
            Apakah Anda yakin ingin menghapus{' '}
            <strong className="text-[#1E293B] font-bold">{participant.name}</strong> dari
            partisipasi <strong className="text-[#1E293B] font-bold">{batchName}</strong>?
          </p>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-semibold">Nama Student:</span>
              <span className="font-bold text-[#1E293B]">
                {participant.name} ({participant.baseProgram})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-semibold">Cohort Bootcamp:</span>
              <span className="font-semibold text-[#475569]">
                {participant.bootcampCohortName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-semibold">Progres Saat Ini:</span>
              <span className="font-bold text-[#006878]">
                Phase 1 ({participant.phase1CompletedCount}/{participant.phase1TargetCount} Selesai)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-semibold">Riwayat Lamaran Tercatat:</span>
              <span className="font-bold text-[#1E293B]">{applicationCount} Lamaran</span>
            </div>
          </div>

          {/* Archival & Non-Silent Cascade Warning (BLG-JAT-007) */}
          <div className="bg-[#FFFBEB] border border-[#F59E0B]/40 rounded-xl p-3.5 text-xs text-[#B45309] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0 text-[#F59E0B] mt-0.5">
              warning_amber
            </span>
            <p className="leading-relaxed">
              <strong>Catatan Arsip &amp; Integritas Data:</strong> Menghapus peserta hanya mencabut
              relasi keanggotaan dari <strong>{batchName}</strong>. Identitas utama student di
              direktori bootcamp dan riwayat bukti lamaran yang sudah tercatat tetap tersimpan di
              arsip (tidak dihapus secara diam-diam).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            aria-busy={isProcessing}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              isProcessing
                ? 'bg-rose-300 cursor-not-allowed'
                : 'bg-[#DC2626] hover:bg-red-700 cursor-pointer'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isProcessing ? 'animate-spin' : ''}`}>
              {isProcessing ? 'progress_activity' : 'delete_forever'}
            </span>
            <span>{isProcessing ? 'Memproses...' : 'Ya, Hapus Student'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
