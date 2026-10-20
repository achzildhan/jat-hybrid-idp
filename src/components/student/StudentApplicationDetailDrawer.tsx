import React from 'react';
import type { RecruitmentStage, StudentApplicationRecord } from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';
import { StatusBadge } from '../common/StatusBadge';

interface StudentApplicationDetailDrawerProps {
  isOpen: boolean;
  application: StudentApplicationRecord | null;
  onClose: () => void;
  onRequestDelete?: (application: StudentApplicationRecord) => void;
}

const RECRUITMENT_STAGE_BADGE: Record<
  RecruitmentStage,
  { label: string; className: string }
> = {
  Applied: {
    label: 'Applied (Terkirim ke Perusahaan)',
    className: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
  },
  'HR Screening': {
    label: 'HR Screening',
    className: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  },
  'User Interview': {
    label: 'User Interview',
    className: 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]',
  },
  Offering: {
    label: 'Offering',
    className: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  },
  'Rejected by Employer': {
    label: 'Rejected by Employer (Ditolak Perusahaan)',
    className: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
  },
};

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Ukuran berkas simulasi';
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Reconstructed from Approved Stitch Screen:
 * - `2d36097898c1414292eb4cf45aad180c` ("Student - JAT Application Detail & Status Variants")
 *
 * Implements EP-JAT-07 (BLG-JAT-023..026, JAT-BL-10, BR-22..BR-28, BR-33, BR-37):
 * - Displays standardized JAT Validation Status (`Approved`, `Waiting Confirmation`, `Rejected` — BR-22, DSN-TBD-01).
 * - Explains current validation status using the actual reason/feedback and human-review metadata (`BR-23`, `BR-24`, `BR-25`).
 * - Shows an explicit unprocessed/pending state when `Waiting Confirmation` without inventing an AI result (`BR-15`, `BR-27`).
 * - Clearly labels validation outcomes as simulated/mock (`BR-37`).
 * - Explicitly separates JAT Validation Status from external employer Recruitment Progress (`BR-28`).
 */
export const StudentApplicationDetailDrawer: React.FC<
  StudentApplicationDetailDrawerProps
> = ({ isOpen, application, onClose, onRequestDelete }) => {
  if (!isOpen || !application) return null;

  const isApproved = application.validationStatus === 'Approved';
  const isWaiting = application.validationStatus === 'Waiting Confirmation';
  const isRejected = application.validationStatus === 'Rejected';

  const recruitmentStage: RecruitmentStage = application.recruitmentStage ?? 'Applied';
  const recruitmentBadge = RECRUITMENT_STAGE_BADGE[recruitmentStage];
  const validationSourceLabel =
    application.validationSource ??
    (isWaiting ? 'Pending Verification' : 'Simulated Human Review (Talent Support)');

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-application-detail-title"
    >
      <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between overflow-hidden">
        {/* Sticky Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-start justify-between gap-4 bg-white">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E6F7F9] text-[#006878]">
                Phase {application.phaseNumber} &bull; {application.dateRangeLabel}
              </span>
              <span className="text-[11px] font-semibold text-[#64748B]">
                ID: {application.id}
              </span>
            </div>
            <h2
              id="student-application-detail-title"
              className="text-lg font-extrabold text-[#0F172A]"
            >
              {application.company} &ndash; {application.role}
            </h2>
            <p className="text-xs text-[#64748B]">
              Detail pengajuan bukti lamaran kerja &amp; umpan balik verifikasi JAT
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel detail pengajuan"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Simulated / Mock Outcome Disclosure Banner (BR-27 & BR-37) */}
          <div
            role="note"
            aria-label="Informasi Status Verifikasi"
            className="rounded-xl bg-[#F8FAFB] border border-[#CBD5E1] px-4 py-3 flex items-start gap-2.5 text-xs text-[#334155]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006878] shrink-0 mt-0.5">
              science
            </span>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-[#0F172A]">
                  Status Verifikasi Lamaran
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F7F9] text-[#006878] border border-[#0BB1CB]/30">
                  Sumber: {validationSourceLabel}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Status dan hasil peninjauan diperbarui secara berkala oleh tim Talent Support berdasarkan bukti lamaran yang dikirimkan.

              </p>
            </div>
          </div>

          {/* JAT Validation Status Callout Banner (3 Status Variants from Stitch 2d360978) */}
          {isApproved && (
            <section
              aria-label="Status Validasi Bukti: Approved"
              className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#047857]">
                    check_circle
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#065F46]">
                    Status Validasi Bukti JAT
                  </span>
                </div>
                <StatusBadge status={application.validationStatus} />
              </div>

              <p className="text-xs font-semibold text-[#065F46] leading-relaxed">
                {application.reviewFeedback?.trim()
                  ? application.reviewFeedback
                  : 'Bukti tangkapan layar lamaran telah diverifikasi dan disetujui (Approved) untuk perhitungan kuota JAT.'}
              </p>

              <div className="pt-2 border-t border-[#A7F3D0]/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#047857]">
                <span>
                  Diverifikasi oleh:{' '}
                  <strong>
                    {application.reviewedBy || 'Admin Dibimbing (Talent Support)'}
                  </strong>
                </span>
                {application.reviewedAt && (
                  <span>
                    Waktu Review:{' '}
                    <strong>{formatDateId(application.reviewedAt.slice(0, 10))}</strong>
                  </span>
                )}
              </div>
            </section>
          )}

          {isWaiting && (
            <section
              aria-label="Status Validasi Bukti: Waiting Confirmation"
              className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-4 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#B45309]">
                    schedule
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#92400E]">
                    Status Validasi Bukti JAT
                  </span>
                </div>
                <StatusBadge status={application.validationStatus} />
              </div>

              <p className="text-xs font-semibold text-[#92400E] leading-relaxed">
                {application.reviewFeedback?.trim()
                  ? application.reviewFeedback
                  : 'Belum ada hasil validasi akhir. Bukti pengajuan Anda telah diterima dan sedang dalam antrean pemeriksaan Talent Support.'}
              </p>

              <div className="pt-2 border-t border-[#FDE68A] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#B45309]">
                <span>
                  Status Pemrosesan: <strong>Menunggu Review Talent Support</strong>
                </span>
                <span>
                  Tanggal Unggah: <strong>{formatDateId(application.dateApplied)}</strong>
                </span>
              </div>
            </section>
          )}

          {isRejected && (
            <section
              aria-label="Status Validasi Bukti: Rejected"
              className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#B91C1C]">
                    error
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#991B1B]">
                    Status Validasi Bukti JAT
                  </span>
                </div>
                <StatusBadge status={application.validationStatus} />
              </div>

              {/* Mandatory Rejection Reason Box (BR-23 & BR-24) */}
              <div className="rounded-lg bg-white/90 border border-[#FECACA] p-3 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B91C1C] block">
                  Alasan Penolakan
                </span>
                <p className="text-xs font-bold text-[#7F1D1D] leading-relaxed">
                  {application.rejectionReason?.trim()
                    ? application.rejectionReason
                    : 'Alasan penolakan belum tercatat pada data simulasi.'}
                </p>
              </div>

              {application.reviewFeedback?.trim() && (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] block">
                    Saran Tindak Lanjut (Feedback Talent Support)
                  </span>
                  <p className="text-xs text-[#7F1D1D] leading-relaxed">
                    {application.reviewFeedback}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-[#FECACA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#991B1B]">
                <span>
                  Direview oleh:{' '}
                  <strong>
                    {application.reviewedBy || 'Sistem Validasi Aturan / Talent Support'}
                  </strong>
                </span>
                {application.reviewedAt && (
                  <span>
                    Waktu Review:{' '}
                    <strong>{formatDateId(application.reviewedAt.slice(0, 10))}</strong>
                  </span>
                )}
              </div>
            </section>
          )}

          {/* External Employer Recruitment Stage Card (BR-28 Separation) */}
          <section
            aria-label="Status Tahapan Rekrutmen Perusahaan"
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFB] p-4 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold text-[#1E293B]">
                  Tahapan Rekrutmen Perusahaan
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Terpisah dari Status Validasi Bukti JAT di atas.
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${recruitmentBadge.className}`}
              >
                {recruitmentBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Status validasi JAT (<code>{application.validationStatus}</code>) hanya menilai
              kelengkapan bukti pengiriman lamaran Anda untuk kuota bootcamp, dan{' '}
              <strong>tidak menggantikan</strong> status proses seleksi dari pihak perusahaan (
              <code>{recruitmentStage}</code>).
            </p>
          </section>

          {/* Submitted Job Information (2-Column Metadata Grid per Stitch 2d360978) */}
          <section
            aria-label="Informasi Lamaran yang Diajukan"
            className="space-y-3"
          >
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] border-b border-[#E2E8F0] pb-2">
              Submitted Job Information
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFB] rounded-xl border border-[#E2E8F0] p-4 text-xs">
              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">Date Applied</dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">
                  {formatDateId(application.dateApplied)} ({application.dateApplied})
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">Role Applied</dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">{application.role}</dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">Company Name</dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">{application.company}</dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">
                  Company Location
                </dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">
                  {application.location}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">Position</dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">
                  {application.position}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">
                  Years of Experience
                </dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">
                  {application.yearsOfExperience}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">Job Level</dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">
                  {application.jobLevel}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-semibold text-[#64748B]">Work System</dt>
                <dd className="font-extrabold text-[#0F172A] mt-0.5">
                  {application.workSystem}
                </dd>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-[#E2E8F0]">
                <dt className="text-[11px] font-semibold text-[#64748B]">
                  Link Job Vacancy
                </dt>
                <dd className="mt-0.5">
                  <a
                    href={application.vacancyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#006878] hover:underline break-all"
                  >
                    <span>{application.vacancyUrl}</span>
                    <span className="material-symbols-outlined text-[14px]">
                      open_in_new
                    </span>
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          {/* Proof of Application Evidence Preview Card */}
          <section aria-label="Bukti Tangkapan Layar Lamaran" className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] border-b border-[#E2E8F0] pb-2">
              Proof of Application Evidence
            </h3>

            <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFB] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#E6F7F9] text-[#006878] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0F172A] truncate">
                      {application.evidenceFileName}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {formatFileSize(application.evidenceFileSize)} &bull;{' '}
                      {application.evidenceMimeType || 'image/png'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white border border-[#CBD5E1] text-[#334155]">
                  Milik Mahasiswa #{application.studentId}
                </span>
              </div>

              {/* Synthetic Evidence Preview Box */}
              <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-white p-4 text-center space-y-1">
                <span className="material-symbols-outlined text-[28px] text-[#0BB1CB]">
                  screenshot_monitor
                </span>
                <p className="text-xs font-bold text-[#334155]">
                  Pratinjau Bukti Tangkapan Layar ({application.evidenceFileName})
                </p>
                <p className="text-[11px] text-[#64748B]">
                   Bukti pengajuan untuk {application.company} &ndash; {application.role} pada{' '}
                  {formatDateId(application.dateApplied)}.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Drawer Footer */}
        <div className="px-6 py-4 bg-[#F8FAFB] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div>
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#64748B]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Pengajuan Approved telah dikunci
              </span>
            ) : (
              onRequestDelete && (
                <button
                  type="button"
                  onClick={() => onRequestDelete(application)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-xs font-bold text-[#B91C1C] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Hapus Bukti Pengajuan</span>
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
};
