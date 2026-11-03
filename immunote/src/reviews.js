import { ASSISTANT_REVIEWS } from '../data/review-notes.js';

export function attachAssistantReview(question, reviews = ASSISTANT_REVIEWS) {
  const review = reviews[question.id];
  if (question.bank !== 'past') return question;
  const explanation = (question.explanation || '').replace(/^족보 답안표 기준 정답:[^\n]*\n?/, '').trim();
  const original = review?.originalAnswers ?? question.originalAnswers ?? question.acceptedAnswers ?? (Number.isInteger(question.answer)?[question.answer]:[]);
  return { ...question, explanation, originalAnswers:[...original], ...(review ? {assistantReview:review} : {}) };
}
export function originalAnswerChoices(question) {
  const values = Array.isArray(question.originalAnswers) ? question.originalAnswers : Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [question.answer];
  return [...new Set(values.filter(n=>Number.isInteger(n)&&n>=1&&n<=question.options.length))].sort((a,b)=>a-b);
}
export function reviewLabel(status) {
  return {correction:'정답 오류 의심',ambiguous:'선지 해석 주의',historical:'당시 기준 참고','source-missing':'원문 확인 필요'}[status] || '추가 검토 의견';
}
