import React from 'react';
import type { BootcampCohortOption, CreateOrUpdateBatchInput } from '../../types/jat';
import { calculatePhaseTotalTarget } from '../../services/batchValidator';
import type { ConsequentialBatchEditImpact } from '../../services/progressCalculator';

interface SaveBatchConfirmationModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  input: CreateOrUpdateBatchInput;
  selectedCohorts: BootcampCohortOption[];
  consequentialImpact?: ConsequentialBatchEditImpact;
  onCancel: () => void;
  onConfirmSave: () => void;
}

/**
 * Reconstructed from Stitch Screen `cf1165af81c341fdb878b4c798a3ea15`:
 * "Admin - Create Batch JAT (Confirmation Modal Dialog)"
 * Implements BR-08, BR-14 & BR-42 confirmation before saving/editing schedule and targets.
 */
export const SaveBatchConfirmationModal: React.FC<SaveBatchConfirmationModalProps> = ({
  isOpen,
  isEditMode,
  input,
  selectedCohorts,
  consequentialImpact,
  onCancel,
  onConfirmSave,
}) => {
  if (!isOpen) return null;

  const p1Target = calculatePhaseTotalTarget(input.phase1);
  const p2Target = calculatePhaseTotalTarget(input.phase2);
  const totalTarget = p1Target + p2Target;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-batch-confirm-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#E2E8F0] flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-[#FFFBEB] text-[#B45309] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">published_with_changes</span>
          </div>
          <div className="flex-1">
            <h3
              id="save-batch-confirm-title"
              className="text-lg font-bold text-[#1E293B] leading-snug"
            >
              {isEditMode
                ? 'Simpan & Sinkronkan Perubahan Batch?'
                : 'Simpan & Terapkan Jadwal Batch?'}
            </h3>
            <p className="text-sm text-[#475569] mt-1 leading-relaxed">
              Anda akan menyimpan konfigurasi JAT untuk program{' '}
              <strong className="text-[#1E293B]">{input.name}</strong> dengan{' '}
              <strong>{selectedCohorts.length} batch bootcamp</strong> terafiliasi.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#64748B]">Batch Bootcamp Terafiliasi:</span>
            <span className="font-bold text-[#1E293B] text-right">
              {selectedCohorts.map((c) => c.name).join(', ') || '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748B]">Phase 1 (Wajib):</span>
            <span className="font-bold text-[#1E293B]">
              {input.phase1.dateRanges.length} Date Range ({p1Target} Lamaran)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748B]">Phase 2 (Opsional):</span>
            <span className="font-bold text-[#475569]">
              {input.phase2.enabled
                ? `Aktif — ${input.phase2.dateRanges.length} Date Range (${p2Target} Lamaran)`
                : 'Tidak Diaktifkan (Phase 1 Saja)'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#E2E8F0]">
            <span className="text-[#64748B] font-semibold">Total Target Komitmen:</span>
            <span className="font-bold text-[#006878] text-sm">{totalTarget} Lamaran Kerja</span>
          </div>
        </div>

        {isEditMode && consequentialImpact?.isConsequential && (
          <div
            data-testid="consequential-edit-impact-panel"
            className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/40 text-xs text-[#92400E] space-y-2"
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#B45309]">
                  warning
                </span>
                <span>Dampak Perubahan Konsekuensial</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-[#B45309] text-[10px]">
                {consequentialImpact.affectedParticipantsCount} Peserta Terdampak
              </span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              {consequentialImpact.summaryPoints.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {isEditMode && (
          <div className="p-3 rounded-xl bg-[#E6F7F9]/70 border border-[#0BB1CB]/30 text-xs text-[#003E49] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-[#006878] shrink-0 mt-0.5">
              sync
            </span>
            <span>
              <strong>Catatan Sinkronisasi:</strong> Perubahan periode
              dan target akan disinkronkan ke tampilan Student tanpa duplikasi range. Bukti lamaran
              yang diajukan sebelum perubahan rentang tanggal tetap mempertahankan validitas
              historisnya.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
          >
            Periksa Kembali
          </button>
          <button
            type="button"
            onClick={onConfirmSave}
            className="h-10 px-6 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Ya, Simpan &amp; Aktifkan
          </button>
        </div>
      </div>
    </div>
  );
};

