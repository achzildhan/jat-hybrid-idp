import React from 'react';
import { Link } from 'react-router-dom';
import { useStudentPrototype } from '../../context/StudentPrototypeContext';
import { formatDateId } from '../../utils/formatDate';
import type { PrototypeActorRole } from '../../types/jat';

interface StudentShellProps {
  children: React.ReactNode;
}

const REFERENCE_DATE_PRESETS = [
  { label: 'Sebelum Periode (15 Feb)', value: '2025-02-15' },
  { label: 'Batas Start (1 Mar)', value: '2025-03-01' },
  { label: 'Aktif Range 1 (10 Mar)', value: '2025-03-10' },
  { label: 'Batas End (15 Mar)', value: '2025-03-15' },
  { label: 'Aktif Range 2 (20 Mar)', value: '2025-03-20' },
  { label: 'Setelah Periode (15 Jul)', value: '2025-07-15' },
];

/**
 * Reconstructed from Approved Stitch Student LMS Shell (`a77fcde9` & `91859673`).
 * Includes an explicit synthetic Student selector and Reference Date simulator bar
 * per EP-JAT-03 constraints (no fabricated login/backend).
 */
export const StudentShell: React.FC<StudentShellProps> = ({ children }) => {
  const {
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    referenceDate,
    setReferenceDate,
    directoryStudents,
    actorRole,
    setActorRole,
  } = useStudentPrototype();

  const initials = (selectedStudent?.name ?? 'ST')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F8FAFB] text-[#1E293B]">
      {/* Left Navigation Sidebar — Student LMS Shell */}
      <aside className="w-64 shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between">
        <div>
          <div className="h-16 px-6 flex items-center gap-2.5 border-b border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-[#0BB1CB] flex items-center justify-center text-white font-extrabold text-sm">
              d.
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#1E293B] block leading-none">
                dibimbing.id
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Student Learning Portal
              </span>
            </div>
          </div>

          <nav className="p-3 space-y-1" aria-label="Menu Utama Student LMS">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Pembelajaran
            </div>
            {['Dashboard', 'Materi', 'Test', 'Project', 'Tata Tertib', 'Modul'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#64748B] select-none"
              >
                <span className="material-symbols-outlined text-[18px] text-[#94A3B8]">
                  folder_open
                </span>
                <span>{item}</span>
              </div>
            ))}

            <div className="pt-3 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Karier &amp; Penyaluran
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-[#006878] bg-[#E6F7F9]/60">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#0BB1CB]">
                    work_history
                  </span>
                  <span>Talent Support</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">expand_less</span>
              </div>
              <div className="pl-7 space-y-1">
                <Link
                  to="/student/talent-support/jat"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-[#0BB1CB] text-white shadow-xs"
                >
                  <span>Job Application Tracking</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Prototype Mode Switcher to Admin Portal */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFB]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
            Prototype Mode Switcher
          </p>
          <Link
            to="/admin/jat/batches"
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#1E293B] text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0BB1CB]">
              admin_panel_settings
            </span>
            <span>Buka Admin Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span>Talent Support</span>
            <span>/</span>
            <span className="font-bold text-[#1E293B]">Job Application Tracking (JAT)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-[#1E293B] leading-tight">
                {selectedStudent?.name ?? 'Student'}
              </p>
              <p className="text-[11px] text-[#64748B] leading-tight">
                {selectedStudent?.bootcampCohortName ?? '-'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#E6F7F9] border border-[#0BB1CB]/30 text-[#006878] font-extrabold text-xs flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* Explicit Prototype Controls Bar: Synthetic Student Selector + Reference Date Simulator */}
        <section
          aria-label="Kontrol Simulasi Prototype Student"
          className="bg-[#E6F7F9]/60 border-b border-[#0BB1CB]/25 px-6 py-3"
        >
          <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#006878] text-white text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">science</span>
                Simulasi Prototype Student (EP-JAT-03)
              </span>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="prototype-role-selector"
                  className="text-xs font-bold text-[#0F172A]"
                >
                  Peran Aktif:
                </label>
                <select
                  id="prototype-role-selector"
                  aria-label="Pilih Peran Simulasi Prototype"
                  value={actorRole}
                  onChange={(e) => setActorRole(e.target.value as PrototypeActorRole)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
                >
                  <option value="Student">Student</option>
                  <option value="Admin (Talent Support)">Admin (Talent Support)</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="prototype-student-selector"
                  className="text-xs font-bold text-[#0F172A]"
                >
                  Pilih Student:
                </label>
                <select
                  id="prototype-student-selector"
                  aria-label="Pilih Student Simulasi"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
                >
                  {directoryStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.bootcampCohortName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="prototype-reference-date"
                  className="text-xs font-bold text-[#0F172A]"
                >
                  Tanggal Referensi:
                </label>
                <input
                  id="prototype-reference-date"
                  type="date"
                  aria-label="Simulasi Tanggal Hari Ini"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
                />
                <span className="text-[11px] font-semibold text-[#006878]">
                  ({formatDateId(referenceDate)})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {REFERENCE_DATE_PRESETS.map((preset) => {
                const isActive = referenceDate === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setReferenceDate(preset.value)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      isActive
                        ? 'bg-[#0BB1CB] text-white'
                        : 'bg-white text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main View Container */}
        <main className="flex-1 p-6">
          <div className="max-w-[1360px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
