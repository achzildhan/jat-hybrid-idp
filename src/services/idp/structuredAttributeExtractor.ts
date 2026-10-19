import type { JobLevel, PositionType, WorkSystem } from '../../types/jat';
import type {
  ExtractedAttributeField,
  ExtractedJobAttributes,
  OcrRawResult,
} from './idpExtractionTypes';
import { normalizeOcrText } from './textNormalizer';

/**
 * EP-JAT-05 (BLG-JAT-018, BR-18, BR-39, BR-41):
 * Converts raw OCR text and blocks into structured job attributes.
 *
 * CRITICAL RULE:
 * - Evidence-backed attributes only.
 * - If evidence does NOT support a value, value is strictly null, and isMissingOrUnknown is true.
 * - NEVER guess, hallucinate, or fill in missing information without evidence support (BR-18).
 * - Provenance (the exact text snippet from evidence) is attached where available.
 */
export function extractStructuredJobAttributes(
  ocrResult: OcrRawResult
): ExtractedJobAttributes {
  const normalized = normalizeOcrText(ocrResult.rawText);
  const lines = normalized.lines;

  return {
    company: extractCompany(lines),
    role: extractRole(lines),
    position: extractPosition(lines),
    jobLevel: extractJobLevel(lines),
    yearsOfExperience: extractYearsOfExperience(lines),
    location: extractLocation(lines),
    workSystem: extractWorkSystem(lines),
    vacancyUrl: extractVacancyUrl(normalized.extractedUrls),
    dateApplied: extractDateApplied(normalized.extractedIsoDates, lines),
    vacancyClosedDetected: normalized.vacancyClosedDetected,
    vacancyClosedPhrasesFound: normalized.vacancyClosedPhrasesFound,
  };
}

function createMissingField<T>(): ExtractedAttributeField<T> {
  return {
    value: null,
    confidence: 0,
    isMissingOrUnknown: true,
    extractionNote: 'Nilai tidak tercantum pada bukti lamaran (BR-18).',
  };
}

function extractCompany(lines: string[]): ExtractedAttributeField<string> {
  // Pass 1: Explicit labels (highest precision)
  for (const line of lines) {
    const labelMatch = line.match(/(?:perusahaan|company|employer)\s*:\s*(.+)/i);
    if (labelMatch && labelMatch[1].trim()) {
      return {
        value: labelMatch[1].trim(),
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }

  // Pass 2: Indonesian companies starting with PT / CV
  for (const line of lines) {
    if (/\b(?:PT|CV)\s+[A-Za-z0-9\s.,-]+/i.test(line)) {
      const ptMatch = line.match(/\b(?:PT|CV)\s+[A-Za-z0-9\s.,-]+/i);
      if (ptMatch) {
        return {
          value: ptMatch[0].trim(),
          confidence: 0.9,
          provenanceText: line,
          isMissingOrUnknown: false,
        };
      }
    }
  }

  // Pass 3: Known brand mentions in evidence
  for (const line of lines) {
    if (/shopee/i.test(line)) {
      return {
        value: 'Shopee',
        confidence: 0.92,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/tokopedia/i.test(line)) {
      return {
        value: 'Tokopedia',
        confidence: 0.92,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/gojek/i.test(line)) {
      return {
        value: 'Gojek',
        confidence: 0.92,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }

  return createMissingField<string>();
}

function extractRole(lines: string[]): ExtractedAttributeField<string> {
  // Pass 1: Explicit labels (highest precision)
  for (const line of lines) {
    const labelMatch = line.match(
      /(?:posisi|role|job title|jabatan|application submitted)\s*:\s*(.+)/i
    );
    if (labelMatch && labelMatch[1].trim()) {
      return {
        value: labelMatch[1].trim(),
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }

  // Pass 2: Recognized job title keywords
  for (const line of lines) {
    if (/frontend engineer/i.test(line)) {
      return {
        value: 'Frontend Engineer',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/software engineer/i.test(line)) {
      return {
        value: 'Software Engineer',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/product designer/i.test(line)) {
      return {
        value: 'Product Designer',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/data analyst/i.test(line)) {
      return {
        value: 'Data Analyst',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/product manager/i.test(line)) {
      return {
        value: 'Product Manager',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }

  return createMissingField<string>();
}

function extractPosition(lines: string[]): ExtractedAttributeField<PositionType> {
  for (const line of lines) {
    if (/\bfull[- ]?time\b/i.test(line)) {
      return {
        value: 'Full-time',
        confidence: 0.96,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\bcontract\b/i.test(line) || /\bkontrak\b/i.test(line)) {
      return {
        value: 'Contract',
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\binternship\b/i.test(line) || /\bmagang\b/i.test(line)) {
      return {
        value: 'Internship',
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\bfreelance\b/i.test(line)) {
      return {
        value: 'Freelance',
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }
  return createMissingField<PositionType>();
}

function extractJobLevel(lines: string[]): ExtractedAttributeField<JobLevel> {
  for (const line of lines) {
    if (/entry level|junior/i.test(line)) {
      return {
        value: 'Junior Level',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\bmid[- ]?level\b/i.test(line)) {
      return {
        value: 'Mid Level',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\bsenior\b/i.test(line)) {
      return {
        value: 'Senior Level',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\blead\b|manager/i.test(line)) {
      return {
        value: 'Lead / Managerial',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\binternship\b|magang/i.test(line)) {
      return {
        value: 'Internship',
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }
  return createMissingField<JobLevel>();
}

function extractYearsOfExperience(lines: string[]): ExtractedAttributeField<string> {
  for (const line of lines) {
    const labelMatch = line.match(
      /(?:pengalaman(?:\s+kerja)?|experience|years of experience)\s*:\s*(.+)/i
    );
    if (labelMatch && labelMatch[1].trim()) {
      return {
        value: labelMatch[1].trim(),
        confidence: 0.92,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    const expRegex = /(\d+[-–]\d+\s*(?:tahun|thn|years)|(?:\d+\+?\s*(?:tahun|thn|years)))/i;
    const m = line.match(expRegex);
    if (m) {
      return {
        value: m[0].trim(),
        confidence: 0.88,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }
  return createMissingField<string>();
}

function extractLocation(lines: string[]): ExtractedAttributeField<string> {
  for (const line of lines) {
    const labelMatch = line.match(/(?:lokasi|location)\s*:\s*(.+)/i);
    if (labelMatch && labelMatch[1].trim()) {
      return {
        value: labelMatch[1].trim(),
        confidence: 0.94,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/jakarta/i.test(line)) {
      return {
        value: 'Jakarta',
        confidence: 0.9,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/bandung/i.test(line)) {
      return {
        value: 'Bandung',
        confidence: 0.9,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/surabaya/i.test(line)) {
      return {
        value: 'Surabaya',
        confidence: 0.9,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }
  return createMissingField<string>();
}

function extractWorkSystem(lines: string[]): ExtractedAttributeField<WorkSystem> {
  for (const line of lines) {
    if (/\bwfh\b|work from home|remote/i.test(line)) {
      return {
        value: 'Remote / WFH',
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\bwfo\b|work from office|on[- ]?site/i.test(line)) {
      return {
        value: 'Onsite',
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
    if (/\bhybrid\b/i.test(line)) {
      return {
        value: 'Hybrid',
        confidence: 0.95,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }
  return createMissingField<WorkSystem>();
}

function extractVacancyUrl(urls: string[]): ExtractedAttributeField<string> {
  if (urls.length > 0) {
    return {
      value: urls[0],
      confidence: 0.95,
      provenanceText: urls[0],
      isMissingOrUnknown: false,
    };
  }
  return createMissingField<string>();
}

function extractDateApplied(
  dates: string[],
  lines: string[]
): ExtractedAttributeField<string> {
  // First check if a line has explicit "Tanggal Melamar" or "Date Applied" label
  for (const line of lines) {
    const labelMatch = line.match(
      /(?:tanggal melamar|date applied|applied on)\s*:\s*(\d{4}-\d{2}-\d{2})/i
    );
    if (labelMatch) {
      return {
        value: labelMatch[1],
        confidence: 0.98,
        provenanceText: line,
        isMissingOrUnknown: false,
      };
    }
  }
  if (dates.length > 0) {
    return {
      value: dates[0],
      confidence: 0.9,
      provenanceText: dates[0],
      isMissingOrUnknown: false,
    };
  }
  return createMissingField<string>();
}
