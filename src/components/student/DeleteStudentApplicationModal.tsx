import React, { useState } from 'react';
import type { StudentApplicationRecord } from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';
import { StatusBadge } from '../common/StatusBadge';

interface DeleteStudentApplicationModalProps {
  isOpen: boolean;
  application: StudentApplicationRecord | null;
  onCancel: () => void;
  onConfirmDelete: (applicationId: string) => void;
}

/**
 * Reconstructed from Approved Stitch Screen:
 * - `acd1310968e246268e1d56fea1c76283` ("Student - JAT Delete Proof Confirmation Modal (Enhanced)")
 *
 * Allows a Student to retract/delete an unapproved submission only after explicit confirmation.
 * Canceling preserves the record intact.
 */
export const DeleteStudentApplicationModal: React.FC<
  DeleteStudentApplicationModalProps
> = ({ isOpen, application, onCancel, onConfirmDelete }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleConfirm = () => {
    setErrorMessage(null);
    try {
      onConfirmDelete(application.id);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus bukti pengajuan lamaran.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-student-proof-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>

          <div className="space-y-1.5">
            <h2
              id="delete-student-proof-title"
              className="text-base font-extrabold text-[#0F172A]"
            >
              Hapus Bukti Pengajuan Lamaran?
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Apakah Anda yakin ingin menarik kembali dan menghapus bukti lamaran ini dari
              daftar pengajuan JAT Anda? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          {/* Target Application Summary Card */}
          <div className="bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl p-3.5 text-left space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-[#1E293B]">
                  {application.company}
                </p>
                <p className="text-[11px] font-semibold text-[#475569]">
                  {application.role} &bull; {application.jobLevel}
                </p>
              </div>
              <StatusBadge status={application.validationStatus} />
            </div>
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Dilamar: {formatDateId(application.dateApplied)}</span>
              <span className="font-semibold text-[#006878] truncate max-w-[180px]">
                {application.evidenceFileName}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 text-left text-xs font-bold text-[#B91C1C]"
            >
              {errorMessage}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#F8FAFB] border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#334155] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Ya, Hapus Bukti Lamaran
          </button>
        </div>
      </div>
    </div>
  );
};
