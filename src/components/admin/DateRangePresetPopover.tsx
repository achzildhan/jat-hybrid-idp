import React from 'react';
import { formatIndonesianDate } from '../../utils/formatDate';

interface DateRangePresetPopoverProps {
  startDate: string;
  endDate: string;
  onApplyPreset: (startDate: string, endDate: string) => void;
  onClose: () => void;
}

/**
 * Reconstructed from Stitch Screen `2bbe1483ef6c4cd6bc2ff37419f3f615`:
 * "Admin - Create Batch JAT (Pop-up Pilih Tanggal)"
 * Provides quick range presets (7 Hari, 14 Hari, 30 Hari, Bulan Ini) and enforces BR-03 (Start Date <= End Date).
 */
export const DateRangePresetPopover: React.FC<DateRangePresetPopoverProps> = ({
  startDate,
  endDate,
  onApplyPreset,
  onClose,
}) => {
  const applyDurationDays = (days: number) => {
    const base = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date('2025-03-01T00:00:00Z');
    const startIso = base.toISOString().slice(0, 10);
    const endObj = new Date(base);
    endObj.setUTCDate(endObj.getUTCDate() + (days - 1));
    const endIso = endObj.toISOString().slice(0, 10);
    onApplyPreset(startIso, endIso);
  };

  return (
    <div
      className="mt-2 p-4 rounded-xl bg-white border border-[#CBD5E1] shadow-xl space-y-3"
      role="region"
      aria-label="Pop-up Pilih Rentang Tanggal"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0BB1CB] text-[18px]">date_range</span>
          <span className="text-xs font-bold text-[#1E293B]">
            Pilihan Cepat Rentang Tanggal
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#64748B] hover:text-[#1E293B] cursor-pointer"
        >
          Tutup
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-[#64748B]">Preset Cepat:</span>
        <button
          type="button"
          onClick={() => applyDurationDays(7)}
          className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E6F7F9] hover:text-[#006878] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
        >
          7 Hari
        </button>
        <button
          type="button"
          onClick={() => applyDurationDays(14)}
          className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E6F7F9] hover:text-[#006878] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
        >
          14 Hari
        </button>
        <button
          type="button"
          onClick={() => applyDurationDays(30)}
          className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E6F7F9] hover:text-[#006878] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
        >
          30 Hari
        </button>
        <button
          type="button"
          onClick={() => onApplyPreset('2025-03-01', '2025-03-31')}
          className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E6F7F9] hover:text-[#006878] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
        >
          Bulan Maret 2025
        </button>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs text-[#475569] bg-[#F8FAFC] px-3 py-2 rounded-lg">
        <span>
          Rentang Terpilih:{' '}
          <strong className="text-[#1E293B]">
            {formatIndonesianDate(startDate)} &ndash; {formatIndonesianDate(endDate)}
          </strong>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 rounded-md bg-[#0BB1CB] text-white font-bold text-xs cursor-pointer"
        >
          Pilih Rentang Tanggal
        </button>
      </div>
    </div>
  );
};
