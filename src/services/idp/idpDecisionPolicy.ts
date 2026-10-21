import type {
  IdpAttributeFinding,
  ValidationStatus,
} from '../../types/jat';
import type { IdpExtractionResult } from './idpExtractionTypes';
import type {
  DeterministicCheckResult,
  IdpValidationPolicyResult,
  SemanticComparisonResult,
  SubmittedApplicationForm,
} from './idpValidationTypes';

/**
 * EP-JAT-06 (BLG-JAT-020, BR-14, BR-18, BR-26, BR-38, BR-40, BR-41, BR-45):
 * IDP Decision Policy synthesizing deterministic checks, attribute findings,
 * evidence quality, and optional semantic comparison into final ValidationStatus.
 *
 * Precedence Order:
 * 1. Deterministic Rule Violations (Highest -> Always 'Rejected')
 * 2. Severe Evidence Degradation / Irrelevance (BR-38 -> 'Rejected')
 * 3. Ambiguous / Blurry / Incomplete Evidence (BR-38 -> 'Waiting Confirmation')
 * 4. High Confidence Full Match >= 90% (BR-38 -> 'Approved')
 * 5. Low Compliance < 60% (BR-38 -> 'Rejected')
 */
export function evaluateValidationDecisionPolicy(
  form: SubmittedApplicationForm,
  extraction: IdpExtractionResult,
  deterministic: DeterministicCheckResult,
  findings: IdpAttributeFinding[],
  jobLevelExpCheck: { aligned: boolean; note?: string },
  semanticResult?: SemanticComparisonResult
): IdpValidationPolicyResult {
  const evaluatedAt = new Date().toISOString();
  const quality = extraction.qualityAssessment;

  // 1. Calculate overall compliance score across the 7 BR-39 attributes
  let totalPoints = 0;
  for (const f of findings) {
    if (f.status === 'Matched') {
      totalPoints += 1.0;
    } else if (f.status === 'Fuzzy Match (>70%)') {
      totalPoints += 0.85;
    } else if (f.status === 'Ambiguous / Unclear') {
      totalPoints += 0.5;
    } else {
      totalPoints += 0.0;
    }
  }

  const overallComplianceScore = Math.min(
    100,
    Math.round((totalPoints / findings.length) * 100)
  );

  // -------------------------------------------------------------
  // TIER 1: Deterministic Rule Violations (BR-26: Never overridden by LLM)
  // -------------------------------------------------------------
  if (!deterministic.passed) {
    const summary = `Penolakan Otomatis (Aturan Deterministik): ${deterministic.violations.join('; ')}`;
    return {
      validationStatus: 'Rejected',
      overallComplianceScore,
      summaryReason: summary,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: false,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 2: Severe Evidence Defects (BR-34, BR-38: Unreadable/Corrupted, Irrelevant, Cropped)
  // -------------------------------------------------------------
  if (quality.grade === 'unreadable') {
    return {
      validationStatus: 'Rejected',
      overallComplianceScore: 0,
      summaryReason:
        'Penolakan Otomatis (BR-34): Berkas bukti tidak dapat dibaca atau memiliki tanda tangan biner tidak valid.',
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: false,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  if (quality.grade === 'irrelevant') {
    return {
      validationStatus: 'Rejected',
      overallComplianceScore: 0,
      summaryReason:
        'Penolakan Otomatis (BR-38): Berkas bukti sama sekali tidak relevan dengan lamaran kerja (gambar pemandangan/grafis acak).',
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: false,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  if (quality.grade === 'cropped') {
    return {
      validationStatus: 'Rejected',
      overallComplianceScore,
      summaryReason:
        'Penolakan Otomatis (BR-38): Gambar bukti terpotong sehingga tidak dapat memverifikasi atribut wajib lamaran.',
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: false,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 3: Blurry Evidence (BR-38: Blur goes to Human Review)
  // -------------------------------------------------------------
  if (quality.grade === 'blurry') {
    return {
      validationStatus: 'Waiting Confirmation',
      overallComplianceScore,
      summaryReason:
        'Menunggu Konfirmasi (BR-38): Gambar buram atau berkualitas rendah sehingga detail tidak dapat diverifikasi secara otomatis.',
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: true,
      humanReviewReason:
        'Kualitas gambar buram (motion blur / resolusi rendah).',
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 4: Explicit Mismatches on Core Attributes (Company or Role)
  // -------------------------------------------------------------
  const companyFinding = findings.find((f) => f.attributeKey === 'company');
  const roleFinding = findings.find((f) => f.attributeKey === 'role');

  if (
    companyFinding?.status === 'Mismatch' ||
    roleFinding?.status === 'Mismatch'
  ) {
    const mismatchNotes: string[] = [];
    if (companyFinding?.status === 'Mismatch')
      mismatchNotes.push(`Perusahaan (${companyFinding.note})`);
    if (roleFinding?.status === 'Mismatch')
      mismatchNotes.push(`Role (${roleFinding.note})`);

    return {
      validationStatus: 'Rejected',
      overallComplianceScore,
      summaryReason: `Penolakan Validasi: Terdapat ketidaksesuaian jelas pada atribut wajib: ${mismatchNotes.join(', ')}.`,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: false,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 5: Missing Core Attributes (Company or Role missing in evidence)
  // BR-18 & BR-38: Missing core fields route to Waiting Confirmation (not auto-rejected as mismatch)
  // -------------------------------------------------------------
  if (
    companyFinding?.status === 'Unverified' ||
    roleFinding?.status === 'Unverified'
  ) {
    const missingFields: string[] = [];
    if (companyFinding?.status === 'Unverified') missingFields.push('Perusahaan');
    if (roleFinding?.status === 'Unverified') missingFields.push('Role/Posisi');

    return {
      validationStatus: 'Waiting Confirmation',
      overallComplianceScore,
      summaryReason: `Menunggu Konfirmasi (BR-38): Atribut inti (${missingFields.join(', ')}) tidak terdeteksi pada bukti lamaran. Membutuhkan verifikasi human review.`,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: true,
      humanReviewReason: `Atribut inti (${missingFields.join(', ')}) tidak tercantum atau tidak terbaca pada screenshot bukti lamaran (BR-18).`,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 6: Job Level vs Experience Contradiction
  // -------------------------------------------------------------
  if (!jobLevelExpCheck.aligned) {
    return {
      validationStatus: 'Waiting Confirmation',
      overallComplianceScore,
      summaryReason: `Menunggu Konfirmasi: ${jobLevelExpCheck.note}. Memerlukan peninjauan manual oleh Talent Support.`,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: true,
      humanReviewReason: jobLevelExpCheck.note,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  const unverifiedCount = findings.filter(
    (f) => f.status === 'Unverified'
  ).length;

  if (quality.grade === 'incomplete' || unverifiedCount > 2) {
    return {
      validationStatus: 'Waiting Confirmation',
      overallComplianceScore,
      summaryReason: `Menunggu Konfirmasi (BR-38): Sebagian atribut wajib (${unverifiedCount} field) tidak tercantum pada bukti lamaran.`,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: true,
      humanReviewReason:
        'Bukti tidak lengkap: beberapa atribut wajib tidak dapat diverifikasi dari screenshot.',
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 6: High Compliance Approved Threshold (BR-38 >= 90%)
  // -------------------------------------------------------------
  if (overallComplianceScore >= 90) {
    return {
      validationStatus: 'Approved',
      overallComplianceScore,
      summaryReason: `Disetujui Otomatis (BR-38): Informasi bukti lamaran jelas dan tingkat kesesuaian atribut ${overallComplianceScore}% (memenuhi standar minimal 90%).`,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: false,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 7: Mid Compliance (60% - 89%) -> Waiting Confirmation
  // -------------------------------------------------------------
  if (overallComplianceScore >= 60) {
    return {
      validationStatus: 'Waiting Confirmation',
      overallComplianceScore,
      summaryReason: `Menunggu Konfirmasi (BR-38): Tingkat kesesuaian ${overallComplianceScore}% (antara 60% dan 89%). Membutuhkan verifikasi human review.`,
      deterministicResult: deterministic,
      attributeFindings: findings,
      evidenceQualityGrade: quality.grade,
      requiresHumanReview: true,
      humanReviewReason: `Kesesuaian parsial ${overallComplianceScore}% membutuhkan konfirmasi manual.`,
      validationSource: 'Simulated Rule Check (Mock)',
      semanticResult,
      evaluatedAt,
    };
  }

  // -------------------------------------------------------------
  // TIER 8: Low Compliance (< 60%) -> Rejected
  // -------------------------------------------------------------
  return {
    validationStatus: 'Rejected',
    overallComplianceScore,
    summaryReason: `Penolakan Validasi (BR-38): Tingkat kesesuaian bukti dengan isian formulir sangat rendah (${overallComplianceScore}% < 60%).`,
    deterministicResult: deterministic,
    attributeFindings: findings,
    evidenceQualityGrade: quality.grade,
    requiresHumanReview: false,
    validationSource: 'Simulated Rule Check (Mock)',
    semanticResult,
    evaluatedAt,
  };
}
