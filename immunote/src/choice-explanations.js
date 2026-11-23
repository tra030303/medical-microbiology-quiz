import { CHOICE_NOTES } from './exam-data.js';

// Deliberately omit answer/acceptedAnswers: a personal key override must not
// detach factual notes. A changed stem, option order or bank must detach them.
export function questionSignature(question) {
  const value = JSON.stringify([question.bank || 'generated', question.stem, question.options]);
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const CIRCLED = '①②③④⑤⑥⑦⑧';

/** Keep the original prose intact. Extract only explicit, numbered discussion. */
export function splitChoiceExplanation(question) {
  const text = question.explanation || '';
  const matches = [...text.matchAll(/[①②③④⑤⑥⑦⑧]/g)];
  const choices = Array.from({ length: question.options.length }, () => []);
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i], number = CIRCLED.indexOf(match[0]);
    if (number >= choices.length) continue;
    const before = text.slice(Math.max(0, match.index - 7), match.index);
    // "정답은 ③이다" belongs to the common introduction. It is not a
    // separate account of the reason that choice is correct.
    if (/정답(?:은|:)?\s*$/.test(before)) continue;
    let part = text.slice(match.index + 1, matches[i + 1]?.index ?? text.length).trim();
    if (/^[·ㆍ,~–—\-]/.test(part)) continue; // grouped choices; retain common prose
    part = part.replace(/^(?:은|는|이|가|의|에서|처럼|을|를)(?=\s)/, '').trim();
    if (part.length >= 8) choices[number].push(part);
  }
  return choices.map(parts => [...new Set(parts)].join('\n'));
}

export function getChoiceDetails(question, notes = CHOICE_NOTES) {
  const note = notes[question.id];
  if (note && note.signature === questionSignature(question) && Array.isArray(note.choices) && note.choices.length === question.options.length) {
    return { ...note, kind: 'authored', choices: note.choices.map((choice, i) => ({
      ...choice,
      text: choice.text || question.options[i],
      source: choice.source || note.source || '',
      sourceScope: choice.sourceScope || note.sourceScope || 'question',
      lecturePending: choice.lecturePending ?? note.lecturePending ?? false,
    })) };
  }
  if (question.bank === 'past') return null;
  const parts = splitChoiceExplanation(question);
  if (!parts.some(Boolean)) return null;
  // Some original explanations discuss the correct choice in their opening
  // paragraph without repeating its number. Use that paragraph explicitly.
  const introduction = (question.explanation || '').split(/\n\s*\n|\n(?=[①②③④⑤])/)[0];
  const answer = Number(question.answer) - 1;
  if (!parts[answer] && introduction?.length > 15) parts[answer] = introduction;
  return {
    kind: 'existing',
    choices: parts.map((explanation, i) => ({ text: question.options[i], explanation, source: question.source || '', sourceScope: 'question' })),
  };
}
