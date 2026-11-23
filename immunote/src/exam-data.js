import { ACTIVE_EXAM } from './exams.js';

// A full navigation between exams gives every module the same immutable scope.
// Keep the original first-exam files and IDs untouched for existing study data.
export async function loadExamData(exam = ACTIVE_EXAM) {
  if (![1, 2].includes(exam)) throw new Error('시험은 1차 또는 2차를 선택해 주세요.');
  return exam === 2
  ? await import('../data/exam-2/index.js')
  : Object.assign({}, ...await Promise.all([
      import('../data/past-questions.js'),
      import('../data/questions.js'),
      import('../data/chat-questions.js'),
      import('../data/categories.js'),
      import('../data/cbl-index.js'),
      import('../data/cbl-guides.js'),
      import('../data/ox-index.js'),
      import('../data/review-notes.js'),
      import('../data/choice-notes.js'),
    ]));
}
const data = await loadExamData();

export const {
  PAST_QUESTIONS, SEED_QUESTIONS, CHAT_QUESTIONS, CATEGORIES,
  CBL_MODULES, CBL_CASE_INDEX, CBL_QUESTION_GUIDES, CBL_CASES, OX_LECTURES, OX_TOTAL,
  ASSISTANT_REVIEWS, CHOICE_NOTES,
} = data;
