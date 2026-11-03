export const STORAGE_KEY = 'immunote.study.v1';
export function emptyState() {
  return { version: 1, activeBank: 'generated', answerOverrides: {}, customQuestions: [], records: {}, bookmarks: [], sessions: [], imports: [], updatedAt: null };
}
export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state: emptyState(), available: true };
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.customQuestions) || typeof data.records !== 'object' || !data.records || Array.isArray(data.records) || !Array.isArray(data.bookmarks) || (data.sessions !== undefined && !Array.isArray(data.sessions)) || (data.imports !== undefined && !Array.isArray(data.imports))) throw new Error('Invalid saved state');
    return { state: { ...emptyState(), ...data }, available: true };
  } catch {
    return { state: emptyState(), available: false };
  }
}
export function saveState(state, storage = globalThis.localStorage) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function recordAnswer(state, answer, now = new Date().toISOString()) {
  const previous = state.records[answer.questionId] || {};
  state.records[answer.questionId] = {
    attempts: (previous.attempts || 0) + 1,
    correctCount: (previous.correctCount || 0) + (answer.correct ? 1 : 0),
    lastCorrect: Boolean(answer.correct), lastSelected: answer.selected ?? null,
    lastAttempt: now, timeMs: (previous.timeMs || 0) + (answer.timeMs || 0)
  };
  return state;
}
export function summarize(questions, state) {
  let solved = 0, correct = 0, wrong = 0;
  for (const q of questions) {
    const record = state.records[q.id];
    if (record?.attempts) { solved++; record.lastCorrect ? correct++ : wrong++; }
  }
  return { total: questions.length, solved, correct, wrong, unsolved: questions.length - solved, rate: solved ? Math.round(correct / solved * 100) : null };
}
export function restoreBackup(data) {
  if (data?.app !== 'immunote' || data.version !== 1 || !data.state || data.state.version !== 1) throw new Error('면역노트 백업 파일이 아닙니다.');
  const s = data.state;
  if (!Array.isArray(s.customQuestions) || !Array.isArray(s.bookmarks) || !s.records || typeof s.records !== 'object' || Array.isArray(s.records) || (s.sessions !== undefined && !Array.isArray(s.sessions)) || (s.imports !== undefined && !Array.isArray(s.imports))) throw new Error('백업 데이터 구조를 확인해 주세요.');
  if (!(s.sessions || []).every(x => x && Array.isArray(x.categories) && Array.isArray(x.questionIds) && typeof x.at === 'string' && Number.isFinite(Date.parse(x.at)) && Number.isFinite(x.total) && Number.isFinite(x.correct))) throw new Error('백업의 학습 기록을 확인해 주세요.');
  return { ...emptyState(), ...s };
}
