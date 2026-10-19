import type {
  CreateOrUpdateBatchInput,
  CreateStudentApplicationInput,
  DateRangeConfig,
  EvidenceFileMetadata,
  JatBatch,
  PeriodWindowStatus,
  PhaseConfig,
  StudentIdentity,
  ValidationStatus,
} from '../types/jat';


export interface BatchValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Deterministic Business Rules Validator for EP-JAT-01 (Batch Management) & EP-JAT-02 (Participant Management):
 * - BR-01: Batch/program name is required (non-empty).
 * - BR-02: Batch name must be unique (case-insensitive check against existing batches, excluding current batch when editing).
 * - BR-03: Start date must be on or before end date (startDate <= endDate).
 * - BR-04: Phase 1 is mandatory; Phase 2 is optional.
 * - BR-05: Each active phase supports one or more date ranges and one or more job-level targets with targetCount >= 1.
 * - BR-09 / DSN-TBD-05: Deleting a batch requires exact batch-name confirmation; removing a participant requires explicit confirmation.
 * - BLG-JAT-007: Participant identity is distinct from batch membership; duplicate membership of the same Student in the same batch is rejected.
 */
export function validateBatchInput(
  input: CreateOrUpdateBatchInput,
  existingBatches: JatBatch[],
  editingBatchId?: string
): BatchValidationResult {
  const errors: Record<string, string> = {};

  // BR-01: Nama batch wajib
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    errors.name = 'Nama Program / Batch JAT wajib diisi (BR-01).';
  } else {
    // BR-02: Nama batch unik
    const isDuplicate = existingBatches.some(
      (b) =>
        b.id !== editingBatchId &&
        b.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      errors.name = `Nama batch "${trimmedName}" sudah digunakan. Gunakan nama batch yang unik (BR-02).`;
    }
  }

  // Affiliated Bootcamp Cohort required in approved design (4e57b402)
  if (!input.affiliatedCohortIds || input.affiliatedCohortIds.length === 0) {
    errors.affiliatedCohorts = 'Pilih minimal 1 Batch Bootcamp terafiliasi.';
  }

  // Validate Phase 1 (Mandatory)
  validatePhase(input.phase1, 'phase1', true, errors);

  // Validate Phase 2 (Optional - BR-04)
  if (input.phase2.enabled) {
    validatePhase(input.phase2, 'phase2', false, errors);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function validatePhase(
  phase: PhaseConfig,
  prefix: 'phase1' | 'phase2',
  isMandatory: boolean,
  errors: Record<string, string>
): void {
  const phaseLabel = prefix === 'phase1' ? 'Phase 1' : 'Phase 2';

  if (isMandatory && !phase.enabled) {
    errors[prefix] = `${phaseLabel} wajib diaktifkan.`;
    return;
  }

  if (!phase.dateRanges || phase.dateRanges.length === 0) {
    errors[prefix] = `${phaseLabel} harus memiliki minimal 1 rentang tanggal (Date Range).`;
    return;
  }

  const seenRangeKeys = new Map<string, number>();

  phase.dateRanges.forEach((range, rangeIdx) => {
    const rangeKey = `${prefix}.range.${rangeIdx}`;
    const rangeTitle = range.label || `Date Range ${rangeIdx + 1}`;

    if (!range.startDate) {
      errors[`${rangeKey}.startDate`] = `Start Date pada ${phaseLabel} (${rangeTitle}) wajib diisi.`;
    }
    if (!range.endDate) {
      errors[`${rangeKey}.endDate`] = `End Date pada ${phaseLabel} (${rangeTitle}) wajib diisi.`;
    }

    // BR-03: Start date <= End date
    if (range.startDate && range.endDate && range.startDate > range.endDate) {
      errors[`${rangeKey}.dates`] = `Start Date tidak boleh melewati End Date pada ${phaseLabel} (${rangeTitle}) (BR-03).`;
    } else if (range.startDate && range.endDate) {
      // JAT-BL-14 & BLG-JAT-037: Prevent duplicate date ranges within the same phase
      const pairKey = `${range.startDate.trim()}__${range.endDate.trim()}`;
      const existingIdx = seenRangeKeys.get(pairKey);
      if (existingIdx !== undefined) {
        errors[`${rangeKey}.dates`] = `Rentang tanggal duplikat (${range.startDate} s/d ${range.endDate}) tidak diizinkan dalam ${phaseLabel} yang sama (sama dengan Date Range ${existingIdx + 1} — JAT-BL-14).`;
      } else {
        seenRangeKeys.set(pairKey, rangeIdx);
      }
    }

    // BR-05: Job level targets
    if (!range.targets || range.targets.length === 0) {
      errors[`${rangeKey}.targets`] = `${phaseLabel} (${rangeTitle}) harus memiliki minimal 1 Target Job Level (BR-05).`;
    } else {
      range.targets.forEach((target, targetIdx) => {
        const targetKey = `${rangeKey}.target.${targetIdx}`;
        if (!target.jobLevel) {
          errors[targetKey] = `Job Level wajib dipilih pada ${phaseLabel} (${rangeTitle}).`;
        } else if (
          typeof target.targetCount !== 'number' ||
          Number.isNaN(target.targetCount) ||
          target.targetCount < 1
        ) {
          errors[targetKey] = `Target jumlah lamaran pada ${phaseLabel} (${rangeTitle} - ${target.jobLevel}) minimal 1.`;
        }
      });
    }
  });
}

/**
 * BR-09 & DSN-TBD-05: Exact batch-name confirmation check before deleting a batch.
 */
export function validateBatchDeleteConfirmation(
  targetBatchName: string,
  typedConfirmationName: string
): { valid: boolean; error?: string } {
  if (!typedConfirmationName.trim()) {
    return {
      valid: false,
      error: 'Masukkan nama batch untuk mengonfirmasi penghapusan (BR-09).',
    };
  }
  if (typedConfirmationName.trim() !== targetBatchName.trim()) {
    return {
      valid: false,
      error: `Nama batch tidak cocok. Ketik persis "${targetBatchName}" untuk menghapus (BR-09).`,
    };
  }
  return { valid: true };
}

/**
 * EP-JAT-02 (BLG-JAT-006, BLG-JAT-007):
 * Validates adding one or more Student identities to a JAT Batch.
 * Rejects empty selections, unknown student IDs, and duplicate memberships in the same batch.
 */
export function validateParticipantAddition(
  batch: JatBatch,
  candidateStudentIds: string[],
  studentDirectory: StudentIdentity[]
): { valid: boolean; error?: string; duplicateStudentNames?: string[] } {
  const uniqueCandidateIds = Array.from(new Set(candidateStudentIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueCandidateIds.length === 0) {
    return {
      valid: false,
      error: 'Pilih minimal 1 mahasiswa untuk ditambahkan ke batch ini.',
    };
  }

  const unknownIds = uniqueCandidateIds.filter(
    (id) => !studentDirectory.some((stu) => stu.id === id)
  );
  if (unknownIds.length > 0) {
    return {
      valid: false,
      error: `Data identitas student tidak ditemukan di direktori: ${unknownIds.join(', ')}.`,
    };
  }

  const alreadyEnrolled = batch.participants.filter((p) => uniqueCandidateIds.includes(p.id));
  if (alreadyEnrolled.length > 0) {
    const names = alreadyEnrolled.map((p) => p.name);
    return {
      valid: false,
      error: `Mahasiswa berikut sudah terdaftar di ${batch.name}: ${names.join(', ')}. Duplikasi peserta dalam batch yang sama tidak diizinkan.`,
      duplicateStudentNames: names,
    };
  }

  return { valid: true };
}

/**
 * Helper to compute total target applications across a Phase or entire Batch.
 */
export function calculatePhaseTotalTarget(phase: PhaseConfig): number {
  if (!phase.enabled) return 0;
  return deduplicateDateRanges(phase.dateRanges).reduce(
    (sum, range) =>
      sum +
      range.targets.reduce(
        (rSum, t) =>
          rSum + (Number.isFinite(t.targetCount) && t.targetCount > 0 ? t.targetCount : 0),
        0
      ),
    0
  );
}

export function getPhaseOverallStartEnd(phase: PhaseConfig): {
  startDate: string | null;
  endDate: string | null;
} {
  if (!phase.enabled) {
    return { startDate: null, endDate: null };
  }
  const ranges = deduplicateDateRanges(phase.dateRanges);
  if (ranges.length === 0) {
    return { startDate: null, endDate: null };
  }
  const validStarts = ranges.map((r) => r.startDate).filter(Boolean).sort();
  const validEnds = ranges.map((r) => r.endDate).filter(Boolean).sort();
  return {
    startDate: validStarts[0] ?? null,
    endDate: validEnds[validEnds.length - 1] ?? null,
  };
}

/**
 * EP-JAT-03 (BLG-JAT-010, BLG-JAT-011, JAT-BL-14):
 * Deduplicates date ranges within a phase by (startDate, endDate) pair so the UI never displays
 * duplicate date ranges even if duplicate entries are passed in.
 */
export function deduplicateDateRanges(ranges: DateRangeConfig[] | undefined | null): DateRangeConfig[] {
  if (!ranges || ranges.length === 0) return [];
  const seenKeys = new Set<string>();
  const result: DateRangeConfig[] = [];

  for (const range of ranges) {
    if (!range) continue;
    const key =
      range.startDate && range.endDate
        ? `${range.startDate.trim()}__${range.endDate.trim()}`
        : `id:${range.id}`;
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    result.push({
      ...range,
      label: range.label || `Date Range ${result.length + 1}`,
    });
  }

  return result;
}

/**
 * EP-JAT-03 (BLG-JAT-009..012, BR-03, BR-07):
 * Evaluates whether a period window [startDate, endDate] is Active, Upcoming, Expired, or Inactive
 * relative to `referenceDate` (ISO YYYY-MM-DD).
 * Boundary rule: inclusive on both startDate and endDate (`startDate <= referenceDate <= endDate` is `'Active'`).
 */
export function evaluatePeriodWindowStatus(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  referenceDate: string
): PeriodWindowStatus {
  if (!startDate || !endDate || !referenceDate) {
    return 'Inactive';
  }
  // BR-03: Start date must not be later than end date
  if (startDate > endDate) {
    return 'Inactive';
  }
  if (referenceDate < startDate) {
    return 'Upcoming';
  }
  if (referenceDate > endDate) {
    return 'Expired';
  }
  return 'Active';
}

export interface EvaluatedDateRange extends DateRangeConfig {
  windowStatus: PeriodWindowStatus;
  totalTargetCount: number;
}

export interface PhaseAccessEvaluation {
  phaseNumber: 1 | 2;
  enabled: boolean;
  startDate: string | null;
  endDate: string | null;
  windowStatus: PeriodWindowStatus;
  totalTargetCount: number;
  dateRanges: EvaluatedDateRange[];
  activeRanges: EvaluatedDateRange[];
  canSubmit: boolean;
}

/**
 * EP-JAT-03 (BLG-JAT-010..012, BR-04..BR-07):
 * Evaluates a Phase configuration for Student presentation and period access control.
 */
export function evaluatePhaseAccess(
  phase: PhaseConfig,
  referenceDate: string
): PhaseAccessEvaluation {
  if (!phase.enabled) {
    return {
      phaseNumber: phase.phaseNumber,
      enabled: false,
      startDate: null,
      endDate: null,
      windowStatus: 'Inactive',
      totalTargetCount: 0,
      dateRanges: [],
      activeRanges: [],
      canSubmit: false,
    };
  }

  const deduped = deduplicateDateRanges(phase.dateRanges);
  if (deduped.length === 0) {
    return {
      phaseNumber: phase.phaseNumber,
      enabled: true,
      startDate: null,
      endDate: null,
      windowStatus: 'Inactive',
      totalTargetCount: 0,
      dateRanges: [],
      activeRanges: [],
      canSubmit: false,
    };
  }

  const evaluatedRanges: EvaluatedDateRange[] = deduped.map((r) => {
    const totalTargetCount = r.targets.reduce(
      (sum, t) => sum + (Number.isFinite(t.targetCount) && t.targetCount > 0 ? t.targetCount : 0),
      0
    );
    return {
      ...r,
      windowStatus: evaluatePeriodWindowStatus(r.startDate, r.endDate, referenceDate),
      totalTargetCount,
    };
  });

  const activeRanges = evaluatedRanges.filter((r) => r.windowStatus === 'Active');
  const overall = getPhaseOverallStartEnd({ ...phase, dateRanges: deduped });
  const totalTargetCount = evaluatedRanges.reduce((s, r) => s + r.totalTargetCount, 0);

  let windowStatus: PeriodWindowStatus = 'Inactive';
  if (activeRanges.length > 0) {
    windowStatus = 'Active';
  } else if (overall.startDate && overall.endDate) {
    if (referenceDate < overall.startDate) {
      windowStatus = 'Upcoming';
    } else if (referenceDate > overall.endDate) {
      windowStatus = 'Expired';
    } else {
      // Between two non-contiguous ranges inside the phase
      windowStatus = 'Upcoming';
    }
  }

  return {
    phaseNumber: phase.phaseNumber,
    enabled: true,
    startDate: overall.startDate,
    endDate: overall.endDate,
    windowStatus,
    totalTargetCount,
    dateRanges: evaluatedRanges,
    activeRanges,
    canSubmit: activeRanges.length > 0,
  };
}

export interface BatchAccessEvaluation {
  periodStatus: PeriodWindowStatus;
  phase1Access: PhaseAccessEvaluation;
  phase2Access: PhaseAccessEvaluation;
  activePhaseNumber: 1 | 2 | null;
  activeDateRange: EvaluatedDateRange | null;
  canSubmitApplication: boolean;
  accessMessage: string;
}

/**
 * EP-JAT-03 (BLG-JAT-010..012, BR-06, BR-07):
 * Evaluates full batch period status and submission access for the Student view.
 */
export function evaluateBatchAccess(
  batch: JatBatch,
  referenceDate: string
): BatchAccessEvaluation {
  const phase1Access = evaluatePhaseAccess(batch.phase1, referenceDate);
  const phase2Access = evaluatePhaseAccess(batch.phase2, referenceDate);

  const canSubmitApplication = phase1Access.canSubmit || phase2Access.canSubmit;
  const activePhaseNumber: 1 | 2 | null = phase1Access.canSubmit
    ? 1
    : phase2Access.canSubmit
      ? 2
      : null;
  const activeDateRange: EvaluatedDateRange | null =
    phase1Access.activeRanges[0] ?? phase2Access.activeRanges[0] ?? null;

  let periodStatus: PeriodWindowStatus = 'Inactive';
  if (canSubmitApplication) {
    periodStatus = 'Active';
  } else {
    const statuses = [
      phase1Access.windowStatus,
      phase2Access.enabled ? phase2Access.windowStatus : 'Inactive',
    ].filter((s) => s !== 'Inactive');

    if (statuses.includes('Upcoming')) {
      periodStatus = 'Upcoming';
    } else if (statuses.includes('Expired')) {
      periodStatus = 'Expired';
    } else {
      periodStatus = 'Inactive';
    }
  }

  let accessMessage = '';
  if (canSubmitApplication && activeDateRange && activePhaseNumber) {
    accessMessage = `Periode pelaporan aktif: Phase ${activePhaseNumber} — ${activeDateRange.label} (${activeDateRange.startDate} s/d ${activeDateRange.endDate}).`;
  } else if (periodStatus === 'Upcoming') {
    const nextStart =
      phase1Access.windowStatus === 'Upcoming'
        ? phase1Access.startDate
        : phase2Access.startDate;
    accessMessage = `Periode pelaporan belum dimulai${nextStart ? ` (mulai ${nextStart})` : ''}. Tombol pengajuan lamaran dinonaktifkan di luar rentang tanggal aktif (BR-07).`;
  } else if (periodStatus === 'Expired') {
    const lastEnd =
      phase2Access.enabled && phase2Access.endDate
        ? phase2Access.endDate
        : phase1Access.endDate;
    accessMessage = `Periode pelaporan telah berakhir${lastEnd ? ` (berakhir ${lastEnd})` : ''}. Pengajuan lamaran baru tidak dapat dilakukan di luar periode (BR-07).`;
  } else {
    accessMessage = 'Tidak ada rentang tanggal aktif yang dikonfigurasi pada fase ini.';
  }

  return {
    periodStatus,
    phase1Access,
    phase2Access,
    activePhaseNumber,
    activeDateRange,
    canSubmitApplication,
    accessMessage,
  };
}

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSION_TO_MIMES: Record<string, string[]> = {
  jpg: ['image/jpeg', 'image/jpg'],
  jpeg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
};

/**
 * EP-JAT-04 (BLG-JAT-014, BLG-JAT-015, BR-11, BR-12, BR-34):
 * Validates uploaded evidence file metadata.
 * - Requires non-null file with non-empty name and size > 0.
 * - Rejects files > 5MB.
 * - Accepts only JPG, JPEG, and PNG extensions.
 * - Requires MIME type to be present, allowed, and consistent with the file extension
 *   (does NOT treat extension alone as proof of file validity).
 * - If magic header bytes are provided, verifies PNG (89 50 4E 47) or JPEG (FF D8 FF) signature.
 * - Note (BR-12): Frontend validation is an early guard only; server-side revalidation is mandatory
 *   when a production backend is integrated.
 */
export function validateEvidenceFile(
  file: EvidenceFileMetadata | null | undefined
): { valid: boolean; error?: string } {
  if (!file || !file.name || !file.name.trim()) {
    return {
      valid: false,
      error: 'Bukti screenshot lamaran wajib diunggah (BR-10).',
    };
  }

  if (typeof file.size !== 'number' || Number.isNaN(file.size) || file.size <= 0) {
    return {
      valid: false,
      error: 'Berkas bukti lamaran kosong (0 byte) atau tidak valid. Pilih berkas gambar yang utuh.',
    };
  }

  if (file.size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran berkas bukti melebihi batas maksimal 5MB.',
    };
  }

  const trimmedName = file.name.trim();
  const lastDotIdx = trimmedName.lastIndexOf('.');
  const ext = lastDotIdx > 0 ? trimmedName.slice(lastDotIdx + 1).toLowerCase() : '';

  const expectedMimes = ALLOWED_EXTENSION_TO_MIMES[ext];
  if (!expectedMimes) {
    return {
      valid: false,
      error:
        'Format berkas tidak didukung. Hanya berkas JPG, JPEG, dan PNG yang diizinkan (BR-11).',
    };
  }

  const normalizedMime = (file.type || '').trim().toLowerCase();
  if (!normalizedMime) {
    return {
      valid: false,
      error:
        'Tipe MIME berkas tidak terdeteksi. Ekstensi nama berkas saja tidak cukup sebagai bukti validitas berkas (BR-11, BR-12).',
    };
  }

  const allAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allAllowedMimes.includes(normalizedMime)) {
    return {
      valid: false,
      error: `Tipe MIME berkas (${normalizedMime}) tidak didukung. Hanya image/jpeg dan image/png yang diizinkan (BR-11).`,
    };
  }

  if (!expectedMimes.includes(normalizedMime)) {
    return {
      valid: false,
      error: `Ekstensi berkas (.${ext}) tidak cocok dengan tipe MIME berkas (${normalizedMime}). Ekstensi saja tidak dianggap bukti berkas valid (BR-11, BR-12).`,
    };
  }

  // Optional magic-byte verification when headerBytes are supplied
  if (file.headerBytes && file.headerBytes.length >= 3) {
    const b = file.headerBytes;
    const isPngHeader =
      b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    const isJpegHeader = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

    if (ext === 'png' && !isPngHeader) {
      return {
        valid: false,
        error: 'Isi biner berkas bukan gambar PNG yang valid (signature header tidak cocok).',
      };
    }
    if ((ext === 'jpg' || ext === 'jpeg') && !isJpegHeader) {
      return {
        valid: false,
        error: 'Isi biner berkas bukan gambar JPEG yang valid (signature header tidak cocok).',
      };
    }
  }

  return { valid: true };
}

export interface StudentSubmissionValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  isDateWithinActiveRange: boolean;
  matchedPhaseNumber: 1 | 2;
  matchedDateRangeId: string;
  matchedDateRangeLabel: string;
  initialValidationStatus: ValidationStatus;
  autoRejectionReason?: string;
}

/**
 * EP-JAT-04 (BLG-JAT-013..016, BR-10..BR-15, BR-45, DSN-TBD-04):
 * Validates a Student's job application submission form and determines initial status.
 * - Enforces all 10 required fields (BR-10).
 * - Rejects future `dateApplied` relative to `referenceDate` (BR-13).
 * - Checks `dateApplied` against the batch's configured date ranges (BR-14):
 *   - If `dateApplied` is within an enabled range: `initialValidationStatus = 'Waiting Confirmation'`
 *     (BR-15: upload means evidence was received for processing, NOT approved).
 *   - If `dateApplied` is in the past/present (`<= referenceDate`) but outside the configured date ranges:
 *     per Confirmed Decision `DSN-TBD-04` and `BR-45`, the Student can still submit, and the system
 *     automatically assigns `initialValidationStatus = 'Rejected'` with an explicit rejection reason.
 */
export function validateStudentApplicationSubmission(
  input: CreateStudentApplicationInput,
  batch: JatBatch,
  referenceDate: string
): StudentSubmissionValidationResult {
  const errors: Record<string, string> = {};

  const access = evaluateBatchAccess(batch, referenceDate);

  // Required Field 1: Date Applied (BR-10, BR-13)
  const dateApplied = (input.dateApplied || '').trim();
  if (!dateApplied) {
    errors.dateApplied = 'Tanggal melamar (Date Applied) wajib diisi (BR-10).';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateApplied)) {
    errors.dateApplied = 'Format Date Applied harus YYYY-MM-DD.';
  } else if (referenceDate && dateApplied > referenceDate) {
    errors.dateApplied = `Tanggal melamar (${dateApplied}) tidak boleh berada di masa depan (melewati ${referenceDate}) (BR-13).`;
  }

  // Required Field 2: Role Applied
  if (!input.role || !input.role.trim()) {
    errors.role = 'Role yang dilamar wajib diisi (BR-10).';
  }

  // Required Field 3: Company Name
  if (!input.company || !input.company.trim()) {
    errors.company = 'Nama perusahaan (Company Name) wajib diisi (BR-10).';
  }

  // Required Field 4: Company Location
  if (!input.location || !input.location.trim()) {
    errors.location = 'Lokasi perusahaan (Company Location) wajib diisi (BR-10).';
  }

  // Required Field 5: Position
  if (!input.position) {
    errors.position = 'Tipe posisi (Position) wajib dipilih (BR-10).';
  }

  // Required Field 6: Years of Experience
  if (!input.yearsOfExperience || !input.yearsOfExperience.trim()) {
    errors.yearsOfExperience = 'Pengalaman kerja (Years of Experience) wajib diisi (BR-10).';
  }

  // Required Field 7: Job Level
  if (!input.jobLevel) {
    errors.jobLevel = 'Level pekerjaan (Job Level) wajib dipilih (BR-10).';
  }

  // Required Field 8: Work System
  if (!input.workSystem) {
    errors.workSystem = 'Sistem kerja (Work System) wajib dipilih (BR-10).';
  }

  // Required Field 9: Link Job Vacancy
  const vacancyUrl = (input.vacancyUrl || '').trim();
  if (!vacancyUrl) {
    errors.vacancyUrl = 'Tautan lowongan kerja (Link Job Vacancy) wajib diisi (BR-10).';
  } else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(vacancyUrl)) {
    errors.vacancyUrl = 'Masukkan URL lowongan kerja yang valid (diawali http:// atau https://).';
  }

  // Required Field 10: Evidence File (BR-11, BR-12)
  const fileCheck = validateEvidenceFile(input.evidenceFile);
  if (!fileCheck.valid) {
    errors.evidenceFile = fileCheck.error || 'Berkas bukti lamaran tidak valid.';
  }

  // Determine whether dateApplied falls inside any configured Phase 1 or Phase 2 Date Range
  let isDateWithinActiveRange = false;
  let matchedPhaseNumber: 1 | 2 = access.activePhaseNumber ?? 1;
  let matchedDateRangeId =
    access.activeDateRange?.id ??
    access.phase1Access.dateRanges[0]?.id ??
    'unmatched-range';
  let matchedDateRangeLabel =
    access.activeDateRange?.label ??
    access.phase1Access.dateRanges[0]?.label ??
    'Date Range 1';

  if (dateApplied && !errors.dateApplied) {
    const p1Match = access.phase1Access.dateRanges.find(
      (r) => dateApplied >= r.startDate && dateApplied <= r.endDate
    );
    const p2Match = access.phase2Access.enabled
      ? access.phase2Access.dateRanges.find(
          (r) => dateApplied >= r.startDate && dateApplied <= r.endDate
        )
      : undefined;

    if (p1Match) {
      isDateWithinActiveRange = true;
      matchedPhaseNumber = 1;
      matchedDateRangeId = p1Match.id;
      matchedDateRangeLabel = p1Match.label;
    } else if (p2Match) {
      isDateWithinActiveRange = true;
      matchedPhaseNumber = 2;
      matchedDateRangeId = p2Match.id;
      matchedDateRangeLabel = p2Match.label;
    }
  }

  // BR-14, BR-15, BR-45 & Confirmed Decision DSN-TBD-04:
  // - In-range submission -> 'Waiting Confirmation' (received for processing, NOT approved per BR-15)
  // - Out-of-range past/present date -> 'Rejected' automatically (BR-14, BR-45, DSN-TBD-04)
  const initialValidationStatus: ValidationStatus = isDateWithinActiveRange
    ? 'Waiting Confirmation'
    : 'Rejected';

  const autoRejectionReason = !isDateWithinActiveRange && dateApplied
    ? `Tanggal melamar (${dateApplied}) berada di luar rentang tanggal aktif batch (${matchedDateRangeLabel}). Sesuai aturan BR-14 & BR-45 (DSN-TBD-04), pengajuan di luar periode otomatis berstatus Rejected.`
    : undefined;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    isDateWithinActiveRange,
    matchedPhaseNumber,
    matchedDateRangeId,
    matchedDateRangeLabel,
    initialValidationStatus,
    autoRejectionReason,
  };
}


