import React, { useState } from 'react';
import { validateBatchDeleteConfirmation } from '../../services/batchValidator';

interface DeleteBatchModalProps {
  isOpen: boolean;
  batchName: string;
  participantCount: number;
  onCancel: () => void;
  onConfirmDelete: (typedBatchName: string) => void;
}

/**
 * Implements JAT-BL-16, BR-09, and Confirmed Decision DSN-TBD-05:
 * Deleting a JAT Batch requires confirmation and exact batch-name matching.
 * Canceling does not delete data.
 */
export const DeleteBatchModal: React.FC<DeleteBatchModalProps> = ({
  isOpen,
  batchName,
  participantCount,
  onCancel,
  onConfirmDelete,
}) => {
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isExactMatch = typedName.trim() === batchName.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isProcessing) return; // Prevent duplicate submissions caused by rapid repeated clicks (BLG-JAT-040)
    const check = validateBatchDeleteConfirmation(batchName, typedName);
    if (!check.valid) {
      setError(check.error || 'Nama batch tidak sesuai.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      onConfirmDelete(typedName);
    } finally {
      setIsProcessing(false);
      setTypedName('');
    }
  };

  const handleCancel = () => {
    if (isProcessing) return;
    setTypedName('');
    setError(null);
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-batch-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <h3
                id="delete-batch-modal-title"
                className="text-lg font-bold text-[#1E293B] leading-snug"
              >
                Hapus Batch JAT?
              </h3>
              <p className="text-xs text-[#64748B]">
                Tindakan destruktif permanen (BR-09)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            aria-label="Tutup dialog"
            className="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-slate-200 flex items-center justify-center text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="text-sm text-[#475569] space-y-2 leading-relaxed">
          <p>
            Apakah Anda yakin ingin menghapus batch{' '}
            <strong className="text-[#1E293B] font-bold">{batchName}</strong>?
          </p>
          {participantCount > 0 && (
            <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#F59E0B]/40 text-xs text-[#B45309]">
              Perhatian: Batch ini memiliki <strong>{participantCount} peserta</strong> terdaftar.
              Menghapus batch akan mencabut konfigurasi fase dan target terkait.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="confirm-batch-name-input"
              className="block text-xs font-semibold text-[#1E293B]"
            >
              Ketik <span className="font-mono font-bold text-[#B91C1C]">{batchName}</span> untuk
              mengonfirmasi penghapusan <span className="text-rose-600">*</span>
            </label>
            <input
              id="confirm-batch-name-input"
              type="text"
              disabled={isProcessing}
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={batchName}
              aria-invalid={Boolean(error)}
              className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] disabled:opacity-50"
            />
            {error && (
              <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#1E293B] transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isExactMatch || isProcessing}
              aria-busy={isProcessing}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-all ${
                isExactMatch && !isProcessing
                  ? 'bg-[#DC2626] hover:bg-red-700 shadow-sm cursor-pointer'
                  : 'bg-rose-300 cursor-not-allowed'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'progress_activity' : 'delete_forever'}
              </span>
              {isProcessing ? 'Memproses...' : 'Hapus Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
