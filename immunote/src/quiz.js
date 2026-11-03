import { bindScanImage } from './assets.js';
const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

export function getAnswerChoices(question) {
  const answers = Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length ? question.acceptedAnswers : [Number(question.answer)];
  return [...new Set(answers.filter(n => Number.isInteger(n) && n >= 1 && n <= question.options.length))].sort((a,b)=>a-b);
}
export function isAnswerCorrect(question, selected) {
  const accepted = getAnswerChoices(question);
  if (question.answerMode === 'multiple') {
    if (!Array.isArray(selected) || !selected.length) return false;
    const values = [...new Set(selected)].sort((a,b)=>a-b);
    return values.length === accepted.length && values.every((n,i)=>n===accepted[i]);
  }
  return Number.isInteger(selected) && accepted.includes(selected);
}

/** Shuffle questions without changing either the source order or option order. */
export function shuffleQuestions(questions, random = Math.random) {
  const result = [...questions];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const value = Number(random());
    const j = Math.min(i, Math.max(0, Math.floor((Number.isFinite(value) ? value : 0) * (i + 1))));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Score a round. Practice sessions can leave unconfirmed selections unanswered;
 * exam submissions can explicitly count unanswered questions as incorrect.
 */
export function scoreAnswers(questions, answerState = {}, options = {}) {
  const { checkedOnly = false, countUnansweredAsWrong = false } = options;
  const read = id => answerState instanceof Map ? answerState.get(id) : answerState[id];
  const answers = questions.map(question => {
    const entry = read(question.id);
    const object = entry && typeof entry === 'object' ? entry : { selected: entry };
    const eligible = !checkedOnly || object?.checked === true;
    const candidate = Number(object?.selected);
    const values = object?.selected;
    const selected = !eligible ? null : question.answerMode === 'multiple'
      ? Array.isArray(values) && values.length && values.every(n=>Number.isInteger(n)&&n>=1&&n<=question.options.length) ? [...values] : null
      : Number.isInteger(candidate) && candidate >= 1 && candidate <= question.options.length ? candidate : null;
    const correct = selected === null ? (countUnansweredAsWrong ? false : null) : isAnswerCorrect(question, selected);
    return {
      questionId: question.id,
      selected,
      answer: Number(question.answer),
      correct,
      timeMs: Math.max(0, Number(object?.timeMs) || 0),
      status: selected === null ? 'unanswered' : correct ? 'correct' : 'incorrect',
    };
  });
  return {
    total: questions.length,
    correct: answers.filter(answer => answer.correct === true).length,
    wrong: answers.filter(answer => answer.correct === false).length,
    answered: answers.filter(answer => answer.selected !== null).length,
    unanswered: answers.filter(answer => answer.selected === null).length,
    answers,
  };
}

function validQuestion(question) {
  return question && typeof question.id === 'string' && question.id.length > 0 &&
    Array.isArray(question.options) && question.options.length >= 2 && question.options.every(option => typeof option === 'string') &&
    Number.isInteger(Number(question.answer)) && Number(question.answer) >= 1 && Number(question.answer) <= question.options.length;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function button(text, className, action, attributes = {}) {
  const node = element('button', className, text);
  node.type = 'button';
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (action) node.addEventListener('click', action);
  return node;
}

function durationLabel(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}분 ${seconds % 60}초` : `${seconds}초`;
}

/**
 * Mount a self-contained quiz. All supplied strings are rendered as plain text.
 * Calling the returned cleanup function removes keyboard listeners and the view.
 */
export function mountQuiz(container, questions, config = {}) {
  if (!container || typeof container.replaceChildren !== 'function') throw new TypeError('퀴즈를 표시할 영역이 필요합니다.');
  const originalQuestions = Array.isArray(questions) ? questions.filter(validQuestion) : [];
  const excludedCount = (Array.isArray(questions) ? questions.length : 0) - originalQuestions.length;
  const originalMode = config.mode === 'exam' ? 'exam' : 'practice';
  let mode = originalMode;
  let order = [];
  let index = 0;
  let state = new Map();
  let reported = new Set();
  let finished = false;
  let reviewing = false;
  let destroyed = false;
  let roundStarted = Date.now();
  let enteredAt = Date.now();
  let result = null;
  let liveStatus = null;
  const confirmAction = message => typeof config.confirm === 'function' ? config.confirm(message) : window.confirm(message);

  const getEntry = id => state.get(id) || { selected: null, checked: false, timeMs: 0 };
  const getViewEntry = id => {
    if (!reviewing || !result) return getEntry(id);
    const answer = result.answers.find(item => item.questionId === id);
    return answer ? { selected: answer.selected, checked: true, timeMs: answer.timeMs } : getEntry(id);
  };

  function updateTime() {
    if (finished || !order[index]) return;
    const question = order[index];
    const entry = getEntry(question.id);
    const now = Date.now();
    state.set(question.id, { ...entry, timeMs: entry.timeMs + Math.max(0, now - enteredAt) });
    enteredAt = now;
  }

  function announce(text) {
    if (liveStatus) liveStatus.textContent = text;
  }

  function report(question, entry, correct) {
    if (reported.has(question.id)) return;
    reported.add(question.id);
    config.onAnswer?.({ questionId: question.id, selected: entry.selected, correct, timeMs: entry.timeMs });
  }

  function exit() {
    if (!finished && [...state.values()].some(entry => entry.selected !== null)) {
      const text = mode === 'exam'
        ? '시험을 종료할까요? 제출하지 않은 답안은 학습 기록에 저장되지 않습니다.'
        : '문제은행으로 돌아갈까요? 정답을 확인한 문항은 학습 기록에 저장되어 있습니다.';
      if (!confirmAction(text)) return;
    }
    cleanup();
    config.onExit?.();
  }

  function setSelection(selected) {
    const question = order[index];
    if (!question || finished || reviewing || (mode === 'practice' && getEntry(question.id).checked)) return;
    if (!Number.isInteger(selected) || selected < 1 || selected > question.options.length) return;
    updateTime();
    let selection = selected;
    if (question.answerMode === 'multiple') {
      const previous = Array.isArray(getEntry(question.id).selected) ? getEntry(question.id).selected : [];
      selection = previous.includes(selected) ? previous.filter(n=>n!==selected) : [...previous,selected].sort((a,b)=>a-b);
      if (!selection.length) selection = null;
    }
    state.set(question.id, { ...getEntry(question.id), selected:selection });
    renderQuestion(false);
    announce(`${selected}번 선택`);
  }

  function checkCurrent() {
    const question = order[index];
    if (!question || finished || reviewing || mode !== 'practice') return;
    const current = getEntry(question.id);
    if (current.checked || current.selected === null) return;
    updateTime();
    const entry = { ...getEntry(question.id), checked: true };
    state.set(question.id, entry);
    const correct = isAnswerCorrect(question, entry.selected);
    report(question, entry, correct);
    renderQuestion(false);
    announce(correct ? '정답입니다.' : `정답은 ${getAnswerChoices(question).join(', ')}번입니다.`);
  }

  function move(nextIndex) {
    if (nextIndex < 0 || nextIndex >= order.length || destroyed) return;
    updateTime();
    index = nextIndex;
    enteredAt = Date.now();
    renderQuestion(true);
  }

  function finishRound() {
    if (finished || destroyed) return;
    const pending = order.filter(question => {
      const entry = getViewEntry(question.id);
      return mode === 'practice' ? !entry.checked : entry.selected === null;
    }).length;
    if (pending) {
      const text = mode === 'exam'
        ? `미응답 ${pending}문항이 있습니다. 미응답은 오답으로 처리됩니다. 시험을 제출할까요?`
        : `아직 정답을 확인하지 않은 ${pending}문항이 있습니다. 미풀이로 남기고 결과를 볼까요?`;
      if (!confirmAction(text)) return;
    }
    updateTime();
    result = {
      ...scoreAnswers(order, state, { checkedOnly: mode === 'practice', countUnansweredAsWrong: mode === 'exam' }),
      elapsedMs: Math.max(0, Date.now() - roundStarted),
    };
    if (mode === 'exam') {
      for (const answer of result.answers) {
        report(order.find(question => question.id === answer.questionId), {
          selected: answer.selected,
          timeMs: answer.timeMs,
        }, answer.correct === true);
      }
    }
    finished = true;
    reviewing = false;
    config.onFinish?.({
      total: result.total,
      correct: result.correct,
      answers: result.answers,
      elapsedMs: result.elapsedMs,
    });
    renderResults();
  }

  function startRound(nextQuestions, nextMode = originalMode) {
    mode = nextMode;
    order = config.shuffle ? shuffleQuestions(nextQuestions) : [...nextQuestions];
    index = 0;
    state = new Map();
    reported = new Set();
    finished = false;
    reviewing = false;
    result = null;
    roundStarted = Date.now();
    enteredAt = Date.now();
    renderQuestion(true);
  }

  function makeTopbar() {
    const bar = element('div', 'quiz-topbar');
    bar.append(button('← 문제은행', 'btn btn-ghost quiz-exit', exit));
    const context = element('div', 'quiz-context');
    if (config.bankLabel) context.append(element('span','quiz-bank-badge',config.bankLabel));
    context.append(element('span', 'quiz-mode-badge', reviewing ? '정답·해설 복습' : mode === 'exam' ? '시험 모드' : '연습 모드'));
    context.append(element('span', 'quiz-counter', `${index + 1} / ${order.length}`));
    bar.append(context);
    const question = order[index];
    const bookmarked = Boolean(config.isBookmarked?.(question.id));
    const bookmark = button(bookmarked ? '★ 북마크됨' : '☆ 북마크', `btn btn-ghost quiz-bookmark${bookmarked ? ' is-active' : ''}`, () => {
      config.onBookmark?.(question.id);
      const next = Boolean(config.isBookmarked?.(question.id));
      bookmark.textContent = next ? '★ 북마크됨' : '☆ 북마크';
      bookmark.classList.toggle('is-active', next);
      bookmark.setAttribute('aria-pressed', String(next));
      bookmark.setAttribute('aria-label', next ? '북마크 해제' : '이 문제 북마크');
    }, { 'aria-pressed': bookmarked, 'aria-label': bookmarked ? '북마크 해제' : '이 문제 북마크' });
    bar.append(bookmark);
    return bar;
  }

  function questionNavigation() {
    const navigation = element('nav', 'quiz-navigation');
    navigation.setAttribute('aria-label', '문항 바로가기');
    order.forEach((question, position) => {
      const entry = getViewEntry(question.id);
      const evaluated = reviewing || mode === 'practice' && entry.checked;
      const selected = entry.selected !== null;
      let className = 'quiz-nav-dot';
      if (position === index) className += ' is-current';
      if (evaluated && selected) className += isAnswerCorrect(question,entry.selected) ? ' is-correct' : ' is-incorrect';
      else if (selected) className += ' is-answered';
      const jump = button(String(position + 1), className, () => move(position), {
        'aria-label': `${position + 1}번 문항${evaluated && selected ? isAnswerCorrect(question,entry.selected) ? ', 정답' : ', 오답' : selected ? ', 선택 완료' : ', 미풀이'}`,
      });
      if (position === index) jump.setAttribute('aria-current', 'step');
      navigation.append(jump);
    });
    return navigation;
  }

  function renderFeedback(question, entry) {
    const selected = entry.selected;
    const correct = isAnswerCorrect(question, selected);
    const answerText = getAnswerChoices(question).map(n=>CIRCLED[n-1]||n).join(', ');
    const feedback = element('section', `quiz-feedback ${selected === null ? 'is-unanswered' : correct ? 'is-correct' : 'is-incorrect'}`);
    const heading = element('div', 'quiz-feedback-heading', selected === null
      ? `미응답 · 정답 ${answerText}`
      : correct ? '✓ 정답이에요' : `정답은 ${answerText}번이에요`);
    feedback.append(heading);
    if (question.bank === 'past') {
      const original = Array.isArray(question.originalAnswers) ? question.originalAnswers : getAnswerChoices(question);
      const originalText = original.length ? original.map(n=>CIRCLED[n-1]||n).join(' · ') : '원문에서 확인되지 않음';
      const originalBox = element('section','quiz-original-key');
      originalBox.append(element('h3','','족보 원문 정답'),element('p','',originalText));
      const current = getAnswerChoices(question);
      if (JSON.stringify([...original].sort()) !== JSON.stringify(current)) originalBox.append(element('small','',`현재 채점 기준: ${current.map(n=>CIRCLED[n-1]||n).join(' · ')} · 원문과 다른 이유는 아래 검토 의견을 확인하세요.`));
      feedback.append(originalBox);
      const review = question.assistantReview;
      if (review) {
        const box = element('aside','quiz-assistant-review');
        box.setAttribute('aria-label','AI 검토 의견');
        box.append(element('h3','','AI 검토 의견 · 원문 답안과 별도'));
        const badges = {correction:'정답 오류 의심',ambiguous:'선지 해석 주의',historical:'당시 기준 참고'};
        box.append(element('div','review-status',`${badges[review.status]||'추가 검토'} · 확실성 ${review.confidence||'미표시'}`));
        box.append(element('strong','review-summary',review.summary||''),element('p','review-rationale',review.rationale||''));
        if (review.suggestedAnswers?.length) box.append(element('p','review-suggestion',`검토상 더 적절한 답: ${review.suggestedAnswers.map(n=>CIRCLED[n-1]||n).join(' · ')}`));
        if (review.references?.length) {
          const refs=element('ul','review-references');
          for(const ref of review.references){
            const li=element('li');
            if(/^https:\/\//.test(ref.url||'')){const a=element('a','',ref.label||ref.url);a.href=ref.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);}else li.textContent=ref.label||'';
            refs.append(li);
          }
          box.append(refs);
        }
        box.append(element('small','review-date',`${review.reviewedAt||''} 검토 · 이 의견 자체가 모든 문항의 정답 재검증을 뜻하지는 않습니다.`));
        feedback.append(box);
      }
    }
    if (selected !== null && !correct) feedback.append(element('p', 'quiz-selected-summary', `선택한 답: ${Array.isArray(selected)?selected.map(n=>CIRCLED[n-1]||n).join(', '):(CIRCLED[selected - 1] || selected)+' '+question.options[selected - 1]}`));
    if (question.explanation) {
      feedback.append(element('h3', 'quiz-explanation-label', '해설'));
      const explanation = element('p', 'quiz-explanation', question.explanation);
      explanation.style.whiteSpace = 'pre-wrap';
      feedback.append(explanation);
    }
    if (question.source) feedback.append(element('p', 'quiz-source', question.source));
    return feedback;
  }

  function renderQuestion(focusHeading = false) {
    if (destroyed) return;
    container.replaceChildren();
    const shell = element('section', 'quiz-shell');
    if (config.bank) shell.dataset.bank=config.bank;
    shell.dataset.questionId=order[index]?.id||'';
    if (!order.length) {
      const empty = element('div', 'question-card quiz-empty');
      empty.append(element('h2', '', '풀 수 있는 문제가 없어요'));
      empty.append(element('p', '', '문제에 정답이 등록되어 있는지 확인해 주세요.'));
      empty.append(button('문제은행으로', 'btn btn-primary', exit));
      shell.append(empty);
      container.append(shell);
      return;
    }
    const question = order[index];
    const entry = getViewEntry(question.id);
    const revealed = reviewing || mode === 'practice' && entry.checked;
    shell.append(makeTopbar());
    if (excludedCount) shell.append(element('p', 'quiz-notice', `정답 또는 선택지가 올바르지 않은 ${excludedCount}문항은 이번 풀이에서 제외했어요.`));
    const progress = element('div', 'quiz-progress');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', reviewing ? '복습 진행' : '풀이 진행');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', String(order.length));
    const completed = reviewing ? index + 1 : [...state.values()].filter(value => mode === 'practice' ? value.checked : value.selected !== null).length;
    progress.setAttribute('aria-valuenow', String(completed));
    const fill = element('div', 'quiz-progress-fill');
    fill.style.width = `${completed / order.length * 100}%`;
    progress.append(fill);
    shell.append(progress);
    shell.append(questionNavigation());

    const card = element('article', 'question-card');
    const meta = element('div', 'question-meta');
    meta.append(element('span', 'question-number', `QUESTION ${String(index + 1).padStart(2, '0')}`));
    const categoryName = config.categoryName?.(question.category) || question.category;
    if (categoryName) meta.append(element('span', 'tag quiz-category', categoryName));
    if (question.difficulty && question.difficulty !== '미지정') meta.append(element('span', 'tag quiz-difficulty', question.difficulty));
    if (question.origin) meta.append(element('span', 'tag quiz-origin', question.origin));
    card.append(meta);
    const originalLabel = question.bank === 'past' && Number.isInteger(question.year) && Number.isInteger(question.originalNumber) ? `${question.year}년 ${question.originalNumber}번` : null;
    const heading = element('h2', 'question-title', originalLabel || (revealed && question.title ? question.title : `문제 ${String(index + 1).padStart(2, '0')}`));
    heading.id = 'quiz-question-heading';
    heading.tabIndex = -1;
    card.append(heading);
    const stem = element('div', 'question-stem', question.stem || '');
    stem.style.whiteSpace = 'pre-wrap';
    if (question.scanImages?.length) {
      const scans = element('div','past-question-scans');
      for (const [i, src] of question.scanImages.entries()) {
        if (typeof src !== 'string' || !(/^\.\/data\/past-images\/[a-z0-9-]+\.webp$/.test(src)||/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(src))) continue;
        const img = element('img','past-question-image');
        bindScanImage(img,src);img.alt=`${question.year||''}년 ${question.originalNumber||''}번 원문 ${i+1}`;
        scans.append(img);
      }
      card.append(scans);
      const textDetails=element('details','past-text-details');textDetails.append(element('summary','','원문 텍스트 보기'),stem);card.append(textDetails);
      card.append(element('p','past-choice-hint',question.answerMode==='multiple'?'원문의 보기를 읽고 정답을 모두 선택하세요.':'원문의 보기를 읽고 아래 번호를 선택하세요.'));
    } else card.append(stem);
    if (question.answerMode === 'multiple') card.append(element('p','quiz-notice','복수선택 · 모든 정답을 선택한 뒤 확인해 주세요.'));
    const choices = element('div', 'quiz-options');
    if (question.choiceLabelsOnly) choices.classList.add('compact-choices');
    choices.setAttribute('role', question.answerMode === 'multiple' ? 'group' : 'radiogroup');
    choices.setAttribute('aria-label', '답안 선택');
    question.options.forEach((option, position) => {
      const choice = position + 1;
      let className = 'quiz-option';
      const chosen = Array.isArray(entry.selected) ? entry.selected.includes(choice) : entry.selected === choice;
      if (chosen) className += ' is-selected';
      if (revealed && getAnswerChoices(question).includes(choice)) className += ' is-correct';
      if (revealed && chosen && !getAnswerChoices(question).includes(choice)) className += ' is-incorrect';
      const optionButton = button(null, className, () => setSelection(choice), { role: question.answerMode === 'multiple' ? 'checkbox' : 'radio', 'aria-checked': chosen });
      optionButton.append(element('span', 'quiz-option-number', CIRCLED[position] || String(choice)));
      const optionText = element('span', 'quiz-option-text', question.choiceLabelsOnly ? `${choice}번` : option);
      optionText.style.whiteSpace = 'pre-wrap';
      optionButton.append(optionText);
      if (revealed) optionButton.disabled = true;
      if (revealed && getAnswerChoices(question).includes(choice)) optionButton.append(element('span', 'quiz-option-mark', '✓'));
      choices.append(optionButton);
    });
    card.append(choices);
    if (revealed) card.append(renderFeedback(question, entry));
    else if (mode === 'exam') card.append(element('p', 'quiz-mode-hint', '시험 모드에서는 제출 후 정답과 해설을 확인할 수 있어요.'));
    shell.append(card);

    const footer = element('div', 'quiz-footer');
    const previous = button('← 이전', 'btn btn-secondary', () => move(index - 1));
    previous.disabled = index === 0;
    footer.append(previous);
    if (reviewing) {
      footer.append(button('결과로 돌아가기', 'btn btn-ghost', () => { reviewing = false; renderResults(); }));
      const next = button('다음 →', 'btn btn-primary', () => move(index + 1));
      next.disabled = index === order.length - 1;
      footer.append(next);
    } else if (mode === 'practice') {
      if (!entry.checked) {
        const check = button('정답 확인', 'btn btn-primary quiz-check', checkCurrent);
        check.disabled = entry.selected === null;
        footer.append(check);
        if (index < order.length - 1) footer.append(button('건너뛰기 →', 'btn btn-ghost', () => move(index + 1)));
        else footer.append(button('결과 보기', 'btn btn-secondary', finishRound));
      } else {
        footer.append(element('span', 'quiz-keyboard-hint', '숫자 키로 선택 · Enter로 다음'));
        footer.append(index < order.length - 1
          ? button('다음 문제 →', 'btn btn-primary', () => move(index + 1))
          : button('결과 보기', 'btn btn-primary', finishRound));
      }
    } else {
      footer.append(button('시험 제출', 'btn btn-secondary quiz-submit', finishRound));
      if (index < order.length - 1) footer.append(button('다음 문제 →', 'btn btn-primary', () => move(index + 1)));
      else footer.append(button('제출하고 결과 보기', 'btn btn-primary', finishRound));
    }
    shell.append(footer);
    liveStatus = element('div', 'sr-only');
    liveStatus.setAttribute('aria-live', 'polite');
    liveStatus.setAttribute('aria-atomic', 'true');
    shell.append(liveStatus);
    container.append(shell);
    if (focusHeading) { heading.focus({ preventScroll: true }); if (index > 0) heading.scrollIntoView({block:'start'}); }
  }

  function renderResults() {
    if (destroyed || !result) return;
    container.replaceChildren();
    liveStatus = null;
    const shell = element('section', 'quiz-shell quiz-results');
    const top = element('div', 'quiz-topbar');
    top.append(button('← 문제은행', 'btn btn-ghost', exit));
    top.append(element('span', 'quiz-mode-badge', mode === 'exam' ? '시험 결과' : '학습 결과'));
    shell.append(top);
    const card = element('section', 'question-card quiz-result-card');
    card.append(element('p', 'eyebrow', 'SESSION COMPLETE'));
    const heading = element('h2', 'quiz-result-heading', '한 걸음 더 익숙해졌어요.');
    heading.tabIndex = -1;
    card.append(heading);
    const denominator = mode === 'exam' ? result.total : result.answered;
    const percent = denominator ? Math.round(result.correct / denominator * 100) : 0;
    card.append(element('div', 'quiz-score', `${percent}%`));
    card.append(element('p', 'quiz-result-subtitle', mode === 'exam'
      ? `전체 ${result.total}문항 중 ${result.correct}문항 정답`
      : `확인한 ${result.answered}문항 중 ${result.correct}문항 정답`));
    const stats = element('div', 'quiz-result-stats');
    const selectedWrong = result.answers.filter(answer => answer.status === 'incorrect').length;
    for (const [label, value, stateClass] of [['정답', result.correct, 'is-correct'], ['오답', selectedWrong, 'is-incorrect'], ['미풀이', result.unanswered, 'is-unanswered']]) {
      const stat = element('div', `quiz-result-stat ${stateClass}`);
      stat.append(element('strong', '', value), element('span', '', label));
      stats.append(stat);
    }
    card.append(stats);
    card.append(element('p', 'quiz-duration', `풀이 시간 ${durationLabel(result.elapsedMs)}`));
    card.append(element('h3', 'quiz-result-review-heading', '문항을 눌러 정답과 해설을 확인하세요'));
    const review = element('div', 'quiz-result-navigation');
    result.answers.forEach((answer, position) => {
      const label = answer.status === 'correct' ? '정답' : answer.status === 'incorrect' ? '오답' : '미풀이';
      review.append(button(`${position + 1} ${answer.status === 'correct' ? '✓' : answer.status === 'incorrect' ? '×' : '–'}`, `quiz-nav-dot is-${answer.status}`, () => {
        reviewing = true;
        index = position;
        renderQuestion(true);
      }, { 'aria-label': `${position + 1}번 ${label}, 해설 보기` }));
    });
    card.append(review);
    const actions = element('div', 'quiz-result-actions');
    const wrongIds = new Set(result.answers.filter(answer => answer.status === 'incorrect' || mode === 'exam' && answer.status === 'unanswered').map(answer => answer.questionId));
    if (wrongIds.size) actions.append(button(`오답 ${wrongIds.size}문항 다시 풀기`, 'btn btn-primary', () => startRound(order.filter(question => wrongIds.has(question.id)), 'practice')));
    else if (result.unanswered) {
      const unansweredIds = new Set(result.answers.filter(answer => answer.status === 'unanswered').map(answer => answer.questionId));
      actions.append(button(`미풀이 ${unansweredIds.size}문항 이어 풀기`, 'btn btn-primary', () => startRound(order.filter(question => unansweredIds.has(question.id)), 'practice')));
    } else actions.append(button('정답·해설 복습하기', 'btn btn-primary', () => { reviewing = true; index = 0; renderQuestion(true); }));
    actions.append(button('전체 다시 풀기', 'btn btn-secondary', () => startRound(originalQuestions)));
    actions.append(button('문제은행으로', 'btn btn-ghost', exit));
    card.append(actions);
    shell.append(card);
    container.append(shell);
    heading.focus({ preventScroll: true });
  }

  function onKeyDown(event) {
    if (destroyed || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target?.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"]') || document.querySelector('[aria-modal="true"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); exit(); return; }
    if (finished && !reviewing) return;
    if (/^[1-8]$/.test(event.key) && !finished) {
      event.preventDefault();
      setSelection(Number(event.key));
    } else if (event.key === 'Enter' && !target?.closest?.('button, a')) {
      event.preventDefault();
      if (reviewing) { if (index < order.length - 1) move(index + 1); }
      else if (mode === 'practice' && !getEntry(order[index]?.id).checked) checkCurrent();
      else if (index < order.length - 1) move(index + 1);
      else finishRound();
    }
  }

  function cleanup() {
    if (destroyed) return;
    destroyed = true;
    document.removeEventListener('keydown', onKeyDown);
    container.replaceChildren();
  }

  document.addEventListener('keydown', onKeyDown);
  startRound(originalQuestions);
  return cleanup;
}
