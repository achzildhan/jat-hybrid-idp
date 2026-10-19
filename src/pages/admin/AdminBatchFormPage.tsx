import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BootcampCohortPopover } from '../../components/admin/BootcampCohortPopover';
import { DateRangePresetPopover } from '../../components/admin/DateRangePresetPopover';
import { SaveBatchConfirmationModal } from '../../components/admin/SaveBatchConfirmationModal';
import { JOB_LEVEL_OPTIONS } from '../../mocks/jatData';
import { batchRepository } from '../../services/batchRepository';
import {
  calculatePhaseTotalTarget,
  validateBatchInput,
} from '../../services/batchValidator';
import type {
  CreateOrUpdateBatchInput,
  DateRangeConfig,
  JobLevel,
  PhaseConfig,
} from '../../types/jat';

function createDefaultDateRange(index: number): DateRangeConfig {
  const monthNumber = ((2 + Math.max(1, index) - 1) % 12) + 1;
  const yearOffset = Math.floor((2 + Math.max(1, index) - 1) / 12);
  const year = 2025 + yearOffset;
  const monthStr = String(monthNumber).padStart(2, '0');
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return {
    id: `range-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    label: `Date Range ${index}`,
    startDate: `${year}-${monthStr}-01`,
    endDate: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
    targets: [
      {
        id: `target-${Date.now()}-1-${Math.random().toString(36).slice(2, 6)}`,
        jobLevel: 'Junior Level',
        targetCount: 5,
      },
    ],
  };
}

/**
 * Reconstructed from Approved Stitch Screens:
 * - `4e57b402a903497883677350ef640ef1` ("Admin - Create & Edit Batch JAT")
 * - `b9c1ad847e9e4a129bc8e4c830cf23a9` (Bootcamp Cohort Selector Popover)
 * - `2bbe14830b624f3c86ff28791df4df24` (Date Range Picker Popover)
 * - `cf1165af81c341fdb878b4c798a3ea15` (Confirmation Modal Dialog)
 *
 * Implements EP-JAT-01 (JAT-BL-02, JAT-BL-03, BR-01..BR-08).
 */
export const AdminBatchFormPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(batchId);

  const existingBatch = useMemo(
    () => (batchId ? batchRepository.getBatchById(batchId) : undefined),
    [batchId]
  );

  const availableCohorts = useMemo(() => batchRepository.listBootcampCohorts(), []);

  const [name, setName] = useState<string>(() => existingBatch?.name ?? '');
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>(() =>
    existingBatch ? existingBatch.affiliatedCohorts.map((c) => c.id) : ['cohort-uiux-21']
  );
  const [phase1, setPhase1] = useState<PhaseConfig>(() =>
    existingBatch
      ? structuredClone(existingBatch.phase1)
      : {
          phaseNumber: 1,
          enabled: true,
          dateRanges: [
            {
              id: 'p1-default-1',
              label: 'Date Range 1',
              startDate: '2025-03-01',
              endDate: '2025-03-31',
              targets: [
                { id: 'p1-t-1', jobLevel: 'Junior Level', targetCount: 5 },
                { id: 'p1-t-2', jobLevel: 'Senior Level', targetCount: 2 },
              ],
            },
          ],
        }
  );
  const [phase2, setPhase2] = useState<PhaseConfig>(() =>
    existingBatch
      ? structuredClone(existingBatch.phase2)
      : {
          phaseNumber: 2,
          enabled: false,
          dateRanges: [],
        }
  );

  const [isCohortPopoverOpen, setIsCohortPopoverOpen] = useState(false);
  const [activePresetRangeKey, setActivePresetRangeKey] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (isEditMode && !existingBatch) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center space-y-4">
        <h1 className="text-lg font-bold text-[#1E293B]">Batch JAT Tidak Ditemukan</h1>
        <p className="text-xs text-[#64748B]">
          Batch dengan ID &ldquo;{batchId}&rdquo; tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/admin/jat/batches"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0BB1CB] text-white text-xs font-bold"
        >
          Kembali ke Daftar Batch
        </Link>
      </div>
    );
  }

  const currentFormInput: CreateOrUpdateBatchInput = {
    name,
    affiliatedCohortIds: selectedCohortIds,
    phase1,
    phase2,
  };

  const selectedCohorts = availableCohorts.filter((c) => selectedCohortIds.includes(c.id));
  const p1TotalTarget = calculatePhaseTotalTarget(phase1);
  const p2TotalTarget = calculatePhaseTotalTarget(phase2);
  const grandTotalTarget = p1TotalTarget + p2TotalTarget;

  const consequentialImpact =
    isEditMode && batchId
      ? batchRepository.previewBatchEditImpact(batchId, currentFormInput)
      : undefined;

  const handleToggleCohort = (cohortId: string) => {
    setSelectedCohortIds((prev) =>
      prev.includes(cohortId) ? prev.filter((id) => id !== cohortId) : [...prev, cohortId]
    );
  };

  const handleTogglePhase2 = (enabled: boolean) => {
    setPhase2((prev) => {
      if (enabled && prev.dateRanges.length === 0) {
        return {
          phaseNumber: 2,
          enabled: true,
          dateRanges: [
            {
              id: `p2-range-${Date.now()}`,
              label: 'Date Range 1',
              startDate: '2025-05-01',
              endDate: '2025-05-31',
              targets: [{ id: `p2-target-${Date.now()}`, jobLevel: 'Junior Level', targetCount: 5 }],
            },
          ],
        };
      }
      return {
        ...prev,
        enabled,
      };
    });
  };

  const updatePhaseDateRange = (
    phaseKey: 'phase1' | 'phase2',
    rangeIndex: number,
    updater: (range: DateRangeConfig) => DateRangeConfig
  ) => {
    const setter = phaseKey === 'phase1' ? setPhase1 : setPhase2;
    setter((prev) => ({
      ...prev,
      dateRanges: prev.dateRanges.map((r, idx) => (idx === rangeIndex ? updater(r) : r)),
    }));
  };

  const addDateRangeToPhase = (phaseKey: 'phase1' | 'phase2') => {
    const setter = phaseKey === 'phase1' ? setPhase1 : setPhase2;
    setter((prev) => ({
      ...prev,
      dateRanges: [...prev.dateRanges, createDefaultDateRange(prev.dateRanges.length + 1)],
    }));
  };

  const removeDateRangeFromPhase = (phaseKey: 'phase1' | 'phase2', rangeIndex: number) => {
    const setter = phaseKey === 'phase1' ? setPhase1 : setPhase2;
    setter((prev) => ({
      ...prev,
      dateRanges: prev.dateRanges
        .filter((_, idx) => idx !== rangeIndex)
        .map((r, idx) => ({ ...r, label: `Date Range ${idx + 1}` })),
    }));
  };

  const addTargetToRange = (phaseKey: 'phase1' | 'phase2', rangeIndex: number) => {
    updatePhaseDateRange(phaseKey, rangeIndex, (range) => ({
      ...range,
      targets: [
        ...range.targets,
        {
          id: `target-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          jobLevel: 'Junior Level',
          targetCount: 5,
        },
      ],
    }));
  };

  const removeTargetFromRange = (
    phaseKey: 'phase1' | 'phase2',
    rangeIndex: number,
    targetIndex: number
  ) => {
    updatePhaseDateRange(phaseKey, rangeIndex, (range) => ({
      ...range,
      targets: range.targets.filter((_, idx) => idx !== targetIndex),
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingBatches = batchRepository.listBatches();
    const check = validateBatchInput(currentFormInput, existingBatches, batchId);
    if (!check.valid) {
      setValidationErrors(check.errors);
      return;
    }
    setValidationErrors({});
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (isEditMode && batchId) {
      batchRepository.updateBatch(batchId, currentFormInput, {
        confirmedConsequentialImpact: true,
      });
      setIsConfirmModalOpen(false);
      navigate(`/admin/jat/batches/${batchId}`);
    } else {
      const created = batchRepository.createBatch(currentFormInput);
      setIsConfirmModalOpen(false);
      navigate(`/admin/jat/batches/${created.id}`);
    }
  };

  const renderPhaseSection = (phaseKey: 'phase1' | 'phase2', phaseData: PhaseConfig) => {
    const isPhase1 = phaseKey === 'phase1';
    const phaseTitle = isPhase1 ? 'Phase 1' : 'Phase 2';

    return (
      <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
        {/* Phase Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-6 rounded-full ${
                isPhase1 || phaseData.enabled ? 'bg-[#0BB1CB]' : 'bg-slate-300'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1E293B]">{phaseTitle}</h3>
                {isPhase1 ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#E6F7F9] text-[#006878] rounded-md">
                    Wajib
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#64748B] rounded-md">
                    Opsional (BR-04)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isPhase1
                  ? 'Periode utama pengumpulan bukti lamaran kerja siswa.'
                  : 'Periode lanjutan opsional apabila batch memerlukan tahap pencarian kerja kedua.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isPhase1 && (
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#1E293B]">
                <input
                  type="checkbox"
                  aria-label="Aktifkan Phase 2"
                  checked={phaseData.enabled}
                  onChange={(e) => handleTogglePhase2(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0BB1CB] focus:ring-[#0BB1CB]"
                />
                <span>Aktifkan Phase 2</span>
              </label>
            )}

            {phaseData.enabled && (
              <button
                type="button"
                onClick={() => addDateRangeToPhase(phaseKey)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E6F7F9] hover:bg-[#0BB1CB] text-[#006878] hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Date Range</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase Body */}
        {!phaseData.enabled ? (
          <div className="p-6 text-center bg-[#F8FAFC]/40">
            <p className="text-xs text-[#64748B]">
              Phase 2 saat ini dinonaktifkan (Opsional sesuai BR-04). Centang{' '}
              <strong>Aktifkan Phase 2</strong> di atas jika batch ini memiliki jadwal tahap kedua.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {validationErrors[phaseKey] && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/30 text-xs font-semibold text-[#B91C1C]"
              >
                {validationErrors[phaseKey]}
              </div>
            )}

            {phaseData.dateRanges.map((range, rangeIdx) => {
              const rangeKey = `${phaseKey}.range.${rangeIdx}`;
              const startError = validationErrors[`${rangeKey}.startDate`];
              const endError = validationErrors[`${rangeKey}.endDate`];
              const datesError = validationErrors[`${rangeKey}.dates`];
              const targetsError = validationErrors[`${rangeKey}.targets`];

              return (
                <div
                  key={range.id}
                  className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] space-y-5 relative"
                >
                  {/* Date Range Header */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#006878]">
                        {phaseTitle} &mdash; Date Range {rangeIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActivePresetRangeKey(
                            activePresetRangeKey === rangeKey ? null : rangeKey
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[11px] font-semibold text-[#475569] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] text-[#0BB1CB]">
                          date_range
                        </span>
                        <span>Pilih Cepat Periode</span>
                      </button>

                      {phaseData.dateRanges.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Hapus ${phaseTitle} Date Range ${rangeIdx + 1}`}
                          onClick={() => removeDateRangeFromPhase(phaseKey, rangeIdx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Hapus Range</span>
                        </button>
                      )}

                      {activePresetRangeKey === rangeKey && (
                        <DateRangePresetPopover
                          startDate={range.startDate}
                          endDate={range.endDate}
                          onApplyPreset={(start, end) =>
                            updatePhaseDateRange(phaseKey, rangeIdx, (r) => ({
                              ...r,
                              startDate: start,
                              endDate: end,
                            }))
                          }
                          onClose={() => setActivePresetRangeKey(null)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Start Date & End Date Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`${rangeKey}-start`}
                        className="block text-xs font-bold text-[#475569]"
                      >
                        Start Date <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id={`${rangeKey}-start`}
                        type="date"
                        value={range.startDate}
                        onChange={(e) =>
                          updatePhaseDateRange(phaseKey, rangeIdx, (r) => ({
                            ...r,
                            startDate: e.target.value,
                          }))
                        }
                        className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0BB1CB]"
                      />
                      {startError && (
                        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                          {startError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor={`${rangeKey}-end`}
                        className="block text-xs font-bold text-[#475569]"
                      >
                        End Date <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id={`${rangeKey}-end`}
                        type="date"
                        value={range.endDate}
                        onChange={(e) =>
                          updatePhaseDateRange(phaseKey, rangeIdx, (r) => ({
                            ...r,
                            endDate: e.target.value,
                          }))
                        }
                        className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0BB1CB]"
                      />
                      {endError && (
                        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                          {endError}
                        </p>
                      )}
                    </div>
                  </div>

                  {datesError && (
                    <div
                      role="alert"
                      className="p-3 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/30 text-xs font-semibold text-[#B91C1C] flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{datesError}</span>
                    </div>
                  )}

                  {/* Job Level Targets Repeater */}
                  <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Target Job Level &amp; Jumlah Lamaran (BR-05)
                      </span>
                      <button
                        type="button"
                        onClick={() => addTargetToRange(phaseKey, rangeIdx)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#006878] hover:text-[#0BB1CB] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Add Target Job Level</span>
                      </button>
                    </div>

                    {targetsError && (
                      <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                        {targetsError}
                      </p>
                    )}

                    <div className="space-y-3">
                      {range.targets.map((target, targetIdx) => {
                        const targetKey = `${rangeKey}.target.${targetIdx}`;
                        const targetErr = validationErrors[targetKey];

                        return (
                          <div key={target.id} className="space-y-1">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-white p-3.5 rounded-lg border border-[#E2E8F0]">
                              <div className="sm:col-span-6 space-y-1">
                                <label
                                  htmlFor={`${targetKey}-level`}
                                  className="block text-[11px] font-semibold text-[#64748B]"
                                >
                                  Job Level
                                </label>
                                <select
                                  id={`${targetKey}-level`}
                                  value={target.jobLevel}
                                  onChange={(e) =>
                                    updatePhaseDateRange(phaseKey, rangeIdx, (r) => ({
                                      ...r,
                                      targets: r.targets.map((t, i) =>
                                        i === targetIdx
                                          ? { ...t, jobLevel: e.target.value as JobLevel }
                                          : t
                                      ),
                                    }))
                                  }
                                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
                                >
                                  {JOB_LEVEL_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="sm:col-span-5 space-y-1">
                                <label
                                  htmlFor={`${targetKey}-count`}
                                  className="block text-[11px] font-semibold text-[#64748B]"
                                >
                                  Job Applied (Target Lamaran)
                                </label>
                                <div className="relative">
                                  <input
                                    id={`${targetKey}-count`}
                                    type="number"
                                    min={1}
                                    value={target.targetCount}
                                    onChange={(e) =>
                                      updatePhaseDateRange(phaseKey, rangeIdx, (r) => ({
                                        ...r,
                                        targets: r.targets.map((t, i) =>
                                          i === targetIdx
                                            ? { ...t, targetCount: Number(e.target.value) }
                                            : t
                                        ),
                                      }))
                                    }
                                    className="w-full h-10 pl-3.5 pr-20 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-bold text-[#1E293B] tabular-nums focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B]">
                                    Lamaran
                                  </span>
                                </div>
                              </div>

                              <div className="sm:col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  disabled={range.targets.length <= 1}
                                  aria-label={`Hapus target ${target.jobLevel}`}
                                  onClick={() =>
                                    removeTargetFromRange(phaseKey, rangeIdx, targetIdx)
                                  }
                                  className="h-10 w-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    delete
                                  </span>
                                </button>
                              </div>
                            </div>
                            {targetErr && (
                              <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                                {targetErr}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-6 pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link to="/admin/jat/batches" className="hover:text-[#006878] font-medium">
              JAT Batch Management
            </Link>
            <span>/</span>
            <span className="text-[#1E293B] font-semibold">
              {isEditMode ? 'Edit Jadwal & Target Batch' : 'Buat Batch Baru'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            {isEditMode
              ? `Edit Batch JAT: ${existingBatch?.name}`
              : 'Konfigurasi Batch & Target Lamaran JAT'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(isEditMode && batchId ? `/admin/jat/batches/${batchId}` : '/admin/jat/batches')
            }
            className="h-10 px-5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Main Grid: Left Identity & Summary + Right Phase Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E2E8F0] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3">
              <span className="material-symbols-outlined text-[#006878]">tune</span>
              <h2 className="text-base font-bold text-[#1E293B]">Identitas Batch</h2>
            </div>

            {/* Batch Name Input (BR-01 & BR-02) */}
            <div className="space-y-1.5">
              <label
                htmlFor="jat-batch-name-input"
                className="block text-xs font-bold text-[#1E293B]"
              >
                Nama Program / Batch JAT <span className="text-rose-600">*</span>
              </label>
              <input
                id="jat-batch-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                placeholder="Cth: Fullstack Web Dev Batch 18"
                aria-invalid={Boolean(validationErrors.name)}
                className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
              />
              {validationErrors.name && (
                <p role="alert" className="text-xs font-semibold text-[#B91C1C]">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Affiliated Bootcamp Cohorts Selector (Stitch b9c1ad84) */}
            <div className="space-y-2 relative">
              <label className="block text-xs font-bold text-[#1E293B]">
                Pilih Batch Bootcamp Terafiliasi <span className="text-rose-600">*</span>
              </label>

              <div className="min-h-11 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex flex-wrap items-center gap-1.5">
                {selectedCohorts.map((cohort) => (
                  <span
                    key={cohort.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E6F7F9] text-[#006878] border border-[#0BB1CB]/30"
                  >
                    <span>{cohort.name}</span>
                    <button
                      type="button"
                      aria-label={`Hapus ${cohort.name}`}
                      onClick={() => handleToggleCohort(cohort.id)}
                      className="hover:text-[#003E49] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={() => setIsCohortPopoverOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-[#006878] hover:bg-[#E6F7F9]/60 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Pilih Batch Bootcamp</span>
                </button>
              </div>

              {validationErrors.affiliatedCohorts && (
                <p role="alert" className="text-xs font-semibold text-[#B91C1C]">
                  {validationErrors.affiliatedCohorts}
                </p>
              )}

              {isCohortPopoverOpen && (
                <BootcampCohortPopover
                  cohorts={availableCohorts}
                  selectedIds={selectedCohortIds}
                  onChange={setSelectedCohortIds}
                  onClose={() => setIsCohortPopoverOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Ringkasan Beban Lamaran Card (Stitch 4e57b402) */}
          <div className="bg-[#E6F7F9]/60 rounded-xl p-5 border border-[#0BB1CB]/30 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0BB1CB] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">analytics</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#003E49]">Ringkasan Beban Lamaran</h3>
                <p className="text-xs text-[#006878] mt-0.5 leading-relaxed">
                  Total akumulasi target lamaran per siswa pada batch ini.
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-lg p-3.5 border border-[#0BB1CB]/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#475569]">Target Phase 1 (Wajib):</span>
                <span className="font-bold text-[#1E293B] tabular-nums">
                  {p1TotalTarget} Lamaran
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Target Phase 2 (Opsional):</span>
                <span className="font-bold text-[#1E293B] tabular-nums">
                  {phase2.enabled ? `${p2TotalTarget} Lamaran` : 'Nonaktif (0)'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E2E8F0] text-sm">
                <span className="font-bold text-[#003E49]">Total Target Komitmen:</span>
                <span className="font-extrabold text-[#006878] tabular-nums">
                  {grandTotalTarget} Lamaran
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Phase 1 & Phase 2 Configurations */}
        <div className="lg:col-span-8 space-y-6">
          {renderPhaseSection('phase1', phase1)}
          {renderPhaseSection('phase2', phase2)}
        </div>
      </div>

      {/* Confirmation Dialog before Persisting Schedule (Stitch cf1165af) */}
      <SaveBatchConfirmationModal
        isOpen={isConfirmModalOpen}
        isEditMode={isEditMode}
        input={currentFormInput}
        selectedCohorts={selectedCohorts}
        consequentialImpact={consequentialImpact}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirmSave={handleConfirmSave}
      />
    </form>
  );
};
