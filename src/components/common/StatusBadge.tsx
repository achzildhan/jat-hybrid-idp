import React from 'react';
import type { ValidationStatus } from '../../types/jat';

interface StatusBadgeProps {
  status: ValidationStatus | 'On Track' | 'Needs Reminder' | 'Completed' | 'Active' | 'Upcoming' | 'Tercapai' | 'Tidak Tercapai' | 'Belum Dimulai';
  size?: 'sm' | 'md';
}

/**
 * Dual-channel status indicator pill (Color + Icon + Text)
 * Enforces DSN-TBD-01: Validation statuses are standardized to
 * 'Approved', 'Rejected', and 'Waiting Confirmation'.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const paddingClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  switch (status) {
    case 'Approved':
    case 'On Track':
    case 'Completed':
    case 'Active':
    case 'Tercapai':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-[#ECFDF5] text-[#047857] border border-[#10B981]/40 ${paddingClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          {status}
        </span>
      );

    case 'Waiting Confirmation':
    case 'Needs Reminder':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/40 ${paddingClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          {status}
        </span>
      );

    case 'Rejected':
    case 'Tidak Tercapai':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#EF4444]/40 ${paddingClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          {status}
        </span>
      );

    case 'Upcoming':
    case 'Belum Dimulai':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] ${paddingClass}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
          {status}
        </span>
      );
  }
};
