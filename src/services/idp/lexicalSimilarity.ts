/**
 * EP-JAT-06 (BLG-JAT-020, BR-40):
 * Lexical string similarity utilities for JAT Hybrid IDP attribute comparison.
 *
 * Implements BR-40:
 * "Nilai similarity menggunakan logika Fuzzy setidaknya harus >70% secara leksikal,
 * ketika ada kata-kata yang mirip seperti Product Manager dan Product Marketing Manager,
 * dapat dianggap sebagai satu role yang sama. Kriteria harus >70% similarity ini
 * harus diterapkan dalam atribut data Role, Company, Location, Position, dan Job Level."
 */

export function normalizeComparisonString(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/\b(?:pt|cv|tbk|inc|corp|ltd|llc|co)\b/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Token-level Dice coefficient combined with character bi-gram overlap.
 * Guaranteed to return a number between 0.0 and 1.0.
 */
export function computeLexicalSimilarity(a: string, b: string): number {
  const normA = normalizeComparisonString(a);
  const normB = normalizeComparisonString(b);

  if (!normA && !normB) return 1.0;
  if (!normA || !normB) return 0.0;
  if (normA === normB) return 1.0;

  // 1. Token-level Dice coefficient
  const tokensA = normA.split(' ').filter(Boolean);
  const tokensB = normB.split(' ').filter(Boolean);

  let commonTokens = 0;
  const bTokensCopy = [...tokensB];

  for (const tA of tokensA) {
    const idx = bTokensCopy.indexOf(tA);
    if (idx !== -1) {
      commonTokens++;
      bTokensCopy.splice(idx, 1);
    }
  }

  const tokenDice = (2 * commonTokens) / (tokensA.length + tokensB.length);

  // 2. Character Bi-gram similarity (Sørensen–Dice)
  const getBiGrams = (str: string): Map<string, number> => {
    const biGrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      biGrams.set(bg, (biGrams.get(bg) || 0) + 1);
    }
    return biGrams;
  };

  const bgA = getBiGrams(normA);
  const bgB = getBiGrams(normB);

  let intersection = 0;
  for (const [bg, countA] of bgA.entries()) {
    if (bgB.has(bg)) {
      intersection += Math.min(countA, bgB.get(bg)!);
    }
  }

  const totalBiGrams = Math.max(0, normA.length - 1) + Math.max(0, normB.length - 1);
  const biGramScore = totalBiGrams > 0 ? (2 * intersection) / totalBiGrams : 0;

  // Weighted combination: 60% token overlap + 40% character bi-gram
  const combined = tokenDice * 0.6 + biGramScore * 0.4;
  return Math.min(1.0, Math.max(0.0, Math.round(combined * 100) / 100));
}
