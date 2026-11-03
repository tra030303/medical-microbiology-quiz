export function getBank(question) {
  return question?.bank === 'past' ? 'past' : 'generated';
}
export function selectBankQuestions(questions, bank) {
  if (!['past', 'generated'].includes(bank)) throw new Error('문제은행을 먼저 선택해 주세요.');
  return questions.filter(q => getBank(q) === bank);
}
export function isGradable(question) {
  return Array.isArray(question?.options) && Number.isInteger(question.answer) && question.answer >= 1 && question.answer <= question.options.length;
}
export function prepareBankSession(questions, {bank, count = 'all', shuffle = false, random = Math.random} = {}) {
  const selected = selectBankQuestions(questions, bank).filter(isGradable);
  if (shuffle) {
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.min(.999999999, Math.max(0, random())) * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
  }
  return selected.slice(0, count === 'all' ? selected.length : Math.max(0, Number(count) || 0));
}
