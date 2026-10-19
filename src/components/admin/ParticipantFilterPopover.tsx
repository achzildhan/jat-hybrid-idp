import React from 'react';
import type { BootcampCohortOption, ParticipantPacingStatus } from '../../types/jat';

interface ParticipantFilterPopoverProps {
  isOpen: boolean;
  selectedStatuses: ParticipantPacingStatus[];
  selectedProgram: string;
  selectedCohortId: string;
  selectedQuotaRange: 'all' | 'lt50' | '50to79' | 'gte80';
  programs: string[];
  cohorts: BootcampCohortOption[];
  onToggleStatus: (status: ParticipantPacingStatus) => void;
  onChangeProgram: (program: string) => void;
  onChangeCohort: (cohortId: string) => void;
  onChangeQuotaRange: (range: 'all' | 'lt50' | '50to79' | 'gte80') => void;
  onReset: () => void;
  onClose: () => void;
}

/**
 * Reconstructed from Approved Stitch Screen `d33b62211dda44a6854f4ce67c93d736`:
 * "Admin - JAT Batch Detail (Pop-up Filter Student Participant)"
 */
export const ParticipantFilterPopover: React.FC<ParticipantFilterPopoverProps> = ({
  isOpen,
  selectedStatuses,
  selectedProgram,
  selectedCohortId,
  selectedQuotaRange,
  programs,
  cohorts,
  onToggleStatus,
  onChangeProgram,
  onChangeCohort,
  onChangeQuotaRange,
  onReset,
  onClose,
}) => {
  if (!isOpen) return null;

  const statusOptions: { value: ParticipantPacingStatus; label: string; tag: string }[] = [
    { value: 'On Track', label: 'On Track', tag: 'Normal' },
    { value: 'Needs Reminder', label: 'Needs Reminder', tag: 'Lagging' },
    { value: 'Completed', label: 'Completed', tag: 'Target Met' },
  ];

  const quotaOptions: { value: 'all' | 'lt50' | '50to79' | 'gte80'; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'lt50', label: '< 50%' },
    { value: '50to79', label: '50% - 79%' },
    { value: 'gte80', label: '≥ 80%' },
  ];

  return (
    <div
      className="absolute right-0 top-12 z-40 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-[#CBD5E1] p-5 flex flex-col gap-4"
      role="region"
      aria-label="Filter Peserta Batch"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E6F7F9] flex items-center justify-center text-[#006878]">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <h4 className="text-sm font-bold text-[#1E293B]">Filter Peserta Batch</h4>
        </div>
        <button
          type="button"
          aria-label="Tutup filter peserta"
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Status Target Progress */}
      <div className="space-y-1.5">
        <span className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          Status Target Progress
        </span>
        <div className="space-y-1">
          {statusOptions.map((opt) => {
            const checked = selectedStatuses.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleStatus(opt.value)}
                    className="w-4 h-4 rounded text-[#0BB1CB] focus:ring-[#0BB1CB]"
                  />
                  <span className="text-xs font-medium text-[#1E293B]">{opt.label}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] text-[10px] font-bold">
                  {opt.tag}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Base Program / Track */}
      <div className="space-y-1.5">
        <label
          htmlFor="filter-participant-program"
          className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider"
        >
          Base Program / Track
        </label>
        <select
          id="filter-participant-program"
          value={selectedProgram}
          onChange={(e) => onChangeProgram(e.target.value)}
          className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:bg-white focus:border-[#0BB1CB]"
        >
          <option value="all">Semua Track</option>
          {programs.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Asal Bootcamp */}
      <div className="space-y-1.5">
        <label
          htmlFor="filter-participant-cohort"
          className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider"
        >
          Batch Asal Bootcamp
        </label>
        <select
          id="filter-participant-cohort"
          value={selectedCohortId}
          onChange={(e) => onChangeCohort(e.target.value)}
          className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:bg-white focus:border-[#0BB1CB]"
        >
          <option value="all">Semua Batch</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quota Range */}
      <div className="space-y-1.5">
        <span className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          Rentang Pencapaian Target Phase 1
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {quotaOptions.map((q) => (
            <button
              key={q.value}
              type="button"
              onClick={() => onChangeQuotaRange(q.value)}
              className={`py-1.5 px-1 rounded-lg text-center text-[11px] font-bold transition-colors cursor-pointer ${
                selectedQuotaRange === q.value
                  ? 'bg-[#E6F7F9] text-[#006878] ring-1 ring-[#0BB1CB]'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:underline cursor-pointer"
        >
          Reset Filter
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
          <span>Terapkan Filter</span>
        </button>
      </div>
    </div>
  );
};
