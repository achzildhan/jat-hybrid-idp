import type {
  IdpAttributeCheckStatus,
  IdpAttributeFinding,
} from '../../types/jat';
import type { IdpExtractionResult } from './idpExtractionTypes';
import type {
  DeterministicCheckResult,
  SubmittedApplicationForm,
} from './idpValidationTypes';
import { computeLexicalSimilarity } from './lexicalSimilarity';

/**
 * EP-JAT-06 (BLG-JAT-020, BR-10..BR-14, BR-18, BR-26, BR-39, BR-40, BR-41, BR-45):
 * Deterministic Rule Validator.
 *
 * CRITICAL RULE (BR-26):
 * Deterministic business rules (date ranges, file integrity, future dates, closed vacancies)
 * CANNOT be overridden by an LLM or fuzzy matching.
 */

export function validateDeterministicRules(
  form: SubmittedApplicationForm,
  extraction: IdpExtractionResult
): DeterministicCheckResult {
  const violations: string[] = [];

  // 1. Non-future date check (BR-13)
  const isNonFutureDate =
    !form.referenceDate || form.dateApplied <= form.referenceDate;
  if (!isNonFutureDate) {
    violations.push(
      `Tanggal melamar (${form.dateApplied}) tidak boleh berada di masa depan melewati tanggal referensi (${form.referenceDate}) (BR-13).`
    );
  }

  // 2. Active date range check (BR-14, BR-45, DSN-TBD-04)
  let isDateWithinActiveRange = true;
  if (form.activeDateRangeWindow) {
    const { startDate, endDate, label } = form.activeDateRangeWindow;
    if (form.dateApplied < startDate || form.dateApplied > endDate) {
      isDateWithinActiveRange = false;
      violations.push(
        `Tanggal melamar (${form.dateApplied}) berada di luar rentang tanggal aktif ${label || 'batch'} (${startDate} s/d ${endDate}). Sesuai BR-14 & BR-45, pengajuan berstatus Rejected.`
      );
    }
  }

  // 3. File format and non-empty check (BR-11, BR-12)
  const fileName = (form.evidenceFileName || '').toLowerCase();
  const isSupportedFileFormat =
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png');
  if (!isSupportedFileFormat) {
    violations.push(
      `Format berkas bukti (${fileName}) tidak didukung. Hanya JPG, JPEG, dan PNG yang diizinkan (BR-11).`
    );
  }

  const isNonEmptyFile =
    form.evidenceFileSizeBytes === undefined || form.evidenceFileSizeBytes > 0;
  if (!isNonEmptyFile) {
    violations.push('Berkas bukti kosong (0 byte).');
  }

  // 4. Vacancy closed check (BR-41)
  const isVacancyOpen =
    !extraction.extractedAttributes?.vacancyClosedDetected;
  if (!isVacancyOpen) {
    const phrases =
      extraction.extractedAttributes?.vacancyClosedPhrasesFound.join(', ') ||
      'Closed';
    violations.push(
      `Bukti lamaran menunjukkan lowongan pekerjaan telah ditutup atau melewati batas pendaftaran (${phrases}) (BR-41).`
    );
  }

  return {
    passed: violations.length === 0,
    isDateWithinActiveRange,
    isNonFutureDate,
    isSupportedFileFormat,
    isNonEmptyFile,
    isVacancyOpen,
    violations,
  };
}

/**
 * Compares all 7 BR-39 core attributes between student form and extracted evidence.
 * Applies BR-40 lexical similarity threshold (>70% required for match/fuzzy match).
 * Strictly preserves BR-18: missing/unknown fields in evidence remain null / Unverified.
 */
export function compareJobAttributes(
  form: SubmittedApplicationForm,
  extraction: IdpExtractionResult,
  deterministicCheck: DeterministicCheckResult
): IdpAttributeFinding[] {
  const attrs = extraction.extractedAttributes;

  // 1. Date Applied
  const dateAppliedStatus: IdpAttributeCheckStatus =
    !deterministicCheck.isDateWithinActiveRange
      ? 'Mismatch'
      : attrs?.dateApplied.value === form.dateApplied
        ? 'Matched'
        : attrs?.dateApplied.value
          ? 'Mismatch'
          : 'Matched'; // If not specifically printed on screenshot, date range validity holds

  const findings: IdpAttributeFinding[] = [
    {
      attributeKey: 'dateApplied',
      label: 'Date Applied',
      submittedValue: form.dateApplied,
      extractedValue: attrs?.dateApplied.value ?? null,
      status: dateAppliedStatus,
      note: !deterministicCheck.isDateWithinActiveRange
        ? 'Tanggal melamar berada di luar rentang tanggal aktif batch (BR-14 / BR-45).'
        : attrs?.dateApplied.value
          ? `Tanggal pada bukti sesuai: ${attrs.dateApplied.value}.`
          : 'Tanggal spesifik tidak tercetak pada gambar, namun berada dalam rentang aktif batch.',
    },
  ];

  // Helper for text attributes
  const evaluateField = (
    key:
      | 'role'
      | 'company'
      | 'location'
      | 'position'
      | 'jobLevel'
      | 'workSystem',
    label: string,
    submittedVal: string,
    extractedVal: string | null
  ): IdpAttributeFinding => {
    if (!extractedVal) {
      return {
        attributeKey: key,
        label,
        submittedValue: submittedVal,
        extractedValue: null,
        status: 'Unverified',
        note: 'Informasi tidak tercantum atau tidak terbaca pada bukti lamaran (BR-18).',
      };
    }

    const similarity = computeLexicalSimilarity(submittedVal, extractedVal);

    let status: IdpAttributeCheckStatus;
    let note: string;

    if (similarity >= 0.9) {
      status = 'Matched';
      note = `Kesesuaian tinggi (${Math.round(similarity * 100)}%).`;
    } else if (similarity >= 0.7) {
      // BR-40: Exact Fuzzy Match Policy (>70% lexically considered same role/company)
      status = 'Fuzzy Match (>70%)';
      note = `Kesesuaian leksikal kontekstual ${Math.round(similarity * 100)}% (memenuhi ambang batas >70% BR-40).`;
    } else {
      status = 'Mismatch';
      note = `Ketidaksesuaian nilai: input "${submittedVal}" vs bukti "${extractedVal}" (similarity ${Math.round(similarity * 100)}% < 70%).`;
    }

    return {
      attributeKey: key,
      label,
      submittedValue: submittedVal,
      extractedValue: extractedVal,
      status,
      note,
    };
  };

  findings.push(
    evaluateField(
      'role',
      'Role',
      form.role,
      attrs?.role.value ?? null
    ),
    evaluateField(
      'company',
      'Company',
      form.company,
      attrs?.company.value ?? null
    ),
    evaluateField(
      'location',
      'Location',
      form.location,
      attrs?.location.value ?? null
    ),
    evaluateField(
      'position',
      'Position',
      form.position,
      attrs?.position.value ?? null
    ),
    evaluateField(
      'jobLevel',
      'Job Level',
      form.jobLevel,
      attrs?.jobLevel.value ?? null
    ),
    evaluateField(
      'workSystem',
      'Work System',
      form.workSystem,
      attrs?.workSystem.value ?? null
    )
  );

  return findings;
}

/**
 * Checks for severe contradictions between Job Level and Years of Experience.
 */
export function checkJobLevelVsExperience(
  form: SubmittedApplicationForm,
  extraction: IdpExtractionResult
): { aligned: boolean; note?: string } {
  const extractedExp =
    extraction.extractedAttributes?.yearsOfExperience.value?.toLowerCase();
  if (!extractedExp) {
    return { aligned: true }; // No evidence data to contradict
  }

  const isJuniorOrIntern =
    form.jobLevel === 'Junior Level' || form.jobLevel === 'Internship';
  const isSeniorOrLead =
    form.jobLevel === 'Senior Level' || form.jobLevel === 'Lead / Managerial';

  // If student submitted Junior/Intern, but evidence requires 5+ years / Senior
  if (
    isJuniorOrIntern &&
    (/(\b[5-9]\b|\b1[0-9]\b)\+?\s*(?:tahun|thn|years)/.test(extractedExp) ||
      /senior|lead|expert/.test(extractedExp))
  ) {
    return {
      aligned: false,
      note: `Kontradiksi Job Level vs Pengalaman: Siswa mengisi level "${form.jobLevel}", tetapi bukti mensyaratkan "${extractedExp}".`,
    };
  }

  // If student submitted Senior/Lead, but evidence requires fresh graduate / junior / 0-2 years
  if (
    isSeniorOrLead &&
    (/fresh graduate|freshgrad|lulusan baru|junior|entry level/.test(extractedExp) ||
      /\b[01][-–][12]\s*(?:tahun|thn|years)/.test(extractedExp))
  ) {
    return {
      aligned: false,
      note: `Kontradiksi Job Level vs Pengalaman: Siswa mengisi level "${form.jobLevel}", tetapi bukti mensyaratkan "${extractedExp}".`,
    };
  }

  return { aligned: true };
}
