import React, { useEffect, useState } from 'react';
import { JOB_LEVEL_OPTIONS } from '../../mocks/jatData';
import {
  type BatchAccessEvaluation,
  validateEvidenceFile,
  validateStudentApplicationSubmission,
} from '../../services/batchValidator';
import type {
  CreateStudentApplicationInput,
  EvidenceFileMetadata,
  JatBatch,
  JobLevel,
  PositionType,
  WorkSystem,
} from '../../types/jat';
import { formatDateId } from '../../utils/formatDate';

export interface AddProofOfApplicationDrawerProps {
  isOpen: boolean;
  batch: JatBatch;
  studentId: string;
  referenceDate: string;
  access: BatchAccessEvaluation;
  onClose: () => void;
  onSubmitSuccess: (createdRecordId: string) => void;
  onSubmitApplication: (
    input: CreateStudentApplicationInput,
    referenceDate: string
  ) => { id: string };
}

const POSITION_OPTIONS: PositionType[] = [
  'Full-time',
  'Internship',
  'Contract',
  'Freelance',
];

const WORK_SYSTEM_OPTIONS: WorkSystem[] = ['Remote / WFH', 'Hybrid', 'Onsite'];

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Reconstructed from Approved Stitch Screen:
 * - `384daeedae4842fba4fb6790c0e8e043` ("Student - JAT Add Proof of Application Drawer (Enhanced)")
 *
 * Implements EP-JAT-04 (BLG-JAT-013, BLG-JAT-014, BLG-JAT-015):
 * - 10 required fields aligned with PRD, System-Requirements.md Section 5, and Stitch `384daeed`.
 * - Validates required fields (BR-10), file extension + MIME type + size (BR-11, BR-12),
 *   future dates (BR-13), and active date range comparison (BR-14, BR-45, DSN-TBD-04).
 * - Supports evidence preview/summary, remove, and replace actions.
 * - Explicitly explains that upload means evidence was received for processing, NOT approved (BR-15).
 */
export const AddProofOfApplicationDrawer: React.FC<
  AddProofOfApplicationDrawerProps
> = ({
  isOpen,
  batch,
  studentId,
  referenceDate,
  access,
  onClose,
  onSubmitSuccess,
  onSubmitApplication,
}) => {
  const [dateApplied, setDateApplied] = useState<string>(referenceDate);
  const [role, setRole] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [position, setPosition] = useState<PositionType | ''>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [jobLevel, setJobLevel] = useState<JobLevel | ''>('');
  const [workSystem, setWorkSystem] = useState<WorkSystem | ''>('');
  const [vacancyUrl, setVacancyUrl] = useState<string>('');
  const [evidenceFile, setEvidenceFile] = useState<EvidenceFileMetadata | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form state whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      setDateApplied(referenceDate);
      setRole('');
      setCompany('');
      setLocation('');
      setPosition('');
      setYearsOfExperience('');
      setJobLevel('');
      setWorkSystem('');
      setVacancyUrl('');
      setEvidenceFile(null);
      setFieldErrors({});
      setUploadError(null);
      setSubmitError(null);
    }
  }, [isOpen, referenceDate]);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewObjectUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  if (!isOpen) return null;

  const currentCandidateInput: CreateStudentApplicationInput = {
    batchId: batch.id,
    studentId,
    dateApplied,
    role,
    company,
    location,
    position,
    yearsOfExperience,
    jobLevel,
    workSystem,
    vacancyUrl,
    evidenceFile,
  };

  const liveDateEvaluation = validateStudentApplicationSubmission(
    currentCandidateInput,
    batch,
    referenceDate
  );

  const isFutureDate = Boolean(dateApplied && referenceDate && dateApplied > referenceDate);
  const isOutOfRangeDate = Boolean(
    dateApplied && !isFutureDate && !liveDateEvaluation.isDateWithinActiveRange
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const metadata: EvidenceFileMetadata = {
      name: selected.name,
      size: selected.size,
      type: selected.type,
    };

    const check = validateEvidenceFile(metadata);
    if (!check.valid) {
      setEvidenceFile(null);
      if (previewObjectUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(previewObjectUrl);
      }
      setPreviewObjectUrl(null);
      setUploadError(check.error || 'Berkas bukti lamaran tidak valid.');
      setFieldErrors((prev) => ({
        ...prev,
        evidenceFile: check.error || 'Berkas bukti lamaran tidak valid.',
      }));
      e.target.value = '';
      return;
    }

    if (previewObjectUrl && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(previewObjectUrl);
    }
    let nextPreviewUrl: string | null = null;
    try {
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        nextPreviewUrl = URL.createObjectURL(selected);
      }
    } catch {
      nextPreviewUrl = null;
    }

    setPreviewObjectUrl(nextPreviewUrl);
    setEvidenceFile(metadata);
    setUploadError(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.evidenceFile;
      return next;
    });
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    if (previewObjectUrl && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(previewObjectUrl);
    }
    setPreviewObjectUrl(null);
    setEvidenceFile(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateStudentApplicationSubmission(
      currentCandidateInput,
      batch,
      referenceDate
    );

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    try {
      const created = onSubmitApplication(currentCandidateInput, referenceDate);
      onSubmitSuccess(created.id);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Gagal menyimpan pengajuan lamaran.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Right Slide-Over Drawer (Stitch 384daeed) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Add Proof of Application"
        className="relative z-10 w-[580px] max-w-full bg-white shadow-2xl h-screen flex flex-col justify-between overflow-hidden border-l border-[#E2E8F0]"
      >
        {/* Sticky Drawer Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#1E293B] tracking-tight">
                Add Proof of Application
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F9] text-[#006878] font-bold text-[11px] border border-[#0BB1CB]/30">
                {batch.name} &bull; Phase {access.activePhaseNumber ?? 1}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Unggah bukti lamaran resmi untuk diverifikasi oleh tim Talent Support.
            </p>
          </div>
          <button
            type="button"
            aria-label="Tutup formulir bukti lamaran"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Informational Requirements & BR-15 / BR-12 Disclosure Banner */}
          <div className="rounded-xl p-4 bg-[#E6F7F9]/75 border border-[#0BB1CB]/30 text-[#1E293B] flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#0BB1CB]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#006878]">
              <span className="material-symbols-outlined text-lg">info</span>
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-extrabold text-[#0F172A] text-xs">
                Catatan Penting Persyaratan Unggah (BR-11, BR-12, BR-15)
              </h3>
              <p className="text-[#334155] leading-relaxed">
                Format bukti yang diterima:{' '}
                <strong className="font-bold text-[#0F172A]">
                  JPG, JPEG, PNG (maksimal 5MB)
                </strong>
                .{' '}
                <strong>
                  Berhasil mengunggah berkas hanya berarti bukti telah diterima untuk
                  pemrosesan (status awal: Waiting Confirmation), bukan bahwa pengajuan telah
                  disetujui (BR-15).
                </strong>
              </p>
              <p className="text-[11px] text-[#475569]">
                Catatan Arsitektur (BR-12): Validasi format &amp; tipe MIME pada prototype ini
                dilakukan di sisi klien; pemeriksaan ulang wajib dijalankan di sisi server saat
                backend aktif.
              </p>
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-xl p-3.5 bg-[#FEF2F2] border border-[#EF4444]/40 text-xs text-[#B91C1C] font-semibold"
            >
              {submitError}
            </div>
          )}

          {/* Application Submission Form */}
          <form
            id="proof-application-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Row 1: Date Applied & Role Applied */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 1: Date Applied */}
              <div className="space-y-1.5">
                <label
                  htmlFor="date-applied"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Date Applied <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <input
                  id="date-applied"
                  type="date"
                  value={dateApplied}
                  onChange={(e) => {
                    setDateApplied(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.dateApplied;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.dateApplied)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                />
                {fieldErrors.dateApplied ? (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.dateApplied}
                  </p>
                ) : isOutOfRangeDate ? (
                  <div
                    role="status"
                    className="rounded-lg p-2 bg-[#FFFBEB] border border-[#F59E0B]/40 text-[11px] text-[#B45309] leading-snug"
                  >
                    <strong>Peringatan Rentang Tanggal (BR-14 &amp; BR-45):</strong> Tanggal{' '}
                    {formatDateId(dateApplied)} berada di luar rentang aktif (
                    {access.activeDateRange
                      ? `${formatDateId(access.activeDateRange.startDate)} – ${formatDateId(access.activeDateRange.endDate)}`
                      : 'periode aktif'}
                    ). Anda tetap dapat mengirimkannya, namun status validasi otomatis menjadi{' '}
                    <strong>Rejected</strong> (DSN-TBD-04).
                  </div>
                ) : (
                  <p className="text-[10px] text-[#64748B] leading-tight">
                    Rentang aktif saat ini:{' '}
                    {access.activeDateRange
                      ? `${formatDateId(access.activeDateRange.startDate)} – ${formatDateId(access.activeDateRange.endDate)}`
                      : '-'}
                    . Tanggal masa depan ditolak (BR-13).
                  </p>
                )}
              </div>

              {/* Field 2: Role Applied */}
              <div className="space-y-1.5">
                <label
                  htmlFor="role-applied"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Role Applied <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <input
                  id="role-applied"
                  type="text"
                  placeholder="e.g. UI/UX Designer"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.role;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.role)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                />
                {fieldErrors.role ? (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.role}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#64748B] leading-tight">
                    Tuliskan nama role sesuai dengan lowongan.
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Company Name & Company Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 3: Company Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="company-name"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Company Name <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  placeholder="e.g. Pertamina (Persero)"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.company;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.company)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                />
                {fieldErrors.company && (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.company}
                  </p>
                )}
              </div>

              {/* Field 4: Company Location */}
              <div className="space-y-1.5">
                <label
                  htmlFor="company-location"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Company Location <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <input
                  id="company-location"
                  type="text"
                  placeholder="e.g. Jakarta Pusat"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.location;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.location)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                />
                {fieldErrors.location && (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Position & Years of Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 5: Position */}
              <div className="space-y-1.5">
                <label
                  htmlFor="position-select"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Position <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <select
                  id="position-select"
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value as PositionType | '');
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.position;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.position)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                >
                  <option value="">Choose Position</option>
                  {POSITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {fieldErrors.position && (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.position}
                  </p>
                )}
              </div>

              {/* Field 6: Years of Experience */}
              <div className="space-y-1.5">
                <label
                  htmlFor="experience-input"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Years of Experience <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <input
                  id="experience-input"
                  type="text"
                  placeholder="e.g. 0-1 Tahun, 1-2 Tahun"
                  value={yearsOfExperience}
                  onChange={(e) => {
                    setYearsOfExperience(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.yearsOfExperience;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.yearsOfExperience)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                />
                {fieldErrors.yearsOfExperience && (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.yearsOfExperience}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Job Level & Work System */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 7: Job Level */}
              <div className="space-y-1.5">
                <label
                  htmlFor="job-level-select"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Job Level <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <select
                  id="job-level-select"
                  value={jobLevel}
                  onChange={(e) => {
                    setJobLevel(e.target.value as JobLevel | '');
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.jobLevel;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.jobLevel)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                >
                  <option value="">Choose Job Level</option>
                  {JOB_LEVEL_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                {fieldErrors.jobLevel && (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.jobLevel}
                  </p>
                )}
              </div>

              {/* Field 8: Work System */}
              <div className="space-y-1.5">
                <label
                  htmlFor="work-system-select"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Work System <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <select
                  id="work-system-select"
                  value={workSystem}
                  onChange={(e) => {
                    setWorkSystem(e.target.value as WorkSystem | '');
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.workSystem;
                      return next;
                    });
                  }}
                  aria-invalid={Boolean(fieldErrors.workSystem)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
                >
                  <option value="">Choose Work System</option>
                  {WORK_SYSTEM_OPTIONS.map((ws) => (
                    <option key={ws} value={ws}>
                      {ws}
                    </option>
                  ))}
                </select>
                {fieldErrors.workSystem && (
                  <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                    {fieldErrors.workSystem}
                  </p>
                )}
              </div>
            </div>

            {/* Row 5: Link Job Vacancy */}
            <div className="space-y-1.5">
              <label
                htmlFor="vacancy-link"
                className="block text-xs font-bold text-[#334155]"
              >
                Link Job Vacancy <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                id="vacancy-link"
                type="url"
                placeholder="https://recruitment.pertamina.com/job/uiux-designer"
                value={vacancyUrl}
                onChange={(e) => {
                  setVacancyUrl(e.target.value);
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.vacancyUrl;
                    return next;
                  });
                }}
                aria-invalid={Boolean(fieldErrors.vacancyUrl)}
                className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-medium text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0BB1CB] focus:bg-white"
              />
              {fieldErrors.vacancyUrl && (
                <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                  {fieldErrors.vacancyUrl}
                </p>
              )}
            </div>

            {/* Row 6: Upload Proof of Application Dropzone (BR-11, BR-12) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="proof-file-input"
                  className="block text-xs font-bold text-[#334155]"
                >
                  Upload Proof of Application{' '}
                  <span className="text-[#EF4444] font-bold">*</span>
                </label>
                <span className="text-[10px] font-semibold text-[#64748B]">
                  JPG, JPEG, PNG (Maks. 5MB)
                </span>
              </div>

              <div className="rounded-xl p-5 bg-[#E6F7F9]/30 hover:bg-[#E6F7F9]/60 border-2 border-dashed border-[#0BB1CB]/60 transition-all flex flex-col items-center justify-center text-center space-y-2.5">
                <input
                  id="proof-file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  aria-label="Upload Proof of Application"
                  onChange={handleFileChange}
                  className="text-xs text-[#334155] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0BB1CB] file:text-white hover:file:bg-[#006878] cursor-pointer"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#006878]">
                    {evidenceFile
                      ? 'Pilih berkas baru di atas untuk mengganti lampiran saat ini'
                      : 'Pilih atau tarik file screenshot bukti lamaran di sini'}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Mendukung JPG, JPEG, PNG (Maks. 5MB) &bull; Ekstensi &amp; MIME type
                    diperiksa
                  </p>
                </div>

                {/* Active Uploaded File Summary & Preview Card */}
                {evidenceFile && (
                  <div
                    role="region"
                    aria-label="Ringkasan Berkas Terunggah"
                    className="w-full mt-2 p-3 rounded-xl bg-white border border-[#CBD5E1] shadow-xs flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {previewObjectUrl ? (
                        <img
                          src={previewObjectUrl}
                          alt={`Preview ${evidenceFile.name}`}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">image</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#1E293B] truncate">
                          {evidenceFile.name}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {formatFileSize(evidenceFile.size)} &bull;{' '}
                          <span className="font-semibold text-[#047857]">
                            {evidenceFile.type}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Hapus lampiran bukti"
                      onClick={handleRemoveFile}
                      className="px-2.5 py-1 rounded-lg border border-[#EF4444]/30 bg-[#FEF2F2] hover:bg-rose-100 text-[#B91C1C] text-[11px] font-bold transition-colors shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {(uploadError || fieldErrors.evidenceFile) && (
                <p role="alert" className="text-[11px] font-bold text-[#B91C1C]">
                  {uploadError || fieldErrors.evidenceFile}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Sticky Drawer Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFB] text-[#334155] font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            form="proof-application-form"
            className="px-5 py-2.5 rounded-lg bg-[#0BB1CB] hover:bg-[#006878] text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">send</span>
            <span>Submit Bukti Lamaran</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
