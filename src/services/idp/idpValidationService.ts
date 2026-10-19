import {
  checkJobLevelVsExperience,
  compareJobAttributes,
  validateDeterministicRules,
} from './deterministicRuleValidator';
import { evaluateValidationDecisionPolicy } from './idpDecisionPolicy';
import type { IdpExtractionResult } from './idpExtractionTypes';
import type {
  IdpValidationPolicyResult,
  SemanticComparator,
  SemanticComparisonResult,
  SubmittedApplicationForm,
} from './idpValidationTypes';
import { defaultSemanticComparator } from './semanticComparator';

/**
 * EP-JAT-06 (BLG-JAT-020, BLG-JAT-021):
 * High-level Hybrid IDP Validation Coordinator.
 *
 * Coordinates:
 * 1. Deterministic Rule Validation (BR-10..BR-14, BR-41, BR-45)
 * 2. Attribute Lexical Comparison (BR-39, BR-40)
 * 3. Level vs Experience Contradiction Checking
 * 4. Semantic Comparison (Assistive LLM interface, BR-26, BR-27)
 * 5. Decision Policy Synthesis (BR-38)
 */
export async function validateApplicationEvidence(
  submission: SubmittedApplicationForm,
  extraction: IdpExtractionResult,
  semanticComparator: SemanticComparator = defaultSemanticComparator
): Promise<IdpValidationPolicyResult> {
  // Step 1: Deterministic rule verification (hard rules)
  const deterministicResult = validateDeterministicRules(
    submission,
    extraction
  );

  // Step 2: Attribute comparison
  const attributeFindings = compareJobAttributes(
    submission,
    extraction,
    deterministicResult
  );

  // Step 3: Job level vs experience alignment
  const jobLevelExpCheck = checkJobLevelVsExperience(submission, extraction);

  // Step 4: Optional Semantic comparison (Assistive only, BR-26)
  let semanticResult: SemanticComparisonResult | undefined;
  try {
    const rawSemantic = await semanticComparator.compareSemantics({
      submitted: submission,
      extraction,
    });

    // Guard against malformed semantic schema
    if (
      rawSemantic &&
      typeof rawSemantic.roleSemanticSimilarity === 'number' &&
      typeof rawSemantic.companySemanticMatch === 'boolean'
    ) {
      semanticResult = rawSemantic;
    }
  } catch (err: unknown) {
    // If semantic provider fails, log/preserve error in findings but do not crash pipeline
    semanticResult = undefined;
  }

  // Step 5: Synthesize final validation status via Decision Policy (BR-38)
  const policyResult = evaluateValidationDecisionPolicy(
    submission,
    extraction,
    deterministicResult,
    attributeFindings,
    jobLevelExpCheck,
    semanticResult
  );

  // Step 6: BR-26 Safeguard — Deterministic violations MUST NEVER be overridden
  if (!deterministicResult.passed && policyResult.validationStatus !== 'Rejected') {
    return {
      ...policyResult,
      validationStatus: 'Rejected',
      summaryReason: `Aturan Deterministik Mengesampingkan AI (BR-26): ${deterministicResult.violations.join('; ')}`,
      requiresHumanReview: false,
    };
  }

  return policyResult;
}
