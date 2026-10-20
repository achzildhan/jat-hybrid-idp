import React, { useEffect, useState } from 'react';
import type { AdminRequestQueueItem } from '../../services/batchRepository';
import type {
  IdpAttributeCheckStatus,
  PrototypeActorRole,
  ReviewApplicationRequestInput,
} from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';
import { StatusBadge } from '../common/StatusBadge';

interface AdminHitlInspectorModalProps {
  isOpen: boolean;
  item: AdminRequestQueueItem | null;
  actorRole: PrototypeActorRole;
  onClose: () => void;
  onSubmitReview: (
    applicationId: string,
    input: ReviewApplicationRequestInput
  ) => void;
}

const ATTRIBUTE_STATUS_STYLE: Record<
  IdpAttributeCheckStatus,
  { badgeClass: string; icon: string }
> = {
  Matched: {
    badgeClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    icon: 'check_circle',
  },
  'Fuzzy Match (>70%)': {
    badgeClass: 'bg-[#E6F7F9] text-[#006878] border-[#0BB1CB]/40',
    icon: 'manage_search',
  },
  'Ambiguous / Unclear': {
    badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    icon: 'help',
  },
  Mismatch: {
    badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    icon: 'cancel',
  },
  Unverified: {
    badgeClass: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
    icon: 'visibility',
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
 * - `b490bfff7a0946d1af08c7c70b663597` ("Admin - JAT HITL Evidence Review & Inspector")
 *
 * Implements EP-JAT-08 (BLG-JAT-027..030, JAT-BL-11, BR-22..BR-26, BR-32..BR-34, BR-39, BR-40, DSN-TBD-03, DSN-TBD-06):
 * - Displays recorded form fields, evidence preview, batch, phase, and applicable date range.
 * - Displays individual comparison status for all 7 required attributes from BR-39 (`DSN-TBD-06`):
 *   `Date Applied`, `Role`, `Company`, `Location`, `Position`, `Job Level`, `Work System`.
 * - Enforces mandatory rejection reason when rejecting (`BR-24`, `DSN-TBD-03`).
 * - Requires explicit confirmation before committing consequential review decisions (`Approve` or `Reject`).
 * - Prevents overriding deterministic date-range or file-format rules (`BR-11`, `BR-14`, `BR-26`).
 * - Displays traceable human review history (`BR-25`) without fabricating personal reviewer names or timestamps.
 */
export const AdminHitlInspectorModal: React.FC<AdminHitlInspectorModalProps> = ({
  isOpen,
  item,
  actorRole,
  onClose,
  onSubmitReview,
}) => {
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setDecision(
        item.application.validationStatus === 'Rejected' ? 'Rejected' : 'Approved'
      );
      setRejectionReason(item.application.rejectionReason ?? '');
      setReviewFeedback(item.application.reviewFeedback ?? '');
      setValidationError(null);
      setIsConfirmDialogOpen(false);
      setIsSubmitting(false);
    }
  }, [item?.application.id, item?.application.validationStatus]);

  if (!isOpen || !item) return null;

  const { application } = item;
  const isAuthorizedAdmin =
    actorRole === 'Admin (Talent Support)' || actorRole === 'Super Admin';
  const isDeterministicApprovalBlocked =
    !item.isWithinConfiguredDateRange || !item.isSupportedEvidenceFormat;

  const handlePrimaryActionClick = () => {
    setValidationError(null);

    if (!isAuthorizedAdmin) {
      setValidationError(
        'Akses ditolak: Hanya peran Admin (Talent Support) atau Super Admin yang berwenang meninjau Request JAT.'
      );
      return;
    }

    if (decision === 'Approved' && isDeterministicApprovalBlocked) {
      setValidationError(
        !item.isSupportedEvidenceFormat
          ? 'Keputusan disetujui ditolak: Format berkas bukti harus berupa file JPG, JPEG, atau PNG.'
          : 'Keputusan disetujui ditolak: Tanggal melamar (Date Applied) berada di luar rentang tanggal batch yang berlaku.'
      );
      return;
    }

    if (decision === 'Rejected' && !rejectionReason.trim()) {
      setValidationError(
        'Alasan penolakan wajib diisi saat menolak Request JAT.'
      );
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = () => {
    if (isSubmitting) return; // In-flight guard against duplicate clicks (BLG-JAT-040)
    setValidationError(null);
    setIsSubmitting(true);
    try {
      onSubmitReview(application.id, {
        decision,
        confirmed: true,
        rejectionReason: decision === 'Rejected' ? rejectionReason.trim() : undefined,
        reviewFeedback: reviewFeedback.trim() || undefined,
        actorRole,
      });
      setIsConfirmDialogOpen(false);
    } catch (err) {
      setIsConfirmDialogOpen(false);
      setValidationError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan keputusan review JAT.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hitl-inspector-title"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Sticky Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F7F9] text-[#006878] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">fact_check</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="hitl-inspector-title"
                  className="text-base font-extrabold text-[#0F172A]"
                >
                  Detail Konfirmasi JAT
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E6F7F9] text-[#006878] border border-[#0BB1CB]/30">
                  HITL Mode
                </span>
                <StatusBadge status={application.validationStatus} />
              </div>
              <p className="text-xs text-[#64748B]">
                Pemeriksaan Bukti Lamaran (Human-in-the-Loop) &bull;{' '}
                <strong className="text-[#334155]">{item.studentName}</strong> ({application.company})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFB] border border-[#CBD5E1] text-[11px] font-bold text-[#334155]">
              Peran Simulasi: {actorRole}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup HITL Inspector"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#F8FAFC]">
          {/* Batch Context Bar (3 Columns) */}
          <div
            aria-label="Konteks Batch dan Periode"
            className="bg-white rounded-xl px-5 py-3 shadow-xs border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] block">Batch</span>
              <span className="font-extrabold text-[#0F172A]">{item.batchName}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] block">Phase</span>
              <span className="font-extrabold text-[#0F172A]">
                Phase {application.phaseNumber}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] block">
                Date Range
              </span>
              <span className="font-extrabold text-[#0F172A]">
                {application.dateRangeLabel}{' '}
                {item.dateRangeStartDate && item.dateRangeEndDate
                  ? `(${formatDateId(item.dateRangeStartDate)} – ${formatDateId(
                      item.dateRangeEndDate
                    )})`
                  : ''}
              </span>
            </div>
          </div>

          {/* 12-Column Split Layout: Left (7 Cols) Submitted Form Details | Right (5 Cols) Evidence Inspector & 7-Attribute Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (7 Cols): Data Form Pelaporan Mahasiswa */}
            <div className="lg:col-span-7 space-y-4">
              <section
                aria-label="Data Form Pelaporan Mahasiswa"
                className="bg-white rounded-xl p-5 shadow-xs border border-[#E2E8F0] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                    Data Form Pelaporan Mahasiswa
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006878] bg-[#E6F7F9] px-2.5 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    {item.bootcampCohortName}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-[11px] font-semibold text-[#64748B]">
                      Nama Student
                    </dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {item.studentName}
                    </dd>
                    <dd className="text-[11px] text-[#64748B]">{item.studentEmail}</dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold text-[#64748B]">
                      Date Applied
                    </dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {formatDateId(application.dateApplied)} ({application.dateApplied})
                    </dd>
                    <dd className="mt-1">
                      {item.isWithinConfiguredDateRange ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#047857]">
                          <span className="material-symbols-outlined text-[14px]">
                            check_circle
                          </span>
                          Sesuai rentang tanggal batch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B91C1C]">
                          <span className="material-symbols-outlined text-[14px]">
                            error
                          </span>
                          Di luar rentang tanggal batch
                        </span>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold text-[#64748B]">Company</dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {application.company}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold text-[#64748B]">Location</dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {application.location}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold text-[#64748B]">Role</dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {application.role}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-semibold text-[#64748B]">Job Level</dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {application.jobLevel}
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
                      Work System
                    </dt>
                    <dd className="font-extrabold text-[#0F172A] mt-0.5">
                      {application.workSystem}
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

                {/* Attachment Bukti Lamaran Tile */}
                <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#64748B] block">
                    Attachment Bukti Lamaran
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFB] border border-[#CBD5E1]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#E6F7F9] text-[#006878] flex items-center justify-center shrink-0">
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
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        item.isSupportedEvidenceFormat
                          ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                          : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                      }`}
                    >
                      {item.isSupportedEvidenceFormat
                        ? 'Format Berkas Sesuai'
                        : 'Format Tidak Didukung'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Traceable Human Review History Card (BR-25 & Requirement 10) */}
              <section
                aria-label="Riwayat Peninjauan Talent Support"
                className="bg-white rounded-xl p-5 shadow-xs border border-[#E2E8F0] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                    Riwayat Peninjauan Talent Support
                  </h3>
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    {application.reviewHistory?.length ?? 0} tindakan tercatat
                  </span>
                </div>

                {!application.reviewHistory || application.reviewHistory.length === 0 ? (
                  <p className="text-xs text-[#64748B]">
                    Belum ada riwayat keputusan review manusia yang tercatat pada pengajuan ini.
                  </p>
                ) : (
                  <ul className="space-y-2.5 text-xs">
                    {application.reviewHistory.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-lg bg-[#F8FAFB] border border-[#E2E8F0] p-3 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <StatusBadge status={entry.resultingStatus} />
                          <span className="text-[11px] font-semibold text-[#475569]">
                            Peran: <strong>{entry.actorRole}</strong>
                          </span>
                        </div>
                        {entry.rejectionReason && (
                          <p className="text-[11px] font-bold text-[#B91C1C]">
                            Alasan Penolakan: {entry.rejectionReason}
                          </p>
                        )}
                        {entry.reviewFeedback && (
                          <p className="text-[11px] text-[#334155]">
                            Catatan: {entry.reviewFeedback}
                          </p>
                        )}
                        <p className="text-[10px] text-[#64748B]">
                          Oleh: {entry.reviewedBy || entry.actorRole} &bull;{' '}
                          {entry.reviewedAt
                            ? `Waktu: ${entry.reviewedAt}`
                            : 'Waktu peninjauan belum tercatat'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Right Column (5 Cols): Evidence Inspector & All 7 Attributes Checklist (DSN-TBD-06 & BR-39) */}
            <div className="lg:col-span-5 space-y-4">
              <section
                aria-label="Pemeriksaan Berkas Bukti dan 7 Atribut Kelayakan"
                className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col"
              >
                <div className="px-4 py-3 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006878]">
                      visibility
                    </span>
                    Evidence Inspector
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#64748B] border border-[#E2E8F0]">
                    100% Zoom
                  </span>
                </div>

                {/* Synthetic Screenshot Preview Canvas */}
                <div className="p-4 bg-[#F8FAFB] border-b border-[#E2E8F0]">
                  <div className="rounded-lg bg-white border border-[#CBD5E1] p-3.5 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                      <span className="text-xs font-extrabold text-[#0F172A]">
                        Pratinjau Bukti: {application.evidenceFileName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#64748B]">
                        {application.dateApplied}
                      </span>
                    </div>
                    <div className="rounded bg-[#F8FAFC] p-2.5 text-[11px] text-[#334155] space-y-0.5 border border-[#E2E8F0]">
                      <p className="font-bold text-[#0F172A]">
                        {application.company} &mdash; {application.role}
                      </p>
                      <p>
                        Kandidat: {item.studentName} &bull; {application.location} (
                        {application.workSystem})
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        Level: {application.jobLevel} &bull; Tipe: {application.position}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7-Attribute IDP Comparison Checklist (Confirmed Decision DSN-TBD-06 & BR-39) */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#0F172A]">
                      Pemeriksaan 7 Atribut Kelayakan
                    </h4>
                    <span className="text-[10px] font-bold text-[#006878] bg-[#E6F7F9] px-2 py-0.5 rounded">
                      7 / 7 Atribut
                    </span>
                  </div>

                  <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                    {item.attributeChecklist.map((finding) => {
                      const style = ATTRIBUTE_STATUS_STYLE[finding.status];
                      return (
                        <div
                          key={finding.attributeKey}
                          className="p-2.5 bg-white text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-[#1E293B]">
                              {finding.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.badgeClass}`}
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {style.icon}
                              </span>
                              {finding.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#475569]">
                            <div>
                              <span className="text-[#64748B] block">Input Form:</span>
                              <strong className="text-[#0F172A]">
                                {finding.submittedValue}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[#64748B] block">
                                Bukti Terekstraksi:
                              </span>
                              <strong className="text-[#0F172A]">
                                {finding.extractedValue ??
                                  'Tidak terdeteksi pada bukti'}
                              </strong>
                            </div>
                          </div>
                          {finding.note && (
                            <p className="text-[10px] text-[#64748B] italic">
                              {finding.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Mock Extraction Assistant Disclosure Banner (BR-18, BR-26, BR-37) */}
              <div
                role="note"
                aria-label="Disclosure Asisten Ekstraksi Simulasi"
                className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2.5 text-xs text-[#92400E]"
              >
                <span className="material-symbols-outlined text-[20px] text-[#B45309] shrink-0 mt-0.5">
                  smart_toy
                </span>
                <div className="space-y-1">
                  <span className="font-extrabold block text-[#92400E]">
                    Asisten Ekstraksi Otomatis &mdash; Butuh Peninjauan Manual
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Pemeriksaan di atas adalah hasil analisis otomatis sebagai alat bantu peninjauan.
                    Format berkas dan rentang tanggal diverifikasi oleh sistem, dan keputusan kelayakan akhir
                    ditetapkan oleh Talent Support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* HITL Decision Form (Matching Stitch b490bfff) */}
          <section
            aria-label="Formulir Keputusan HITL"
            className="bg-white rounded-xl p-5 shadow-xs border border-[#E2E8F0] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Apakah request JAT ini valid?
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Status Saat Ini: <strong>{application.validationStatus}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => {
                  setDecision('Approved');
                  setValidationError(null);
                }}
                aria-pressed={decision === 'Approved'}
                className={`h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer border ${
                  decision === 'Approved'
                    ? 'bg-[#0BB178] text-white border-[#0BB178] shadow-xs'
                    : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] hover:bg-[#D1FAE5]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Iya (Valid &mdash; Setujui)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('Rejected');
                  setValidationError(null);
                }}
                aria-pressed={decision === 'Rejected'}
                className={`h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer border ${
                  decision === 'Rejected'
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                    : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] hover:bg-[#FEE2E2]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>Tidak (Tolak Request)</span>
              </button>
            </div>

            {/* Mandatory Rejection Reason Textarea when 'Tidak' (Rejected) is selected (BR-24 & DSN-TBD-03) */}
            {decision === 'Rejected' && (
              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <label
                  htmlFor="hitl-rejection-reason-input"
                  className="text-xs font-extrabold text-[#0F172A] flex items-center justify-between"
                >
                  <span>
                    Berikan alasan mengapa request JAT ini tidak valid{' '}
                    <span className="text-[#DC2626]">*</span> (Wajib diisi)
                  </span>
                </label>
                <textarea
                  id="hitl-rejection-reason-input"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Contoh: Bukti screenshot terpotong / nama perusahaan tidak terlihat jelas / role tidak sesuai dengan bukti unggahan."
                  className="w-full p-3 rounded-xl bg-[#F8FAFB] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
                />
              </div>
            )}

            {/* Optional Feedback Note for Student */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
              <label
                htmlFor="hitl-review-feedback-input"
                className="text-xs font-bold text-[#334155] block"
              >
                Catatan / Feedback Tambahan untuk Mahasiswa (Opsional)
              </label>
              <input
                id="hitl-review-feedback-input"
                type="text"
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Catatan umpan balik yang akan ditampilkan pada detail aplikasi Student..."
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFB] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB]"
              />
            </div>

            {validationError && (
              <div
                role="alert"
                className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-xs font-bold text-[#B91C1C] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{validationError}</span>
              </div>
            )}
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#334155] transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#64748B] hidden sm:inline">
              {decision === 'Approved'
                ? `Status: Akan menyetujui bukti lamaran Phase ${application.phaseNumber}`
                : 'Status: Request akan ditolak beserta alasan penolakan'}
            </span>
            <button
              type="button"
              onClick={handlePrimaryActionClick}
              className={`px-5 py-2.5 rounded-lg text-xs font-extrabold text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                decision === 'Approved'
                  ? 'bg-[#0BB1CB] hover:bg-[#006878]'
                  : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
            >
              <span>
                {decision === 'Approved' ? 'Konfirmasi JAT' : 'Tolak Request'}
              </span>
              <span className="material-symbols-outlined text-[16px]">
                {decision === 'Approved' ? 'arrow_forward' : 'block'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Confirmation Dialog before Committing Consequential Decision (Stitch b490bfff) */}
      {isConfirmDialogOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hitl-secondary-confirm-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                decision === 'Approved'
                  ? 'bg-[#ECFDF5] text-[#047857]'
                  : 'bg-[#FEF2F2] text-[#B91C1C]'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {decision === 'Approved' ? 'verified' : 'warning'}
              </span>
            </div>

            <div className="text-center space-y-1.5">
              <h3
                id="hitl-secondary-confirm-title"
                className="text-base font-extrabold text-[#0F172A]"
              >
                Dialog Konfirmasi Keputusan Review
              </h3>
              {decision === 'Approved' ? (
                <p className="text-xs text-[#475569] leading-relaxed">
                  Anda akan menyetujui (<strong>Approved</strong>) bukti lamaran ke{' '}
                  <strong>{application.company}</strong> untuk mahasiswa{' '}
                  <strong>{item.studentName}</strong>. Kuota Phase{' '}
                  {application.phaseNumber} akan diperbarui dan item ini akan keluar dari
                  antrean Waiting Confirmation.
                </p>
              ) : (
                <p className="text-xs text-[#475569] leading-relaxed">
                  Anda akan menolak (<strong>Rejected</strong>) bukti lamaran ke{' '}
                  <strong>{application.company}</strong> untuk mahasiswa{' '}
                  <strong>{item.studentName}</strong> dengan alasan:{' '}
                  <em className="text-[#B91C1C]">&ldquo;{rejectionReason.trim()}&rdquo;</em>.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#334155] transition-colors cursor-pointer disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCommit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={`h-10 rounded-lg text-xs font-extrabold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : decision === 'Approved'
                      ? 'bg-[#0BB1CB] hover:bg-[#006878]'
                      : 'bg-[#DC2626] hover:bg-[#B91C1C]'
                }`}
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>
                  {isSubmitting
                    ? 'Menyimpan...'
                    : decision === 'Approved'
                      ? 'Ya, Setujui'
                      : 'Ya, Tolak Request'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
