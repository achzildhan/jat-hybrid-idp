import React, { useState } from 'react';
import type { BootcampCohortOption } from '../../types/jat';

interface BootcampCohortPopoverProps {
  cohorts: BootcampCohortOption[];
  selectedIds: string[];
  onChange: (newSelectedIds: string[]) => void;
  onClose: () => void;
}

/**
 * Reconstructed from Stitch Screen `b9c1ad844c6a45918cfbac6216ee351c`:
 * "Admin - Create Batch JAT (Pop-up Pilih Batch Bootcamp)"
 */
export const BootcampCohortPopover: React.FC<BootcampCohortPopoverProps> = ({
  cohorts,
  selectedIds,
  onChange,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = cohorts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCohort = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div
      className="mt-2 w-full max-w-lg rounded-xl bg-white shadow-xl border border-[#CBD5E1] p-4 z-30 space-y-3"
      role="region"
      aria-label="Pilih Batch Bootcamp Terafiliasi"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div>
          <h4 className="text-sm font-bold text-[#1E293B]">Pilih Batch Bootcamp Terafiliasi</h4>
          <p className="text-xs text-[#64748B]">
            Pilih satu atau beberapa cohort bootcamp untuk dihubungkan ke Batch JAT ini.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F9] text-[#006878] text-xs font-bold">
          {selectedIds.length} Terpilih
        </span>
      </div>

      {/* Search Cohort */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari batch bootcamp..."
          aria-label="Cari batch bootcamp"
          className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:bg-white focus:border-[#0BB1CB]"
        />
      </div>

      {/* Cohort Checkbox List */}
      <div className="max-h-52 overflow-y-auto divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#64748B]">
            Tidak ada batch bootcamp yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filtered.map((cohort) => {
            const checked = selectedIds.includes(cohort.id);
            return (
              <label
                key={cohort.id}
                className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                  checked ? 'bg-[#E6F7F9]/50' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCohort(cohort.id)}
                    className="w-4 h-4 rounded text-[#0BB1CB] focus:ring-[#0BB1CB] cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1E293B]">{cohort.name}</p>
                    <p className="text-[11px] text-[#64748B]">{cohort.program}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold">
                  {cohort.studentCount} Siswa
                </span>
              </label>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] cursor-pointer"
        >
          Reset Pilihan
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Terapkan Pilihan
        </button>
      </div>
    </div>
  );
};
