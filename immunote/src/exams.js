export const EXAMS = [
  { id: 1, label: '1차', storageKey: 'immunote.study.v1' },
  { id: 2, label: '2차', storageKey: 'immunote.study.exam2.v1' },
];

export function examFromUrl(href) {
  return new URL(href, 'https://immunote.local/').searchParams.get('exam') === '2' ? 2 : 1;
}

export const ACTIVE_EXAM = examFromUrl(globalThis.location?.href || '/');

export function examStorageKey(exam = 1) {
  const selected = EXAMS.find(item => item.id === exam);
  if (!selected) throw new Error('시험은 1차 또는 2차를 선택해 주세요.');
  return selected.storageKey;
}

export function examUrl(exam, href = globalThis.location?.href || '/') {
  examStorageKey(exam);
  const url = new URL(href, 'https://immunote.local/');
  if (exam === 2) url.searchParams.set('exam', '2');
  else url.searchParams.delete('exam');
  url.hash = '/home';
  return url.pathname + url.search + url.hash;
}
