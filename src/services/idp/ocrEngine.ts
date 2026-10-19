import type {
  OcrEngine,
  OcrRawResult,
  PreparedImage,
} from './idpExtractionTypes';
import { SYNTHETIC_FIXTURES } from './syntheticExtractionFixtures';

/**
 * EP-JAT-05 (BLG-JAT-017, BR-37):
 * Mock OCR Engine Adapter for JAT Hybrid IDP Prototype.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - No production OCR provider (Tesseract, Google Cloud Vision, Azure AI, AWS Textract, etc.)
 *   is currently approved or configured in this project.
 * - This adapter NEVER simulates OCR and presents its output as actual OCR.
 * - It explicitly marks metadata with:
 *     provider: 'Mock / Simulated OCR Adapter (EP-JAT-05)'
 *     isMock: true
 *     executionStatus: 'BLOCKED_PENDING_DECISION'
 * - Real OCR integration is blocked pending stakeholder decision (DEC-05).
 */
export class MockOcrEngineAdapter implements OcrEngine {
  public readonly providerName = 'Mock / Simulated OCR Adapter (EP-JAT-05)';
  public readonly isConfigured = false; // Blocked pending approval of production OCR provider (DEC-05)

  public async processImage(prepared: PreparedImage): Promise<OcrRawResult> {
    const filename = prepared.fileName.toLowerCase();

    // 1. Check if corresponding fixture exists by fixture ID or filename matching
    for (const fixture of Object.values(SYNTHETIC_FIXTURES)) {
      if (
        fixture.input.fileName.toLowerCase() === filename ||
        (fixture.input.fixtureId &&
          filename.includes(fixture.input.fixtureId.toLowerCase()))
      ) {
        if (fixture.shouldFailOcrProvider) {
          throw new Error(
            'Layanan OCR tidak dapat dihubungi: koneksi timeout / error 500 (Simulasi Kegagalan Provider).'
          );
        }

        if (fixture.malformedOcrStructure) {
          // Return an object violating the required blocks array schema
          return {
            rawText: 'MALFORMED_OUTPUT',
            // @ts-expect-error simulating runtime malformed output from engine
            blocks: 'invalid-non-array-blocks',
            engineMetadata: {
              provider: this.providerName,
              modelOrVersion: 'Malformed Schema Simulation',
              isMock: true,
              executionStatus: 'BLOCKED_PENDING_DECISION',
              timestamp: new Date().toISOString(),
            },
          };
        }

        if (fixture.ocrOutput) {
          return structuredClone(fixture.ocrOutput);
        }
      }
    }

    // 2. Fallback for unmapped files: generate a minimal, clearly labeled synthetic baseline
    return {
      rawText: `Synthetic text extracted for ${prepared.fileName}`,
      blocks: [
        {
          text: `Synthetic text extracted for ${prepared.fileName}`,
          confidence: 0.8,
          lineIndex: 0,
        },
      ],
      detectedLanguage: 'id',
      engineMetadata: {
        provider: this.providerName,
        modelOrVersion: 'Prototype Fallback Adapter v1.0',
        isMock: true,
        executionStatus: 'BLOCKED_PENDING_DECISION',
        latencyMs: 50,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const defaultOcrEngine = new MockOcrEngineAdapter();
