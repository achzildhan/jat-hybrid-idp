import type {
  SemanticComparator,
  SemanticComparisonInput,
  SemanticComparisonResult,
} from './idpValidationTypes';
import { computeLexicalSimilarity } from './lexicalSimilarity';

/**
 * EP-JAT-06 (BLG-JAT-021, BR-26, BR-27, BR-37):
 * Mock Semantic Comparator Adapter for Hybrid IDP Validation.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - No production LLM provider (ChatGPT, Gemini, etc.) is currently approved or configured.
 * - This adapter NEVER simulates an LLM and claims it as actual AI production output.
 * - Explicitly labeled with:
 *     provider: 'Mock / Simulated Semantic Comparator (EP-JAT-06)'
 *     isMock: true
 *     executionStatus: 'BLOCKED_PENDING_DECISION'
 * - Real LLM integration is blocked pending stakeholder decision (DEC-06).
 * - BR-26: LLM outputs cannot override deterministic rules on files, dates, or data integrity.
 */
export class MockSemanticComparatorAdapter implements SemanticComparator {
  public readonly providerName =
    'Mock / Simulated Semantic Comparator (EP-JAT-06)';
  public readonly isConfigured = false; // Blocked pending LLM provider approval (DEC-06)

  public async compareSemantics(
    input: SemanticComparisonInput
  ): Promise<SemanticComparisonResult> {
    const { submitted, extraction } = input;
    const extractedAttrs = extraction.extractedAttributes;

    // Simulate provider failure if configured in synthetic fixture
    if (submitted.evidenceFileName.includes('timeout-provider')) {
      throw new Error(
        'Layanan Semantic LLM gagal dihubungi: koneksi timeout (Simulasi Provider Failure).'
      );
    }

    // Simulate malformed output if configured
    if (submitted.evidenceFileName.includes('malformed-semantic')) {
      return {
        // @ts-expect-error Simulating malformed schema from model
        roleSemanticSimilarity: 'invalid-string-instead-of-number',
        companySemanticMatch: false,
        jobLevelExperienceAlignment: { aligned: false },
        semanticNotes: ['Malformed schema simulation'],
        metadata: {
          provider: this.providerName,
          isMock: true,
          executionStatus: 'BLOCKED_PENDING_DECISION',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Role semantic comparison
    const submittedRole = submitted.role || '';
    const extractedRole = extractedAttrs?.role.value || '';
    let roleSim = computeLexicalSimilarity(submittedRole, extractedRole);

    // Contextual semantic equivalences (e.g. Frontend Engineer <-> Frontend Developer)
    const sRoleLow = submittedRole.toLowerCase();
    const eRoleLow = extractedRole.toLowerCase();
    if (
      (sRoleLow.includes('frontend') && eRoleLow.includes('frontend')) ||
      (sRoleLow.includes('product manager') &&
        eRoleLow.includes('product marketing manager'))
    ) {
      roleSim = Math.max(roleSim, 0.85);
    }

    // Company semantic match
    const submittedCompany = submitted.company || '';
    const extractedCompany = extractedAttrs?.company.value || '';
    const companySim = computeLexicalSimilarity(
      submittedCompany,
      extractedCompany
    );
    // BR-40: Strict >70% lexical similarity threshold
    const companyMatch = companySim > 0.7;

    // Job level vs experience alignment
    const extractedExp =
      extractedAttrs?.yearsOfExperience.value?.toLowerCase() || '';
    let isAligned = true;
    let expReason: string | undefined;

    if (
      (submitted.jobLevel === 'Junior Level' ||
        submitted.jobLevel === 'Internship') &&
      (/(\b[5-9]\b|\b1[0-9]\b)\+?\s*(?:tahun|thn|years)/.test(extractedExp) ||
        /senior|lead|expert/.test(extractedExp))
    ) {
      isAligned = false;
      expReason = `Tingkat ${submitted.jobLevel} kontradiktif dengan syarat pengalaman bukti (${extractedExp}).`;
    }

    return {
      roleSemanticSimilarity: roleSim,
      companySemanticMatch: companyMatch,
      jobLevelExperienceAlignment: {
        aligned: isAligned,
        reason: expReason,
      },
      semanticNotes: [
        `Evaluasi semantik role: ${(roleSim * 100).toFixed(0)}% kecocokan kontekstual.`,
        `Evaluasi entitas perusahaan: ${companyMatch ? 'Cocok' : 'Tidak cocok'}.`,
        isAligned
          ? 'Level pekerjaan dan pengalaman selaras.'
          : (expReason ?? 'Level pekerjaan dan pengalaman tidak selaras.'),
      ],
      metadata: {
        provider: this.providerName,
        modelOrVersion: 'Semantic Heuristic Mock v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const defaultSemanticComparator = new MockSemanticComparatorAdapter();
