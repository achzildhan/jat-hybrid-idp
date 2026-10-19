/**
 * EP-JAT-05 (BLG-JAT-018, BR-26, BR-34, BR-41):
 * Text normalizer and sanitizer for Hybrid IDP OCR outputs.
 *
 * Adheres strictly to:
 * - BR-34: Treat files and extracted text as untrusted input.
 * - Strip control characters and sanitize raw OCR artifacts.
 * - Detect vacancy-closed phrases per BR-41.
 */

export interface NormalizedTextOutput {
  sanitizedFullText: string;
  lines: string[];
  vacancyClosedDetected: boolean;
  vacancyClosedPhrasesFound: string[];
  extractedUrls: string[];
  extractedIsoDates: string[];
}

const BR41_VACANCY_CLOSED_PATTERNS = [
  /lowongan ditutup/i,
  /this job is closed/i,
  /job is closed/i,
  /closed/i,
  /recruiter don'?t accept any applications yet/i,
  /tidak menerima lamaran/i,
  /pendaftaran telah berakhir/i,
  /no longer accepting applications/i,
  /application deadline passed/i,
];

/**
 * Sanitizes untrusted OCR string:
 * - Removes null bytes and dangerous control characters (keeps \n, \t).
 * - Standardizes line breaks to \n.
 * - Collapses consecutive horizontal whitespaces.
 */
export function sanitizeOcrText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\0/g, '') // strip null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip non-printable control characters
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

/**
 * Normalizes text and detects structured metadata patterns (URLs, dates, closed vacancy signals).
 */
export function normalizeOcrText(rawText: string): NormalizedTextOutput {
  const sanitized = sanitizeOcrText(rawText);
  const rawLines = sanitized.split('\n');
  const lines = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // BR-41: Vacancy Closed Detection
  const phrasesFound: string[] = [];
  for (const pattern of BR41_VACANCY_CLOSED_PATTERNS) {
    const match = sanitized.match(pattern);
    if (match) {
      phrasesFound.push(match[0]);
    }
  }

  // Extract URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls: string[] = [];
  let uMatch: RegExpExecArray | null;
  while ((uMatch = urlRegex.exec(sanitized)) !== null) {
    urls.push(uMatch[1]);
  }

  // Extract Dates (ISO YYYY-MM-DD or DD Month YYYY)
  const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;
  const dates: string[] = [];
  let dMatch: RegExpExecArray | null;
  while ((dMatch = dateRegex.exec(sanitized)) !== null) {
    dates.push(dMatch[1]);
  }

  return {
    sanitizedFullText: sanitized,
    lines,
    vacancyClosedDetected: phrasesFound.length > 0,
    vacancyClosedPhrasesFound: Array.from(new Set(phrasesFound)),
    extractedUrls: urls,
    extractedIsoDates: dates,
  };
}
