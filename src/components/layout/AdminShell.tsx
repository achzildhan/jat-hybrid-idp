import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useStudentPrototype } from '../../context/StudentPrototypeContext';
import { batchRepository } from '../../services/batchRepository';
import type { PrototypeActorRole } from '../../types/jat';

interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * Admin / Talent Support Shell layout reconstructed from Stitch screens:
 * - Persistent 256px (w-64) left sidebar with 'Talent & Career > Job Application Tracking' active
 * - Top header bar with search, notifications, and Admin role switcher/indicator
 * - Portal switcher link in sidebar footer to inspect Student portal routes
 * - EP-JAT-11 (BLG-JAT-039, BLG-JAT-040, BR-33, BR-43): Displays role unauthorized alert
 *   banner when simulated role is 'Student'.
 */
export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const location = useLocation();
  const { actorRole, setActorRole } = useStudentPrototype();
  const isRequestsActive = location.pathname.startsWith('/admin/jat/requests');

  const [waitingQueueCount, setWaitingQueueCount] = useState<number>(() => {
    try {
      return batchRepository.listWaitingConfirmationRequests().length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const syncQueueCount = () => {
      try {
        setWaitingQueueCount(batchRepository.listWaitingConfirmationRequests().length);
      } catch {
        setWaitingQueueCount(0);
      }
    };
    syncQueueCount();
    if (typeof window !== 'undefined') {
      window.addEventListener('jat-repository-updated', syncQueueCount);
      return () => {
        window.removeEventListener('jat-repository-updated', syncQueueCount);
      };
    }
    return undefined;
  }, [location.pathname, actorRole]);

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] text-[#1E293B]">
      {/* Left Sidebar Navigation */}
      <aside
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E2E8F0] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between"
        aria-label="Admin Sidebar Navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Logo */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-lg bg-[#0BB1CB] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#1E293B] leading-tight">dibimbing</span>
              <span className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
                TALENT ADMIN
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="overflow-y-auto flex-1 px-3 py-3">
            <nav className="flex flex-col gap-1" aria-label="Main Menu">
              <div className="px-3 pt-2 pb-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Main Menu
                </span>
              </div>
              <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] select-none">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                Dashboard
              </span>
              <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] select-none">
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                Admission
              </span>
              <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] select-none">
                <span className="material-symbols-outlined text-[20px]">laptop_chromebook</span>
                Bootcamp
              </span>

              <div className="px-3 pt-4 pb-1">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Talent &amp; Career
                </span>
              </div>
              <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] select-none">
                <span className="material-symbols-outlined text-[20px]">group</span>
                All Bootcamp Student
              </span>
              <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] select-none">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                Talent Support
              </span>
              <NavLink
                to="/admin/jat/batches"
                className={() =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname.startsWith('/admin/jat')
                      ? 'bg-[#0BB1CB] text-white shadow-xs'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
                Job Application Tracking
              </NavLink>
              <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] select-none">
                <span className="material-symbols-outlined text-[20px]">work</span>
                Job Portal
              </span>
            </nav>
          </div>
        </div>

        {/* Bottom Admin Profile & Prototype Persona Switcher */}
        <div className="p-3 border-t border-[#F1F5F9] space-y-2">
          <div className="p-3 bg-[#F1F5F9] rounded-xl flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 ${
              actorRole === 'Student' ? 'bg-[#DC2626]' : 'bg-[#006878]'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {actorRole === 'Student' ? 'lock' : 'person'}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-[#1E293B] truncate">
                {actorRole === 'Student' ? 'Simulasi Student' : 'Admin Dibimbing'}
              </span>
              <span className="text-[11px] text-[#64748B] truncate">
                {actorRole}
              </span>
            </div>
          </div>
          <Link
            to="/student/talent-support/jat"
            className="w-full py-1.5 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[11px] font-semibold text-[#006878] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
            Switch to Student Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Utility Header */}
        <header className="sticky top-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-[#E6F7F9] text-[#006878] border border-[#0BB1CB]/30 text-[11px] font-bold">
              Mode Simulasi • Data Uji
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Top Sub-Navigation Switcher between Daftar Batch JAT & Request */}
            <div
              className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]"
              role="navigation"
              aria-label="JAT Admin Sub-navigation"
            >
              <Link
                to="/admin/jat/batches"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !isRequestsActive
                    ? 'bg-white text-[#006878] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
                Daftar Batch JAT
              </Link>
              <Link
                to="/admin/jat/requests"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isRequestsActive
                    ? 'bg-white text-[#006878] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">rule</span>
                Request
                <span
                  data-testid="admin-request-nav-badge"
                  className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/40"
                >
                  {waitingQueueCount}
                </span>
              </Link>
            </div>

            <div className="h-6 w-px bg-[#E2E8F0]" />

            {/* Prototype Actor Role Selector (EP-JAT-11) */}
            <div className="flex items-center gap-2 bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs">
              <span className="text-[#64748B] font-semibold">Peran:</span>
              <select
                aria-label="Pilih Peran Pengguna"
                value={actorRole}
                onChange={(e) => setActorRole(e.target.value as PrototypeActorRole)}
                className="bg-transparent font-bold text-[#006878] focus:outline-none cursor-pointer"
              >
                <option value="Admin (Talent Support)">Admin (Talent Support)</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Student">Student (Unauthorized)</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:flex flex-col">
                <span className="text-xs font-bold text-[#1E293B]">
                  {actorRole === 'Student' ? 'Mahasiswa JAT' : 'Admin Dibimbing'}
                </span>
                <span className="text-[11px] text-[#006878] font-medium">
                  {actorRole}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                actorRole === 'Student' ? 'bg-[#DC2626]' : 'bg-[#006878]'
              }`}>
                {actorRole === 'Student' ? 'ST' : 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* Unauthorized Alert Banner when Role is Student (BR-33, BR-43, BLG-JAT-040) */}
          {actorRole === 'Student' && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#B91C1C]"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[24px] shrink-0 text-[#DC2626]">
                  lock
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#991B1B]">
                    Akses Ditolak: Halaman Khusus Admin &amp; Talent Support
                  </h4>
                  <p className="text-xs text-[#B91C1C] mt-0.5">
                    Peran aktif saat ini adalah <strong>Student</strong>. Halaman manajemen Admin/Talent Support dilindungi dan tindakan administratif tidak diizinkan. Silakan beralih ke Portal Student atau ganti peran ke Admin.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActorRole('Admin (Talent Support)')}
                  className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors cursor-pointer"
                >
                  Ganti ke Admin
                </button>
                <Link
                  to="/student/talent-support/jat"
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#FECACA] text-[#B91C1C] text-xs font-bold hover:bg-[#FFF5F5] transition-colors"
                >
                  Ke Portal Student
                </Link>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
