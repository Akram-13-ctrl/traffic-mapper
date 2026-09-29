import { ROAD_SAFETY_QNA, ROAD_SAFETY_CATEGORIES } from "./roadSafetyQnA.js";
import type { SafetyQnAItem } from "./roadSafetyQnA.js";
import { ROAD_SAFETY_QNA_PART2 } from "./roadSafetyQnA2.js";
import { ROAD_SAFETY_QNA_PART3 } from "./roadSafetyQnA3.js";
import { ROAD_SAFETY_QNA_PART4 } from "./roadSafetyQnA4.js";

export { ROAD_SAFETY_CATEGORIES };
export type { SafetyQnAItem };

export const ALL_ROAD_SAFETY_QNA: SafetyQnAItem[] = [
  ...ROAD_SAFETY_QNA,
  ...ROAD_SAFETY_QNA_PART2,
  ...ROAD_SAFETY_QNA_PART3,
  ...ROAD_SAFETY_QNA_PART4,
];

/**
 * High-precision matcher that finds the best matching question & answer
 * based on exact questions, keywords, and semantic tokens.
 */
export function findSafetyAnswer(query: string): SafetyQnAItem | null {
  if (!query || typeof query !== "string") return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct or near-direct question match
  for (const item of ALL_ROAD_SAFETY_QNA) {
    const qLower = item.question.toLowerCase();
    if (clean === qLower || clean.includes(qLower) || qLower.includes(clean)) {
      return item;
    }
  }

  // 2. Keyword exact match
  for (const item of ALL_ROAD_SAFETY_QNA) {
    for (const kw of item.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        return item;
      }
    }
  }

  // 3. Multi-token scoring match
  const userTokens = clean
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (userTokens.length === 0) return null;

  let bestMatch: SafetyQnAItem | null = null;
  let highestScore = 0;

  for (const item of ALL_ROAD_SAFETY_QNA) {
    let score = 0;
    const targetText = (item.question + " " + item.keywords.join(" ")).toLowerCase();

    for (const token of userTokens) {
      if (targetText.includes(token)) {
        score += 2;
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}
