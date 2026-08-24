/**
 * Text Normalization and Similarity Comparator (Arabic & English)
 */

export function normalizeText(text: string): string {
  if (!text) return '';

  let normalized = text
    // Remove Arabic Tashkeel (diacritics)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // Normalize Alef variations
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alef Maksura
    .replace(/ى/g, 'ي')
    // Normalize Persian/Urdu Kaf & Yaa
    .replace(/ك/g, 'ك')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Lowercase English
    .toLowerCase()
    // Replace punctuation with space
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»،؛؟\\[\]]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

export function extractTokens(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(' ').filter((w) => w.length > 1);
}

export interface ComparisonAnalysis {
  similarityScore: number; // 0 - 100
  matchVerdict: 'full_match' | 'partial_match' | 'no_match';
  matchedKeywords: string[];
  missingKeywords: string[];
  exactMatch: boolean;
}

export function compareQuestionWithAnswer(question: string, answer: string): ComparisonAnalysis {
  const qNorm = normalizeText(question);
  const aNorm = normalizeText(answer);

  if (!qNorm || !aNorm) {
    return {
      similarityScore: 0,
      matchVerdict: 'no_match',
      matchedKeywords: [],
      missingKeywords: extractTokens(question),
      exactMatch: false,
    };
  }

  // Exact match check
  if (qNorm === aNorm) {
    const tokens = extractTokens(question);
    return {
      similarityScore: 100,
      matchVerdict: 'full_match',
      matchedKeywords: tokens,
      missingKeywords: [],
      exactMatch: true,
    };
  }

  // Substring inclusion check
  if (aNorm.includes(qNorm)) {
    const tokens = extractTokens(question);
    return {
      similarityScore: 95,
      matchVerdict: 'full_match',
      matchedKeywords: tokens,
      missingKeywords: [],
      exactMatch: false,
    };
  }

  if (qNorm.includes(aNorm) && aNorm.length > 5) {
    const tokens = extractTokens(answer);
    return {
      similarityScore: 90,
      matchVerdict: 'full_match',
      matchedKeywords: tokens,
      missingKeywords: [],
      exactMatch: false,
    };
  }

  // Token based Jaccard and Overlap Analysis
  const qTokens = extractTokens(question);
  const aTokens = extractTokens(answer);
  const aTokenSet = new Set(aTokens);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const qWord of qTokens) {
    // Check direct equality or substring in answer tokens
    const found = aTokenSet.has(qWord) || aTokens.some((aWord) => aWord.includes(qWord) || qWord.includes(aWord));
    if (found) {
      matchedKeywords.push(qWord);
    } else {
      missingKeywords.push(qWord);
    }
  }

  // Levenshtein ratio approximation on words
  const totalTokens = Math.max(qTokens.length, 1);
  const overlapRatio = matchedKeywords.length / totalTokens;

  // Jaccard index
  const unionSet = new Set([...qTokens, ...aTokens]);
  const jaccardScore = unionSet.size > 0 ? (matchedKeywords.length / unionSet.size) : 0;

  // Combined weighted score
  const score = Math.min(100, Math.round((overlapRatio * 0.75 + jaccardScore * 0.25) * 100));

  let matchVerdict: 'full_match' | 'partial_match' | 'no_match' = 'no_match';
  if (score >= 80) {
    matchVerdict = 'full_match';
  } else if (score >= 30) {
    matchVerdict = 'partial_match';
  } else {
    matchVerdict = 'no_match';
  }

  return {
    similarityScore: score,
    matchVerdict,
    matchedKeywords: Array.from(new Set(matchedKeywords)),
    missingKeywords: Array.from(new Set(missingKeywords)),
    exactMatch: false,
  };
}
