/** Question imports are data only. Nothing in this module evaluates imported text. */
const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';
const MAX_QUESTIONS = 1000;
const MAX_TEXT_LENGTH = 2_000_000;

const CATEGORY_ALIASES = new Map([
  ['pathogenesis', 'pathogenesis'], ['병인', 'pathogenesis'], ['병인론', 'pathogenesis'],
  ['감염병의병인론', 'pathogenesis'], ['감염병병인론', 'pathogenesis'],
  ['diagnosis', 'diagnosis'], ['진단', 'diagnosis'], ['감염병의진단', 'diagnosis'],
  ['treatment', 'treatment'], ['치료', 'treatment'], ['치료원칙', 'treatment'],
  ['감염병의치료원칙', 'treatment'], ['감염병치료원칙', 'treatment'],
  ['approach', 'approach'], ['감염질환에대한접근', 'approach'],
]);

export function normalizeCategory(value, fallback = 'uncategorized') {
  const category = typeof value === 'string' ? value.trim() : '';
  if (!category) return fallback;
  return CATEGORY_ALIASES.get(category.toLowerCase().replace(/[\s·ㆍ_-]/g, '')) || category;
}

function plain(value) {
  return typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '';
}

function markdownText(value) {
  return value.replace(/\*\*/g, '').replace(/__/g, '').replace(/`([^`]+)`/g, '$1').trim();
}

function answerNumber(value, options = [], zeroBased = false) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isInteger(value) ? value + (zeroBased ? 1 : 0) : NaN;
  if (typeof value !== 'string') return NaN;
  const trimmed = markdownText(value).replace(/^(?:정답|답)\s*[:：]?\s*/, '');
  if (zeroBased && /^\d+$/.test(trimmed)) return Number(trimmed) + 1;
  const circle = CIRCLED.indexOf(trimmed[0]);
  if (circle !== -1 && /^([①-⑩])(?:\s|[.)]|$)/u.test(trimmed)) return circle + 1;
  const letter = trimmed.match(/^([A-Ja-j])(?:\s|[.)]|$)/);
  if (letter) return letter[1].toUpperCase().charCodeAt(0) - 64;
  const number = trimmed.match(/^(\d{1,2})(?:\s|[.)]|$)/);
  if (number) return Number(number[1]);
  const optionIndex = options.findIndex(option => option === trimmed);
  return optionIndex === -1 ? NaN : optionIndex + 1;
}

function normalizeOptions(value) {
  if (Array.isArray(value)) {
    return value.map(option => {
      if (typeof option === 'string') return option.trim();
      if (option && typeof option === 'object') return plain(option.text ?? option.label ?? option.content);
      return '';
    });
  }
  if (value && typeof value === 'object') {
    const labeled = Object.entries(value).map(([key, text]) => {
      const label = key.trim();
      const circleIndex = CIRCLED.indexOf(label);
      const index = /^[A-Ja-j]$/.test(label) ? label.toUpperCase().charCodeAt(0) - 64 :
        /^\d{1,2}$/.test(label) ? Number(label) : circleIndex !== -1 && label.length === 1 ? circleIndex + 1 : NaN;
      return { index, text };
    }).sort((a, b) => a.index - b.index);
    // Missing or unfamiliar labels cannot safely be mapped to a numbered answer.
    if (labeled.some((entry, index) => entry.index !== index + 1)) return [];
    return labeled.map(({ text }) => typeof text === 'string' ? plain(text) : plain(text?.text ?? text?.label ?? text?.content));
  }
  return [];
}

function normalizeQuestion(raw, defaults) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const options = normalizeOptions(raw.options ?? raw.choices ?? raw.보기);
  const stem = plain(raw.stem ?? raw.question ?? raw.prompt ?? raw.questionText ?? raw.문제);
  const hasAnswerIndex = Object.prototype.hasOwnProperty.call(raw, 'answerIndex');
  const answerValue = hasAnswerIndex ? raw.answerIndex : raw.answer ?? raw.correctAnswer ?? raw.correct_answer ?? raw.correct ?? raw.정답;
  const tags = Array.isArray(raw.tags) ? raw.tags.filter(item => typeof item === 'string') :
    typeof raw.tags === 'string' ? raw.tags.split(/[,，]/).map(item => item.trim()).filter(Boolean) : [];
  return {
    ...(typeof raw.id === 'string' && raw.id.trim() ? { id: raw.id.trim() } : {}),
    category: normalizeCategory(raw.category ?? raw.topic ?? raw.분류 ?? raw.주제, defaults.category),
    ...(raw.bank === 'past' || raw.bank === 'generated' ? {bank:raw.bank} : {}),
    ...(Number.isInteger(raw.year) && raw.year >= 1900 && raw.year <= 2100 ? {year:raw.year} : {}),
    ...(Number.isInteger(raw.originalNumber) && raw.originalNumber >= 1 && raw.originalNumber <= 999 ? {originalNumber:raw.originalNumber} : {}),
    title: plain(raw.title ?? raw.제목) || stem.split('\n')[0].slice(0, 64),
    stem,
    options,
    answer: answerNumber(answerValue, options, hasAnswerIndex),
    ...(Array.isArray(raw.acceptedAnswers) && raw.acceptedAnswers.length && raw.acceptedAnswers.every(n=>Number.isInteger(n)&&n>=1&&n<=options.length) ? {acceptedAnswers:[...raw.acceptedAnswers],answerMode:raw.answerMode==='multiple'?'multiple':'single'} : {}),
    ...(Array.isArray(raw.scanImages) && raw.scanImages.every(src=>typeof src==='string'&&(/^\.\/data\/past-images\/[a-z0-9-]+\.webp$/.test(src)||/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(src))) ? {scanImages:[...raw.scanImages],choiceLabelsOnly:raw.choiceLabelsOnly===true} : {}),
    explanation: plain(raw.explanation ?? raw.rationale ?? raw.solution ?? raw.해설),
    source: plain(raw.source ?? raw.reference ?? raw.출처 ?? raw.근거),
    difficulty: plain(raw.difficulty ?? raw.난이도) || '중',
    tags,
    origin: plain(raw.origin ?? raw.type) || '가져온 문제',
  };
}

/** Returns errors without mutating the question. Missing answers are permitted for import review. */
export function validateQuestion(question, { allowUnanswered = true } = {}) {
  const errors = [];
  if (!question || typeof question !== 'object') return { valid: false, errors: ['문제 객체가 아닙니다.'] };
  if (!plain(question.stem)) errors.push('문제 본문이 없습니다.');
  if (typeof question.stem === 'string' && question.stem.length > 50_000) errors.push('문제 본문이 너무 깁니다.');
  if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 10) {
    errors.push('보기는 2~10개여야 합니다.');
  } else {
    if (question.options.some(option => typeof option !== 'string' || !option.trim())) errors.push('빈 보기가 있습니다.');
    if (question.options.some(option => typeof option === 'string' && option.length > 20_000)) errors.push('보기의 길이가 너무 깁니다.');
  }
  if (question.answer === null || question.answer === undefined) {
    if (!allowUnanswered) errors.push('정답이 없습니다.');
  } else if (!Number.isInteger(question.answer) || question.answer < 1 || question.answer > (question.options?.length || 0)) {
    errors.push('정답 번호가 보기 범위를 벗어나거나 올바르지 않습니다.');
  }
  return { valid: errors.length === 0, errors };
}

function validateImport(rawQuestions, defaults, warnings) {
  const questions = [];
  if (rawQuestions.length > MAX_QUESTIONS) warnings.push(`한 번에 ${MAX_QUESTIONS}문항까지만 가져올 수 있어 이후 문항은 제외했습니다.`);
  rawQuestions.slice(0, MAX_QUESTIONS).forEach((raw, index) => {
    const normalized = normalizeQuestion(raw, defaults);
    const validation = validateQuestion(normalized);
    if (!validation.valid) {
      warnings.push(`${index + 1}번째 항목 제외: ${validation.errors.join(' ')}`);
      return;
    }
    if (normalized.answer === null) warnings.push(`${index + 1}번째 문제에 정답이 없습니다. 미리보기에서 확인해 주세요.`);
    questions.push(normalized);
  });
  return { questions, warnings };
}

function categoryLine(line) {
  const clean = markdownText(line).replace(/^#{1,6}\s*/, '').trim();
  const explicit = clean.match(/^\[?(?:분류|주제|category)\s*[:：]\s*([^\]]+)\]?$/i);
  if (explicit) return normalizeCategory(explicit[1]);
  const normalized = normalizeCategory(clean);
  return ['pathogenesis', 'diagnosis', 'treatment', 'approach'].includes(normalized) ? normalized : null;
}

function extractHeading(line) {
  const clean = markdownText(line).replace(/^#{1,6}\s*/, '');
  const match = clean.match(/^(?:문제\s*|Q\s*)?(\d{1,4})\s*[.)]\s+(.+)$/i);
  if (!match) return null;
  let stem = match[2];
  let category;
  let origin;
  stem = stem.replace(/\[(분류|주제)\s*[:：]\s*([^\]]+)\]/g, (_, key, value) => {
    category = normalizeCategory(value);
    return '';
  });
  const originMatch = stem.match(/^\[([^\]]*(?:기출|심화|응용|보완)[^\]]*)\]\s*/);
  if (originMatch) { origin = originMatch[1]; stem = stem.slice(originMatch[0].length); }
  return { number: Number(match[1]), stem: stem.trim(), category, origin };
}

function extractOptions(line) {
  const clean = markdownText(line).replace(/^[-*]\s+/, '');
  if (/^[①-⑩]/u.test(clean)) {
    const markers = [...clean.matchAll(/(?:^|\s)([①-⑩])\s*/gu)];
    return markers.map((match, index) => ({
      index: CIRCLED.indexOf(match[1]) + 1,
      text: clean.slice(match.index + match[0].length, markers[index + 1]?.index ?? clean.length).trim(),
    }));
  }
  const letter = clean.match(/^([A-Ja-j])[.)]\s+(.+)$/);
  if (letter) return [{ index: letter[1].toUpperCase().charCodeAt(0) - 64, text: letter[2].trim() }];
  return null;
}

function isAnswerSection(line) {
  const clean = markdownText(line).replace(/^#{1,6}\s*/, '');
  return /^(?:정답(?:\s*(?:[·ㆍ/&,-]|및|과|와)\s*해설)?|답안(?:\s*및\s*해설)?|정답표)\s*[:：]?\s*$/.test(clean);
}

function answerHeading(line) {
  const clean = markdownText(line).replace(/^#{1,6}\s*/, '');
  const match = clean.match(/^(\d{1,4})\s*[.)]\s*(?:정답\s*[:：]?\s*)?([①-⑩]|\d{1,2}|[A-Ja-j])(?:[.)]|\s|$)\s*(.*)$/u);
  if (!match) return null;
  return { number: Number(match[1]), answer: answerNumber(match[2]), explanation: match[3] || '' };
}

function parseMarkdown(text, defaults, warnings) {
  const rawQuestions = [];
  const answers = new Map();
  let current = null;
  let activeCategory = defaults.category;
  let inAnswers = false;
  let currentAnswer = null;
  let mode = 'stem';

  const finishQuestion = () => {
    if (!current) return;
    const labels = current.optionEntries.map(option => option.index);
    if (labels.some((label, index) => label !== index + 1)) {
      warnings.push(`${current.number}번 문제 제외: 보기 번호가 1부터 순서대로 이어지지 않습니다.`);
    } else {
      rawQuestions.push({ ...current, stem: current.stemLines.join('\n').trim(), options: current.optionEntries.map(option => option.text.trim()) });
    }
    current = null;
  };
  const finishAnswer = () => {
    if (!currentAnswer) return;
    currentAnswer.explanation = currentAnswer.lines.join('\n').trim();
    answers.set(currentAnswer.number, currentAnswer);
    currentAnswer = null;
  };

  for (const originalLine of text.split('\n')) {
    const line = originalLine.trimEnd();
    const clean = markdownText(line);
    if (/^\s*(?:---+|___+|```.*)\s*$/.test(line)) continue;
    if (isAnswerSection(line)) {
      finishQuestion();
      inAnswers = true;
      continue;
    }
    if (inAnswers) {
      const answer = answerHeading(line);
      if (answer) {
        finishAnswer();
        if (answers.has(answer.number)) warnings.push(`${answer.number}번 정답이 중복되어 마지막 정답을 사용합니다.`);
        currentAnswer = { ...answer, lines: answer.explanation ? [answer.explanation] : [] };
      } else if (currentAnswer && clean) {
        currentAnswer.lines.push(clean.replace(/^해설\s*[:：]?\s*/, ''));
      }
      continue;
    }
    const category = categoryLine(line);
    if (category) {
      activeCategory = category;
      if (current && current.optionEntries.length === 0 && current.stemLines.length <= 1) current.category = category;
      continue;
    }
    const options = extractOptions(line);
    if (current && options) {
      current.optionEntries.push(...options);
      mode = 'options';
      continue;
    }
    // Numeric choices are accepted only as a continuing 1), 2), ... sequence.
    const numericOption = clean.match(/^(\d{1,2})\)\s+(.+)$/);
    if (current && numericOption && Number(numericOption[1]) === current.optionEntries.length + 1) {
      current.optionEntries.push({ index: Number(numericOption[1]), text: numericOption[2] });
      mode = 'options';
      continue;
    }
    const heading = extractHeading(line);
    if (heading) {
      finishQuestion();
      current = {
        number: heading.number,
        category: heading.category || activeCategory,
        origin: heading.origin || '가져온 문제',
        stemLines: heading.stem ? [heading.stem] : [],
        optionEntries: [],
        answer: null,
        explanation: '',
        source: '',
      };
      mode = 'stem';
      continue;
    }
    if (!current) continue;
    const inlineAnswer = clean.match(/^(?:정답|답)\s*[:：]?\s*([①-⑩]|\d{1,2}|[A-Ja-j])(?:[.)]|\s|$)\s*(.*)$/u);
    if (inlineAnswer) {
      current.answer = answerNumber(inlineAnswer[1]);
      if (inlineAnswer[2]) current.explanation = [current.explanation, inlineAnswer[2]].filter(Boolean).join('\n');
      mode = 'explanation';
      continue;
    }
    const explanation = clean.match(/^해설\s*[:：]\s*(.*)$/);
    if (explanation) {
      current.explanation = [current.explanation, explanation[1]].filter(Boolean).join('\n');
      mode = 'explanation';
      continue;
    }
    const source = clean.match(/^(?:출처|근거|참고)\s*[:：]\s*(.*)$/);
    if (source) {
      current.source = [current.source, source[1]].filter(Boolean).join('\n');
      mode = 'source';
      continue;
    }
    if (mode === 'options' && current.optionEntries.length && clean) {
      current.optionEntries[current.optionEntries.length - 1].text += '\n' + clean;
    } else if (mode === 'explanation') {
      current.explanation += (current.explanation && clean ? '\n' : '') + clean;
    } else if (mode === 'source') {
      current.source += (current.source && clean ? '\n' : '') + clean;
    } else {
      current.stemLines.push(clean);
    }
  }
  finishQuestion();
  finishAnswer();
  const numberCounts = new Map();
  for (const question of rawQuestions) numberCounts.set(question.number, (numberCounts.get(question.number) || 0) + 1);
  for (const question of rawQuestions) {
    const answer = answers.get(question.number);
    if (!answer) continue;
    if (numberCounts.get(question.number) !== 1) {
      warnings.push(`${question.number}번 문제 번호가 중복되어 뒤쪽 정답표를 자동 연결하지 않았습니다.`);
      continue;
    }
    if (question.answer !== null && question.answer !== answer.answer) {
      warnings.push(`${question.number}번의 본문 정답과 정답표가 달라 정답을 비워 두었습니다.`);
      question.answer = null;
      continue;
    }
    question.answer = answer.answer;
    question.explanation = [question.explanation, answer.explanation].filter(Boolean).join('\n');
  }
  if (!rawQuestions.length) warnings.push('문제를 찾지 못했습니다. JSON 양식 또는 “1. 문제 / ① 보기 / 정답: ③” 형식을 확인해 주세요.');
  return validateImport(rawQuestions, defaults, warnings);
}

function csvHeader(value) {
  const key = value.trim().toLowerCase().replace(/[\s_-]/g, '');
  const aliases = {
    category: 'category', topic: 'category', 분류: 'category', 주제: 'category',
    title: 'title', 제목: 'title',
    stem: 'stem', question: 'stem', prompt: 'stem', questiontext: 'stem', 문제: 'stem', 본문: 'stem', 질문: 'stem',
    answer: 'answer', correctanswer: 'answer', correct: 'answer', 정답: 'answer',
    answerindex: 'answerIndex',
    explanation: 'explanation', rationale: 'explanation', solution: 'explanation', 해설: 'explanation',
    source: 'source', reference: 'source', 출처: 'source', 근거: 'source',
    difficulty: 'difficulty', 난이도: 'difficulty',
    tags: 'tags', 태그: 'tags', origin: 'origin', 유형: 'origin',
  };
  const option = key.match(/^(?:option|choice|보기|선택지)(10|[1-9])$/);
  return option ? `option${Number(option[1])}` : aliases[key] || null;
}

function looksLikeCSV(text) {
  const firstLine = text.split('\n', 1)[0].replace(/"/g, '');
  const headers = firstLine.split(',').map(csvHeader);
  return headers.includes('stem') && headers.filter(header => /^option\d+$/.test(header || '')).length >= 2;
}

/** RFC4180 fields: quoted commas/newlines and doubled quotes, without eval or heuristics. */
function csvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let afterQuote = false;
  const finishField = () => { row.push(field); field = ''; afterQuote = false; };
  const finishRow = () => {
    finishField();
    if (row.some(cell => cell.trim())) rows.push(row);
    row = [];
  };
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') { field += '"'; index++; }
        else { quoted = false; afterQuote = true; }
      } else field += character;
      continue;
    }
    if (afterQuote) {
      if (character === ',') finishField();
      else if (character === '\n') finishRow();
      else if (character !== ' ' && character !== '\t') throw new Error('닫힌 따옴표 뒤에 쉼표나 줄바꿈이 필요합니다.');
      continue;
    }
    if (character === '"') {
      if (field.length !== 0) throw new Error('따옴표는 필드의 시작에 사용하거나, 필드 안에서 두 번 연속 써야 합니다.');
      quoted = true;
    } else if (character === ',') finishField();
    else if (character === '\n') finishRow();
    else field += character;
  }
  if (quoted) throw new Error('닫히지 않은 따옴표가 있습니다.');
  if (field.length || row.length || afterQuote) finishRow();
  return rows;
}

function parseCSV(text, defaults, warnings) {
  let rows;
  try { rows = csvRows(text); } catch (error) {
    return { questions: [], warnings: [`CSV 문법이 올바르지 않습니다. ${error.message}`] };
  }
  if (rows.length === 0) return { questions: [], warnings: ['CSV에 내용이 없습니다.'] };
  const headerCells = rows.shift();
  const headers = headerCells.map(csvHeader);
  const recognized = headers.filter(Boolean);
  if (new Set(recognized).size !== recognized.length) {
    return { questions: [], warnings: ['CSV에 같은 의미의 헤더가 중복되어 있습니다. 문제·보기·정답 열을 각각 하나씩 사용해 주세요.'] };
  }
  const optionHeaders = headers.filter(header => /^option\d+$/.test(header || ''));
  const optionCount = Math.max(0, ...optionHeaders.map(header => Number(header.slice(6))));
  if (!headers.includes('stem') || optionCount < 2 || optionHeaders.length !== optionCount) {
    return { questions: [], warnings: ['CSV 첫 줄에 stem(문제)과 option1, option2처럼 순서대로 이어지는 보기 헤더가 필요합니다.'] };
  }
  const rawQuestions = [];
  rows.forEach((cells, index) => {
    if (cells.length !== headerCells.length) {
      warnings.push(`CSV ${index + 2}번째 행 제외: 헤더 ${headerCells.length}열과 데이터 ${cells.length}열이 일치하지 않습니다.`);
      return;
    }
    const raw = {};
    headers.forEach((header, column) => { if (header) raw[header] = cells[column]; });
    raw.options = Array.from({ length: optionCount }, (_, option) => raw[`option${option + 1}`]);
    while (raw.options.length > 2 && raw.options.at(-1) === '') raw.options.pop();
    rawQuestions.push(raw);
  });
  if (!rawQuestions.length && !warnings.length) warnings.push('CSV에 문제 데이터가 없습니다. 헤더 아래에 문제를 추가해 주세요.');
  return validateImport(rawQuestions, defaults, warnings);
}

/** Accepts JSON, CSV, Markdown, or plain text; never invents an absent correct answer. */
export function parseImport(input, { category = 'uncategorized', filename = '' } = {}) {
  const warnings = [];
  if (typeof input !== 'string' || !input.trim()) return { questions: [], warnings: ['가져올 내용이 비어 있습니다.'] };
  if (input.length > MAX_TEXT_LENGTH) return { questions: [], warnings: ['파일이 너무 큽니다. 2MB 이하의 문제 파일로 나누어 주세요.'] };
  const defaults = { category: normalizeCategory(category) };
  let text = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  const codeFence = text.match(/^```(?:json|javascript|js|csv)?\s*\n([\s\S]*?)\n```$/i);
  if (codeFence) text = codeFence[1].trim();
  if (/\.csv$/i.test(filename) || looksLikeCSV(text)) return parseCSV(text, defaults, warnings);
  const looksJson = /^[\[{]/.test(text) && !/^\[(?:분류|주제|기출|강의)/.test(text);
  if (looksJson || /\.json$/i.test(filename)) {
    let data;
    try { data = JSON.parse(text); } catch {
      return { questions: [], warnings: ['JSON 문법이 올바르지 않습니다. 쉼표·따옴표·괄호 또는 파일 형식을 확인해 주세요.'] };
    }
    const rawQuestions = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : Array.isArray(data?.문제들) ? data.문제들 : null;
    if (!rawQuestions) return { questions: [], warnings: ['JSON은 문제 배열 또는 {"questions": [...]} 형태여야 합니다.'] };
    return validateImport(rawQuestions, defaults, warnings);
  }
  return parseMarkdown(text, defaults, warnings);
}

export const IMPORT_TEMPLATE_JSON = JSON.stringify({
  questions: [{
    bank: 'generated',
    category: '감염병의 진단',
    title: '예시 문제 제목',
    stem: '새로운 문제의 본문을 입력하세요.',
    options: ['첫 번째 보기', '두 번째 보기', '세 번째 보기', '네 번째 보기', '다섯 번째 보기'],
    answer: 3,
    explanation: '정답의 근거와 오답을 구분하는 기준을 입력하세요.',
    source: '강의록 12쪽 / 기출 2025년 43번',
    difficulty: '중상',
    tags: ['기출 응용'],
  }],
}, null, 2);

export const IMPORT_TEMPLATE_MARKDOWN = `# 감염병의 진단

1. [기출 응용] 새로운 문제의 본문을 입력하세요.
① 첫 번째 보기
② 두 번째 보기
③ 세 번째 보기
④ 네 번째 보기
⑤ 다섯 번째 보기
정답: ③
해설: 정답의 근거와 오답을 구분하는 기준을 입력하세요.
출처: 강의록 12쪽 / 기출 2025년 43번
`;
