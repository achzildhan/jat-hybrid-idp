import React, { useMemo, useState } from 'react';
import type {
  BootcampCohortOption,
  ReadinessBadge,
  StudentIdentity,
} from '../../types/jat';

interface AddStudentToBatchModalProps {
  isOpen: boolean;
  batchName: string;
  availableStudents: StudentIdentity[];
  enrolledStudentIds: string[];
  cohorts: BootcampCohortOption[];
  onClose: () => void;
  onConfirmAdd: (selectedStudentIds: string[]) => void;
}

/**
 * Reconstructed from Approved Stitch Screens:
 * - `a8dababfbebc443fb506c3f6c32e4033` ("Admin - JAT Batch Detail (Modal Tambah Student ke Batch)")
 * - `7cbdaf40e2574963aeef74136ac05f21` ("Admin - JAT Batch Detail (Modal Tambah Student - Empty Search State)")
 *
 * Implements EP-JAT-02 (BLG-JAT-005, BLG-JAT-006, BLG-JAT-007):
 * - Searches candidate students by name or email.
 * - Filters by bootcamp cohort and readiness status.
 * - Prevents duplicate membership for students already enrolled in the batch.
 */
export const AddStudentToBatchModal: React.FC<AddStudentToBatchModalProps> = ({
  isOpen,
  batchName,
  availableStudents,
  enrolledStudentIds,
  cohorts,
  onClose,
  onConfirmAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
  const [selectedReadiness, setSelectedReadiness] = useState<ReadinessBadge | 'all'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return availableStudents.filter((stu) => {
      if (selectedCohortId !== 'all' && stu.bootcampCohortId !== selectedCohortId) {
        return false;
      }
      if (selectedReadiness !== 'all' && stu.readinessBadge !== selectedReadiness) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesNameOrEmail =
          stu.name.toLowerCase().includes(q) ||
          stu.email.toLowerCase().includes(q) ||
          stu.bootcampCohortName.toLowerCase().includes(q);
        if (!matchesNameOrEmail) return false;
      }
      return true;
    });
  }, [availableStudents, selectedCohortId, selectedReadiness, searchQuery]);

  const selectableFilteredIds = useMemo(
    () =>
      filteredStudents
        .filter((s) => !enrolledStudentIds.includes(s.id))
        .map((s) => s.id),
    [filteredStudents, enrolledStudentIds]
  );

  if (!isOpen) return null;

  const isAllSelectableChecked =
    selectableFilteredIds.length > 0 &&
    selectableFilteredIds.every((id) => selectedStudentIds.includes(id));

  const handleToggleStudent = (studentId: string) => {
    if (enrolledStudentIds.includes(studentId)) {
      setErrorMessage(
        'Mahasiswa ini sudah terdaftar di dalam batch ini. Duplikasi peserta tidak diizinkan.'
      );
      return;
    }
    setErrorMessage(null);
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleToggleSelectAll = () => {
    setErrorMessage(null);
    if (isAllSelectableChecked) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !selectableFilteredIds.includes(id))
      );
    } else {
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...selectableFilteredIds]))
      );
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCohortId('all');
    setSelectedReadiness('all');
    setErrorMessage(null);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCohortId('all');
    setSelectedReadiness('all');
    setSelectedStudentIds([]);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      setErrorMessage('Pilih minimal 1 mahasiswa untuk ditambahkan ke batch.');
      return;
    }
    try {
      onConfirmAdd(selectedStudentIds);
      setSelectedStudentIds([]);
      setSearchQuery('');
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menambahkan mahasiswa.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between bg-white border-b border-[#F1F5F9] shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E6F7F9] flex items-center justify-center shrink-0 text-[#006878]">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="add-student-modal-title"
                  className="text-lg font-bold text-[#1E293B] tracking-tight"
                >
                  Tambah Student ke Batch JAT
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-[#E6F7F9] text-[#006878] text-xs font-bold">
                  {batchName}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pilih mahasiswa aktif dari direktori bootcamp untuk didaftarkan ke target evaluasi
                karir {batchName}.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Tutup modal tambah student"
            onClick={handleClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="rounded-xl p-3.5 bg-[#E6F7F9]/60 border border-[#0BB1CB]/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#006878] text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-[#003E49] leading-relaxed">
              Siswa yang ditambahkan akan otomatis disinkronkan dengan target Phase 1 &amp; Phase 2
              pada <strong>{batchName}</strong>. Mahasiswa yang sudah terdaftar pada batch ini
              ditandai agar tidak terjadi duplikasi peserta.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 flex flex-col sm:flex-row gap-2.5 shrink-0 bg-white">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
              search
            </span>
            <input
              type="text"
              aria-label="Cari nama mahasiswa atau email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama mahasiswa atau email..."
              className="w-full h-10 pl-10 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Hapus pencarian mahasiswa"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <select
            aria-label="Filter Cohort Bootcamp"
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
          >
            <option value="all">Semua Cohort</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.studentCount} Siswa)
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Kesiapan Karir"
            value={selectedReadiness}
            onChange={(e) => setSelectedReadiness(e.target.value as ReadinessBadge | 'all')}
            className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#1E293B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0BB1CB]"
          >
            <option value="all">Status: Semua</option>
            <option value="Portofolio Siap">Portofolio Siap</option>
            <option value="Review CV Selesai">Review CV Selesai</option>
            <option value="On Boarding">On Boarding</option>
          </select>
        </div>

        {errorMessage && (
          <div className="px-6 pb-2 shrink-0">
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/30 text-xs font-semibold text-[#B91C1C]"
            >
              {errorMessage}
            </div>
          </div>
        )}

        {/* Student List Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filteredStudents.length === 0 ? (
            /* Stitch 7cbdaf40: Empty Search State */
            <div className="py-10 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E6F7F9] flex items-center justify-center mb-3 text-[#006878]">
                <span className="material-symbols-outlined text-[28px]">person_search</span>
              </div>
              <h3 className="text-base font-bold text-[#1E293B] mb-1">
                Mahasiswa Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#64748B] max-w-md leading-relaxed mb-4">
                Tidak ada mahasiswa dengan kata kunci{' '}
                {searchQuery ? (
                  <span className="font-mono font-semibold text-[#1E293B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                ) : (
                  'tersebut'
                )}{' '}
                pada filter yang dipilih. Periksa kembali ejaan atau reset filter pencarian.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-9 px-4 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset Pencarian</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All Bar */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelectableChecked}
                    disabled={selectableFilteredIds.length === 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-[#0BB1CB] focus:ring-[#0BB1CB] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#1E293B]">
                    Pilih Semua Siswa Tersedia
                  </span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F9] text-[#006878] font-bold">
                    {selectedStudentIds.length} Terpilih
                  </span>
                  <span className="text-[#64748B]">
                    dari {filteredStudents.length} ditampilkan
                  </span>
                </div>
              </div>

              {/* Candidate Rows */}
              <div className="divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {filteredStudents.map((stu) => {
                  const isAlreadyEnrolled = enrolledStudentIds.includes(stu.id);
                  const isSelected = selectedStudentIds.includes(stu.id);
                  const initials = stu.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={stu.id}
                      onClick={() => handleToggleStudent(stu.id)}
                      className={`flex items-center justify-between p-3.5 transition-colors ${
                        isAlreadyEnrolled
                          ? 'bg-[#F8FAFC] opacity-75 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#E6F7F9]/40 cursor-pointer'
                            : 'bg-white hover:bg-[#F8FAFC] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${stu.name}`}
                          checked={isSelected}
                          disabled={isAlreadyEnrolled}
                          onChange={() => handleToggleStudent(stu.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-[#0BB1CB] focus:ring-[#0BB1CB] disabled:opacity-40 cursor-pointer"
                        />
                        <div className="w-9 h-9 rounded-full bg-[#006878] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[#1E293B] truncate">
                              {stu.name}
                            </span>
                            {isAlreadyEnrolled && (
                              <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[10px] font-bold text-[#475569]">
                                Sudah Terdaftar di Batch Ini
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] truncate">{stu.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold">
                          {stu.bootcampCohortName}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            stu.readinessBadge === 'Portofolio Siap'
                              ? 'bg-[#ECFDF5] text-[#047857]'
                              : stu.readinessBadge === 'Review CV Selesai'
                                ? 'bg-[#E6F7F9] text-[#006878]'
                                : 'bg-[#FFFBEB] text-[#B45309]'
                          }`}
                        >
                          {stu.readinessBadge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
            <span className="material-symbols-outlined text-[18px] text-[#006878]">
              group_add
            </span>
            <span>{selectedStudentIds.length} Mahasiswa Terpilih</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={selectedStudentIds.length === 0}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-all ${
                selectedStudentIds.length > 0
                  ? 'bg-[#0BB1CB] hover:bg-[#006878] shadow-xs cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ Tambahkan ke Batch ({selectedStudentIds.length})</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
