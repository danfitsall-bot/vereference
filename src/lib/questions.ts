import { DEFAULT_QUESTIONS } from "./constants";

export function getQuestionsForCandidate(candidateName: string) {
  return DEFAULT_QUESTIONS.map((q, i) => ({
    ...q,
    text: q.text.replace("{candidate}", candidateName),
    sort_order: i,
  }));
}
