import { describe, expect, it } from 'vitest';
import {
  SYNTHETIC_FIXTURES,
  runIdpExtractionPipeline,
} from '../services/idp';
import {
  checkJobLevelVsExperience,
  compareJobAttributes,
  computeLexicalSimilarity,
  defaultSemanticComparator,
  evaluateValidationDecisionPolicy,
  normalizeComparisonString,
  validateApplicationEvidence,
  validateDeterministicRules,
} from '../services/idp';
import type {
  SemanticComparator,
  SubmittedApplicationForm,
} from '../services/idp';

describe('EP-JAT-06 — Hybrid IDP Validation (BLG-JAT-020, BLG-JAT-021, BLG-JAT-022)', () => {
  const BASE_VALID_SUBMISSION: SubmittedApplicationForm = {
    applicationId: 'app-test-1',
    batchId: 'jat-batch-1',
    studentId: 'stu-1',
    dateApplied: '2025-03-10',
    role: 'Frontend Engineer',
    company: 'PT Tech Nusantara Indonesia',
    location: 'Jakarta Selatan, Indonesia',
    position: 'Full-time',
    jobLevel: 'Junior Level',
    workSystem: 'Remote / WFH',
    yearsOfExperience: '1-2 tahun',
    vacancyUrl: 'https://jobs.technusantara.id/career/fe-junior-2025',
    evidenceFileName: 'bukti-lengkap-pt-tech-nusantara.png',
    evidenceFileSizeBytes: 245760,
    evidenceMimeType: 'image/png',
    referenceDate: '2025-03-10',
    activeDateRangeWindow: {
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      label: 'Date Range 1',
    },
  };

  describe('BLG-JAT-020: Lexical Similarity & Deterministic Rule Validation', () => {
    it('normalizes corporate prefixes and whitespace for fair comparisons', () => {
      expect(
        normalizeComparisonString('PT Tech Nusantara Indonesia, Tbk.')
      ).toBe('tech nusantara indonesia');
      expect(normalizeComparisonString('Shopee Inc.')).toBe('shopee');
    });

    it('implements BR-40 Exact Fuzzy Match Policy (>70% threshold for similar roles)', () => {
      // Product Manager vs Product Marketing Manager -> > 70%
      const sim = computeLexicalSimilarity(
        'Product Manager',
        'Product Marketing Manager'
      );
      expect(sim).toBeGreaterThanOrEqual(0.7);

      // Completely unrelated roles -> < 70%
      const unrelatedSim = computeLexicalSimilarity(
        'Frontend Engineer',
        'Finance Accountant'
      );
      expect(unrelatedSim).toBeLessThan(0.4);
    });

    it('rejects future dateApplied relative to referenceDate (BR-13)', async () => {
      const futureForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        dateApplied: '2025-03-25', // Future relative to referenceDate 2025-03-10
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const det = validateDeterministicRules(futureForm, extraction);

      expect(det.passed).toBe(false);
      expect(det.isNonFutureDate).toBe(false);
      expect(det.violations.some((v) => /masa depan/i.test(v))).toBe(true);

      const decision = await validateApplicationEvidence(futureForm, extraction);
      expect(decision.validationStatus).toBe('Rejected');
    });

    it('rejects out-of-range dateApplied per BR-14, BR-45 & DSN-TBD-04', async () => {
      const outOfRangeForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        dateApplied: '2025-02-15', // Before startDate 2025-03-01
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const det = validateDeterministicRules(outOfRangeForm, extraction);

      expect(det.passed).toBe(false);
      expect(det.isDateWithinActiveRange).toBe(false);

      const decision = await validateApplicationEvidence(
        outOfRangeForm,
        extraction
      );
      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.summaryReason).toMatch(/di luar rentang tanggal aktif/i);
    });

    it('rejects vacancy when evidence contains explicit closed signals (BR-41)', async () => {
      const closedForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        evidenceFileName: 'bukti-lowongan-ditutup.png',
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.VACANCY_CLOSED.input
      );
      const det = validateDeterministicRules(closedForm, extraction);

      expect(det.passed).toBe(false);
      expect(det.isVacancyOpen).toBe(false);
      expect(det.violations.some((v) => /telah ditutup/i.test(v))).toBe(true);

      const decision = await validateApplicationEvidence(closedForm, extraction);
      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.summaryReason).toMatch(/lowongan pekerjaan telah ditutup/i);
    });

    it('detects contradiction between Job Level and Years of Experience', () => {
      // Form claims Junior Level, but evidence states 5+ years / Senior
      const contradictionExtraction = {
        extractedAttributes: {
          yearsOfExperience: {
            value: '5+ tahun pengalaman',
            isMissingOrUnknown: false,
            confidence: 0.9,
          },
        },
      } as any;

      const check = checkJobLevelVsExperience(
        { ...BASE_VALID_SUBMISSION, jobLevel: 'Junior Level' },
        contradictionExtraction
      );
      expect(check.aligned).toBe(false);
      expect(check.note).toMatch(/kontradiksi job level vs pengalaman/i);
    });
  });

  describe('BLG-JAT-021: Semantic Validation Integration & Non-Override Safeguard (BR-26)', () => {
    it('provides assistive semantic comparison without claiming production LLM status (BR-27, BR-37)', async () => {
      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const result = await defaultSemanticComparator.compareSemantics({
        submitted: BASE_VALID_SUBMISSION,
        extraction,
      });

      expect(result.metadata.isMock).toBe(true);
      expect(result.metadata.executionStatus).toBe('BLOCKED_PENDING_DECISION');
      expect(result.roleSemanticSimilarity).toBeGreaterThanOrEqual(0.85);
      expect(result.companySemanticMatch).toBe(true);
    });

    it('safeguards deterministic rules from being overridden by semantic LLM output (BR-26)', async () => {
      // Create a rogue comparator that erroneously claims full 100% semantic match
      const rogueSemanticComparator: SemanticComparator = {
        providerName: 'Rogue Mock Model',
        isConfigured: true,
        compareSemantics: async () => ({
          roleSemanticSimilarity: 1.0,
          companySemanticMatch: true,
          jobLevelExperienceAlignment: { aligned: true },
          semanticNotes: ['Rogue comparator claims perfect match'],
          metadata: {
            provider: 'Rogue Mock Model',
            isMock: true,
            executionStatus: 'MOCK_FIXTURE',
            timestamp: new Date().toISOString(),
          },
        }),
      };

      // Form has a deterministic date-range violation
      const outOfRangeForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        dateApplied: '2025-02-10', // Out of range
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        outOfRangeForm,
        extraction,
        rogueSemanticComparator
      );

      // Must remain Rejected despite the semantic comparator claiming 100% match
      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.deterministicResult.passed).toBe(false);
    });

    it('safely handles semantic provider timeout or network failure without crashing', async () => {
      const timeoutForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        evidenceFileName: 'bukti-timeout-provider.png',
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        timeoutForm,
        extraction
      );

      // Pipeline does not throw; falls back safely to deterministic policy
      expect(decision).toBeDefined();
      expect(decision.validationStatus).toBe('Approved'); // Clear readable evidence still evaluated
      expect(decision.semanticResult).toBeUndefined();
    });

    it('safely handles malformed semantic output without crashing', async () => {
      const malformedForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        evidenceFileName: 'bukti-malformed-semantic.png',
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        malformedForm,
        extraction
      );

      // Pipeline guards against malformed output and completes successfully
      expect(decision).toBeDefined();
      expect(decision.validationStatus).toBe('Approved');
    });
  });

  describe('BLG-JAT-022: Validation Decision Policy & Varied Evidence Quality (BR-38)', () => {
    it('approves clear readable evidence with >= 90% compliance (BR-38 Approved)', async () => {
      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        BASE_VALID_SUBMISSION,
        extraction
      );

      expect(decision.validationStatus).toBe('Approved');
      expect(decision.overallComplianceScore).toBeGreaterThanOrEqual(90);
      expect(decision.requiresHumanReview).toBe(false);
      expect(decision.summaryReason).toMatch(/disetujui otomatis/i);
    });

    it('rejects when there is an explicit company mismatch', async () => {
      const mismatchCompanyForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        company: 'PT Bukalapak Mitra', // Evidence is PT Tech Nusantara Indonesia
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        mismatchCompanyForm,
        extraction
      );

      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.summaryReason).toMatch(/ketidaksesuaian jelas/i);
      const compFinding = decision.attributeFindings.find(
        (f) => f.attributeKey === 'company'
      );
      expect(compFinding?.status).toBe('Mismatch');
    });

    it('rejects when there is an explicit role title mismatch', async () => {
      const mismatchRoleForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        role: 'Senior Java Backend Architect', // Evidence is Frontend Engineer
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        mismatchRoleForm,
        extraction
      );

      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.summaryReason).toMatch(/ketidaksesuaian jelas/i);
      const roleFinding = decision.attributeFindings.find(
        (f) => f.attributeKey === 'role'
      );
      expect(roleFinding?.status).toBe('Mismatch');
    });

    it('routes blurry evidence to Waiting Confirmation (BR-38)', async () => {
      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.BLURRY_UNREADABLE.input
      );
      const decision = await validateApplicationEvidence(
        BASE_VALID_SUBMISSION,
        extraction
      );

      expect(decision.validationStatus).toBe('Waiting Confirmation');
      expect(decision.requiresHumanReview).toBe(true);
      expect(decision.humanReviewReason).toMatch(/buram/i);
    });

    it('rejects cropped evidence per BR-38', async () => {
      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CROPPED_PARTIAL.input
      );
      const decision = await validateApplicationEvidence(
        BASE_VALID_SUBMISSION,
        extraction
      );

      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.summaryReason).toMatch(/gambar bukti terpotong/i);
    });

    it('routes incomplete evidence to Waiting Confirmation without guessing missing fields (BR-18, BR-38)', async () => {
      const incompleteForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        company: 'Gojek Indonesia',
        role: 'Product Designer',
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.INCOMPLETE_PARTIAL.input
      );
      const decision = await validateApplicationEvidence(
        incompleteForm,
        extraction
      );

      // Incomplete evidence cannot be auto-approved
      expect(decision.validationStatus).toBe('Waiting Confirmation');
      expect(decision.requiresHumanReview).toBe(true);
      expect(decision.summaryReason).toMatch(/sebagian atribut wajib/i);

      // Missing attributes are Unverified/null (never fabricated, BR-18)
      const locFinding = decision.attributeFindings.find(
        (f) => f.attributeKey === 'location'
      );
      expect(locFinding?.extractedValue).toBeNull();
      expect(locFinding?.status).toBe('Unverified');
    });

    it('rejects irrelevant images (random landscape / meme) per BR-38', async () => {
      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.IRRELEVANT_IMAGE.input
      );
      const decision = await validateApplicationEvidence(
        BASE_VALID_SUBMISSION,
        extraction
      );

      expect(decision.validationStatus).toBe('Rejected');
      expect(decision.summaryReason).toMatch(/sama sekali tidak relevan/i);
    });

    it('routes Job Level vs Experience contradictions to Waiting Confirmation', async () => {
      // Evidence has 1-2 years experience; student submits as 'Lead / Managerial'
      const contradictionForm: SubmittedApplicationForm = {
        ...BASE_VALID_SUBMISSION,
        jobLevel: 'Lead / Managerial',
      };

      const extraction = await runIdpExtractionPipeline(
        SYNTHETIC_FIXTURES.CLEAR_READABLE.input
      );
      const decision = await validateApplicationEvidence(
        contradictionForm,
        extraction
      );

      expect(decision.validationStatus).toBe('Waiting Confirmation');
      expect(decision.requiresHumanReview).toBe(true);
      expect(decision.humanReviewReason).toMatch(/kontradiksi job level/i);
    });
  });
});
