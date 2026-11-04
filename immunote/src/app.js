import { PAST_QUESTIONS } from '../data/past-questions.js';
import { CHAT_QUESTIONS } from '../data/chat-questions.js';
import { attachAssistantReview } from './reviews.js';
import { bindScanImage } from './assets.js';
import { getBank, selectBankQuestions, prepareBankSession, isGradable } from './banks.js';
import { SEED_QUESTIONS } from '../data/questions.js';
import { CATEGORIES } from '../data/categories.js';
import { parseImport, IMPORT_TEMPLATE_JSON, IMPORT_TEMPLATE_MARKDOWN } from './importer.js';
import { mountQuiz } from './quiz.js';
import { loadState, saveState, emptyState, recordAnswer, summarize, restoreBackup } from './store.js';

const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
  wrong: '<path d="M8 3h8l5 5v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="m9 11 6 6m0-6-6 6M16 3v5h5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  leaf: '<path d="M5 19c0-10 3-14 15-15 0 12-5 15-15 15Zm0 0L16 8"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  lab: '<path d="M8 3h8M9 3v7L3 20h18l-6-10V3M7 15h10"/>',
  dna: '<path d="M7 3c0 9 10 9 10 18M17 3c0 9-10 9-10 18M8 5h8M8 19h8M9 9h6M9 15h6"/>',
  pill: '<path d="M7 3a5 5 0 0 1 7 0l7 7a5 5 0 0 1-7 7l-7-7a5 5 0 0 1 0-7Z" transform="translate(-2 2)"/><path d="m8 16 8-8"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
  history: '<path d="M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l4 2"/>',
};
const svg = (name, cls = '') => '<svg class="icon ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || icons.book) + '</svg>';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loaded = loadState();
let state = loaded.state;
let storageAvailable = loaded.available;
let activeBank = state.activeBank === 'past' ? 'past' : 'generated';
let activeQuiz = null;
let cleanQuiz = null;
let filters = { search: '', status: 'all', difficulty: 'all', count: 'all', mode: 'practice' };
let listLimit = 10;
let preview = null;
let toastTimer;
let importSource = '';
const primaryIds = ['pathogenesis', 'diagnosis', 'treatment'];
const category = id => CATEGORIES.find(c => c.id === id);
const categoryName = id => category(id)?.name || id || '분류 미지정';
const allQuestions = () => [...SEED_QUESTIONS.map(q => ({...q, bank:'generated'})), ...PAST_QUESTIONS, ...CHAT_QUESTIONS, ...state.customQuestions].map(q=>attachAssistantReview(q)).map(q => {
  const override = state.answerOverrides?.[q.id];
  return Number.isInteger(override) && override >= 1 && override <= q.options.length ? {...q, answer:override, acceptedAnswers:[override], answerMode:'single', answerStatus:'user', explanation:'사용자가 직접 등록한 정답을 기준으로 채점합니다.\n'+(q.explanation || '')} : q;
});
const questions = () => selectBankQuestions(allQuestions(), activeBank);
const bankName = bank => bank === 'past' ? '족보 기출' : '만든 문제';
function bankTabs() { return '<div class="bank-tabs" role="group" aria-label="문제은행 선택"><button class="'+(activeBank==='past'?'selected':'')+'" data-action="navigate" data-route="past">족보 기출 <span>'+selectBankQuestions(allQuestions(),'past').length+'</span></button><button class="'+(activeBank==='generated'?'selected':'')+'" data-action="navigate" data-route="generated">만든 문제 <span>'+selectBankQuestions(allQuestions(),'generated').length+'</span></button></div>'; }

const timestamp = value => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const uid = () => globalThis.crypto?.randomUUID?.() || 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2);

function persist() {
  state.updatedAt = new Date().toISOString();
  storageAvailable = saveState(state);
  updateSaveStatus();
  if (!storageAvailable) toast('저장 공간이 부족하거나 사용할 수 없습니다. 백업 파일을 내려받아 주세요.');
}
function toast(message) {
  const node = document.querySelector('#toast'); node.textContent = message; node.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 3800);
}
function download(filename, data, mime = 'application/json') {
  const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function backup() { download('면역노트-백업-' + new Date().toISOString().slice(0, 10) + '.json', { app: 'immunote', version: 1, exportedAt: new Date().toISOString(), state }); toast('문제와 학습 기록을 백업했습니다.'); }
function getRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').map(x => { try { return decodeURIComponent(x); } catch { return x; } });
  return { view: parts[0] || 'home', category: parts[1] || null };
}
function navigate(route) {
  if (activeQuiz) { if (!confirm('문제풀이를 나갈까요? 이미 채점한 기록은 저장됩니다.')) return; cleanupQuiz(); }
  document.body.classList.remove('nav-open');
  if (location.hash === '#/' + route) render(); else location.hash = '/' + route;
}
function updateSaveStatus() {
  const node = document.querySelector('#save-status');
  if (node) node.innerHTML = '<span class="status-dot ' + (storageAvailable ? '' : 'warning') + '"></span>' + (storageAvailable ? '이 브라우저에 자동 저장' : '저장 불가 · 백업 필요');
}
function shell() {
  document.querySelector('#app').innerHTML = '<div class="sidebar-scrim" data-action="close-nav"></div><aside class="sidebar" aria-label="주 메뉴"><a class="brand" href="#/home"><img src="./favicon.svg" alt="" width="38" height="38"><div><strong>면역노트<span>IMMUNOTE</span></strong><small>배운 것을, 내 것으로.</small></div></a><div class="workspace-label">나의 학습 공간</div><nav id="navigation"></nav><div class="sidebar-bottom"><div class="storage-note">' + svg('leaf') + '<p>차곡차곡 쌓이는 실력<small>오늘의 한 문제부터 시작해요.</small></p></div><button class="sidebar-backup" data-action="backup">' + svg('download') + '문제 · 기록 백업</button><span id="save-status" class="save-status"></span></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-only" data-action="menu" aria-label="메뉴 열기">' + svg('menu') + '</button><span>나의 학습 공간</span><span class="crumb-slash">/</span><strong>감염과 면역</strong></div><div class="topbar-right"><span class="private-label"><span class="status-dot"></span>개인 학습 공간</span><button class="button primary small" data-action="import">' + svg('plus') + '채팅으로 업데이트</button><div class="avatar" aria-label="나의 학습 공간">나</div></div></header><main id="main-content" tabindex="-1"></main><footer class="page-footer"><span>면역노트 <span class="footer-dot">·</span> 감염과 면역, 한 문제씩 깊이 있게.</span><button data-action="settings">저장 및 백업 안내</button></footer></div>';
  updateSaveStatus();
}
function renderNavigation() {
  const r = getRoute(); const all = questions(); const stats = summarize(all, state);
  const navItem = (view, icon, label, count = '') => '<button class="nav-item ' + (r.view === view ? 'active' : '') + '" data-action="navigate" data-route="' + view + '">' + svg(icon) + '<span>' + label + '</span>' + (count !== '' ? '<span class="nav-count">' + count + '</span>' : '') + '</button>';
  document.querySelector('#navigation').innerHTML = navItem('home', 'grid', '학습 대시보드') + '<div class="nav-section-label bank-nav-heading">문제은행 선택</div>' + navItem('past','book','족보 기출', selectBankQuestions(allQuestions(),'past').length) + navItem('generated','spark','만든 문제',selectBankQuestions(allQuestions(),'generated').length) + '<div class="nav-section-label bank-nav-heading">분류를 섞어서 한 번에</div>' + navItem('mix-past','history','족보 전체 섞어 풀기') + navItem('mix-generated','history','만든 문제 전체 섞어 풀기') + '<div class="nav-divider"></div><div class="nav-section-label">'+bankName(activeBank)+' 학습 기록</div>' + navItem('wrong','wrong','오답 노트',stats.wrong) + navItem('bookmarks','bookmark','북마크',state.bookmarks.filter(id=>all.some(q=>q.id===id)).length) + navItem('history','history','학습 기록') + '<div class="nav-divider"></div><button class="nav-all-categories" data-action="categories">분류별로 찾아보기'+svg('chevron')+'</button>';

}
function getPool() {
  const r = getRoute();
  return questions().filter(q => {
    if (r.view === 'category' && q.category !== r.category) return false;
    if (r.view === 'wrong' && !(state.records[q.id]?.attempts && !state.records[q.id].lastCorrect)) return false;
    if (r.view === 'bookmarks' && !state.bookmarks.includes(q.id)) return false;
    if (filters.status === 'unconfirmed' && isGradable(q)) return false;
    if (filters.status === 'reviewed' && !q.assistantReview) return false;
    if (filters.status === 'unsolved' && state.records[q.id]?.attempts) return false;
    if (filters.status === 'wrong' && !(state.records[q.id]?.attempts && !state.records[q.id].lastCorrect)) return false;
    if (filters.status === 'correct' && !state.records[q.id]?.lastCorrect) return false;
    if (filters.difficulty !== 'all' && q.difficulty !== filters.difficulty) return false;
    const text = [q.title, q.stem, categoryName(q.category), ...(q.tags || [])].join(' ').toLowerCase();
    return !filters.search || text.includes(filters.search.toLowerCase());
  });
}
function render() {
  if (activeQuiz) return;
  const routeBank = getRoute().view;
  if (routeBank === 'past' || routeBank === 'mix-past') activeBank = 'past';
  if (routeBank === 'generated' || routeBank === 'mix-generated') activeBank = 'generated';
  if (state.activeBank !== activeBank) { state.activeBank = activeBank; persist(); }
  filters.search = ''; filters.status = 'all'; filters.difficulty = 'all'; listLimit = 10;
  renderNavigation(); updateSaveStatus();
  const r = getRoute();
  if (r.view === 'import') return renderImport();
  if (r.view === 'history') return renderHistory();
  if (r.view === 'settings') return renderSettings();
  if (r.view.startsWith('mix-')) return renderMixed();
  const stats = summarize(questions(), state);
  const home = r.view === 'home';
  const title = home ? '차근차근, 내 것으로.' : r.view === 'wrong' ? '틀린 문제에서, 한 걸음 더.' : r.view === 'bookmarks' ? '다시 보고 싶은 문제들.' : r.view === 'category' ? categoryName(r.category) : bankName(activeBank) + ' 문제은행.';
  const desc = home ? '족보의 흐름을 따라 정리하고, 오늘의 이해를 쌓아보세요.' : r.view === 'wrong' ? '최근 풀이에서 틀린 문제를 모았어요. 맞히면 오답 노트에서 빠집니다.' : r.view === 'bookmarks' ? '중요한 개념과 헷갈리는 문제를 따로 모아 복습하세요.' : '필요한 문제를 골라 나의 속도로 학습해 보세요.';
  const today = new Intl.DateTimeFormat('ko-KR', {timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'long'}).format(new Date());
  document.querySelector('#main-content').innerHTML = '<section class="page-heading"><div><div class="eyebrow">' + (home ? 'STUDY, AT YOUR OWN PACE' : 'MY QUESTION BANK') + '</div><h1>' + esc(title) + '</h1><p>' + esc(desc) + '</p></div><span class="today">' + svg('clock') + today + '</span></section>' + bankTabs() + (home ? renderHome(stats) : '<div class="bank-context">현재 선택: <strong>'+bankName(activeBank)+'</strong> · '+(activeBank==='past'?'원본 족보의 연도·문항·그림을 보존했습니다.':'직접 만든 응용·심화 문제입니다.')+'</div>') + '<section class="question-section"><div class="section-heading"><div><h2>' + (home ? '나의 문제은행' : r.view === 'wrong' ? '복습할 문제' : r.view === 'bookmarks' ? '저장한 문제' : '문제 목록') + ' <span id="pool-count">0</span></h2><p>' + (home ? '기출의 핵심부터 강의의 심화 개념까지' : '필터를 적용한 문제를 한 번에 풀 수 있어요.') + '</p></div><button class="text-button" data-action="import">' + svg('upload') + '채팅으로 문제 추가</button></div><div class="filter-row"><label class="search-box">' + svg('search') + '<input id="question-search" type="search" placeholder="문제, 주제, 키워드 검색" aria-label="문제 검색"></label><select id="status-filter" aria-label="풀이 상태"><option value="all">모든 상태</option><option value="unconfirmed">정답 확인 필요</option><option value="reviewed">검토 의견 있음</option><option value="unsolved">미풀이</option><option value="wrong">오답</option><option value="correct">정답</option></select><select id="difficulty-filter" aria-label="난이도"><option value="all">모든 난이도</option><option value="중">중</option><option value="중상">중상</option><option value="상">상</option></select></div><div id="question-list"></div><div class="study-bar"><div><strong id="ready-count"></strong><span>선택한 문제은행 안에서만 출제됩니다.</span></div><div class="study-controls"><select id="count-select" aria-label="풀 문제 수"><option value="all">전체 문항</option><option value="5">5문항</option><option value="10">10문항</option><option value="20">20문항</option></select><select id="mode-select" aria-label="풀이 모드"><option value="practice">학습 모드</option><option value="exam">시험 모드</option></select><button class="button primary" id="start-pool" data-action="start-pool">문제 풀기' + svg('arrow') + '</button></div></div></section>' + (home ? '<section class="bottom-note"><span>' + svg('spark') + '</span><div><strong>새로운 문제도, 같은 학습 공간에.</strong><p>면역노트를 만든 ChatGPT 대화에 강의록이나 새 문제를 첨부해 업데이트를 요청하세요.</p></div><button class="text-button" data-action="import">채팅 업데이트 안내' + svg('download') + '</button></section>' : '');
  document.querySelector('#question-search').addEventListener('input', e => { filters.search = e.target.value; listLimit = 10; renderList(); });
  document.querySelector('#status-filter').addEventListener('change', e => { filters.status = e.target.value; renderList(); });
  document.querySelector('#difficulty-filter').addEventListener('change', e => { filters.difficulty = e.target.value; renderList(); });
  document.querySelector('#count-select').value = filters.count;
  document.querySelector('#mode-select').value = filters.mode;
  document.querySelector('#count-select').addEventListener('change', e => filters.count = e.target.value);
  document.querySelector('#mode-select').addEventListener('change', e => filters.mode = e.target.value);
  renderList();
}
function renderHome(stats) {
  const homeIds = activeBank === 'generated' ? CATEGORIES.filter(c => questions().some(q => q.category === c.id)).map(c => c.id) : primaryIds;
  return '<section class="overview-grid"><div class="welcome-card"><div class="hero-kicker"><span class="live-dot"></span>오늘의 학습</div><h2>아는 개념을 넘어,<br>풀 수 있는 지식으로.</h2><p>감염과 면역 강의의 핵심부터.<br>기출의 연결고리를 한 문제씩 완성하세요.</p><button class="button dark" data-action="navigate" data-route="mix-' + activeBank + '">' + bankName(activeBank) + ' 섞어 풀기' + svg('arrow') + '</button><div class="hero-art" aria-hidden="true"><div class="art-ring ring-1"></div><div class="art-ring ring-2"></div><div class="art-ring ring-3"></div><div class="art-core">' + svg('leaf') + '</div><span class="art-label label-1">이해</span><span class="art-label label-2">연결</span><span class="art-label label-3">기억</span></div></div><div class="stats-stack"><div class="stat-card"><span class="stat-icon teal">' + svg('book') + '</span><div><span class="stat-label">전체 문제</span><strong>' + stats.total + '<small>문항</small></strong></div><span class="stat-side">나만의 문제은행</span></div><div class="stat-card"><span class="stat-icon lavender">' + svg('check') + '</span><div><span class="stat-label">학습 완료</span><strong>' + stats.solved + '<small>/ ' + stats.total + '</small></strong></div><div class="mini-progress" style="--progress:' + (stats.total ? stats.solved / stats.total * 100 : 0) + '%"><span>' + (stats.total ? Math.round(stats.solved / stats.total * 100) : 0) + '%</span></div></div><div class="stat-card"><span class="stat-icon peach">' + svg('wrong') + '</span><div><span class="stat-label">나의 정답률</span><strong>' + (stats.rate === null ? '—' : stats.rate + '<small>%</small>') + '</strong></div><span class="stat-side">' + (stats.rate === null ? '첫 문제를 풀어보세요' : '최근 답안 기준') + '</span></div></div></section><section class="categories-section"><div class="section-heading"><div><h2>분류별로 차근차근</h2><p>족보의 강의 분류에 맞춘 학습</p></div><button class="text-button" data-action="categories">전체 분류' + svg('chevron') + '</button></div><div class="category-grid">' + homeIds.map((id, i) => {
    const qs = questions().filter(q => q.category === id); const s = summarize(qs, state); const meta = [{n:'01',prof:'최은화 교수',en:'PATHOGENESIS',icon:'dna',desc:'감염의 시작과 숙주의 반응'},{n:'03',prof:'김택수 교수',en:'DIAGNOSIS',icon:'lab',desc:'검체부터 결과 해석까지'},{n:'04',prof:'김홍빈 교수',en:'TREATMENT',icon:'pill',desc:'근거를 연결하는 치료 원칙'}][primaryIds.indexOf(id)] || {n:String(category(id)?.order || i + 1).padStart(2, '0'),prof:category(id)?.professor ? category(id).professor + ' 교수' : '강의별 학습',en:id.replaceAll('-', ' ').toUpperCase(),icon:'lab',desc:'강의와 기출의 핵심 개념 연결'};
    return '<button class="category-card tone-' + (i % 3) + '" data-action="navigate" data-route="category/' + id + '"><div class="category-card-top"><span class="subject-icon">' + svg(meta.icon) + '</span><span class="subject-number">' + meta.n + '</span></div><span class="subject-en">' + meta.en + '</span><h3>' + esc(categoryName(id)) + '</h3><p>' + meta.desc + '</p><div class="subject-meta"><span>' + meta.prof + '</span><span>' + qs.length + '문항</span></div><div class="subject-progress"><span style="width:' + (qs.length ? s.solved / qs.length * 100 : 0) + '%"></span></div><div class="subject-footer"><span>' + s.solved + '/' + qs.length + ' 학습 완료</span>' + svg('arrow') + '</div></button>';
  }).join('') + '</div></section>';
}
function renderList() {
  const pool = getPool(); const ready = pool.filter(isGradable);
  document.querySelector('#pool-count').textContent = pool.length;
  document.querySelector('#ready-count').textContent = ready.length + '문항 준비 완료' + (pool.length > ready.length ? ' · 정답 확인 필요 ' + (pool.length-ready.length) + '문항' : '');
  document.querySelector('#start-pool').disabled = !ready.length;
  if (!pool.length) {
    document.querySelector('#question-list').innerHTML = '<div class="empty-state"><span>' + svg(getRoute().view === 'wrong' ? 'check' : 'book') + '</span><h3>' + (getRoute().view === 'wrong' && !filters.search ? '아직 복습할 오답이 없어요.' : '조건에 맞는 문제가 없어요.') + '</h3><p>' + (getRoute().view === 'wrong' ? '문제를 풀고 나면 다시 살펴볼 문제가 여기에 모입니다.' : '검색 조건을 바꾸거나 새로운 문제를 추가해 보세요.') + '</p><button class="button secondary" data-action="' + (getRoute().view === 'wrong' ? 'all-questions' : 'import') + '">' + (getRoute().view === 'wrong' ? '전체 문제 보기' : '문제 추가하기') + '</button></div>';
    return;
  }
  document.querySelector('#question-list').innerHTML = '<div class="question-table-header"><span>문제</span><span>난이도</span><span>학습 상태</span><span></span></div>' + pool.slice(0, listLimit).map((q, i) => {
    const record = state.records[q.id]; const status = !q.answer ? '확인 필요' : !record?.attempts ? '미풀이' : record.lastCorrect ? '정답' : '오답'; const statusClass = !q.answer ? 'needs-answer' : !record?.attempts ? 'unsolved' : record.lastCorrect ? 'correct' : 'incorrect';
    return '<div class="question-row"><button class="question-main" data-action="' + (isGradable(q) ? 'start-one' : 'read-past') + '" data-id="' + esc(q.id) + '"><span class="question-index">' + String(i + 1).padStart(2, '0') + '</span><span><span class="question-meta"><span>' + esc(categoryName(q.category)) + '</span><span class="meta-dot">·</span>' + esc(q.origin || '추가 문제') + (q.assistantReview ? '<span class="review-flag">검토 의견</span>' : '') + '</span><strong>' + esc(q.title || q.stem.slice(0, 45)) + '</strong><span class="question-snippet">' + esc(q.stem.replace(/\n/g, ' ').slice(0, 95)) + '</span></span></button><span class="difficulty ' + (q.difficulty === '중상' || q.difficulty === '상' ? 'higher' : '') + '">' + esc(q.difficulty || '중') + '</span><span class="question-status ' + statusClass + '"><span></span>' + status + '</span><button class="bookmark-button ' + (state.bookmarks.includes(q.id) ? 'bookmarked' : '') + '" data-action="bookmark" data-id="' + esc(q.id) + '" aria-label="' + (state.bookmarks.includes(q.id) ? '북마크 해제' : '북마크 추가') + '" aria-pressed="' + state.bookmarks.includes(q.id) + '">' + svg('bookmark') + '</button></div>';
  }).join('') + (pool.length > listLimit ? '<button class="load-more" data-action="load-more">문제 더 보기 <span>' + (pool.length - listLimit) + '개</span>' + svg('chevron') + '</button>' : '');
}
function cleanupQuiz() { cleanQuiz?.(); cleanQuiz = null; activeQuiz = null; }
function startQuiz(qs, mode = filters.mode, countChoice = filters.count, shuffle = false) {
  if (new Set(qs.map(getBank)).size > 1 || qs.some(q=>getBank(q)!==activeBank)) return toast('족보 기출과 만든 문제는 함께 출제할 수 없습니다.');
  const ready = qs.filter(isGradable);
  if (!ready.length) return toast('정답이 등록된 문제가 없습니다. 문제 가져오기에서 정답을 확인해 주세요.');
  const list = prepareBankSession(ready, {bank:activeBank,count:countChoice,shuffle});
  cleanupQuiz(); activeQuiz = { ids: list.map(q => q.id), mode, bank:activeBank, shuffled:shuffle };
  document.body.classList.remove('nav-open');
  const main = document.querySelector('#main-content'); main.innerHTML = ''; window.scrollTo(0, 0);
  cleanQuiz = mountQuiz(main, list, {
    mode, shuffle: false, categoryName, bank:activeBank, bankLabel:bankName(activeBank),
    onAnswer(answer) { recordAnswer(state, answer); persist(); renderNavigation(); },
    onBookmark(id) { toggleBookmark(id, false); },
    isBookmarked: id => state.bookmarks.includes(id),
    onExit() { cleanupQuiz(); render(); },
    onFinish(result) {
      const finishedIds = result.answers?.map(a => a.questionId) || list.map(q => q.id);
      state.sessions.unshift({ bank:activeBank, shuffled:shuffle, id: uid(), at: new Date().toISOString(), mode, total: result.total, correct: result.correct, elapsedMs: result.elapsedMs, questionIds: finishedIds, categories: [...new Set(questions().filter(q => finishedIds.includes(q.id)).map(q => q.category))] });
      state.sessions = state.sessions.slice(0, 100); persist(); renderNavigation();
    }
  });
}
function toggleBookmark(id, rerender = true) {
  const had = state.bookmarks.includes(id); state.bookmarks = had ? state.bookmarks.filter(x => x !== id) : [...state.bookmarks, id]; persist();
  if (rerender && document.querySelector('#question-list')) renderList(); renderNavigation();
  toast(had ? '북마크를 해제했습니다.' : '북마크에 저장했습니다.');
}
function showModal(content) {
  const root = document.querySelector('#modal-root'); const previous = document.activeElement;
  root.innerHTML = '<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><button class="modal-close icon-button" data-action="close-modal" aria-label="닫기">' + svg('close') + '</button>' + content + '</section></div>';
  const dialog = root.querySelector('.modal'); dialog.focus();
  const trap = e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const els = [...dialog.querySelectorAll('button,a,input,select,textarea,[tabindex="0"]')].filter(el => !el.disabled); const first = els[0], last = els.at(-1);
      if (!first) return e.preventDefault();
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  root._close = () => { document.removeEventListener('keydown', trap); root.innerHTML = ''; previous?.focus(); };
  document.addEventListener('keydown', trap);
}
function closeModal() { document.querySelector('#modal-root')._close?.(); }
function showCategories() {
  const all = questions();
  showModal('<div class="eyebrow">SYLLABUS</div><h2 id="modal-title">족보 분류 전체 보기</h2><p class="modal-intro">각 강의 분류에 문제를 추가하고 따로 학습할 수 있어요.</p><input class="category-search" id="category-search" type="search" placeholder="분류명 검색" aria-label="족보 분류 검색"><div id="all-category-list" class="all-category-list"></div>');
  function update(value = '') {
    const filtered = CATEGORIES.filter(c => c.name.includes(value));
    document.querySelector('#all-category-list').innerHTML = ['감염 질환', '면역 질환', '사례·실습'].map(group => {
      const items = filtered.filter(c => c.group === group);
      return !items.length ? '' : '<h3>' + group + '</h3>' + items.map(c => '<button data-action="choose-category" data-id="' + esc(c.id) + '"><span class="catalog-number">' + String(c.order).padStart(2, '0') + '</span><span>' + esc(c.name) + '</span><small>' + all.filter(q => q.category === c.id).length + '문항</small>' + svg('chevron') + '</button>').join('');
    }).join('') || '<p class="muted">검색 결과가 없습니다.</p>';
  }
  document.querySelector('#category-search').addEventListener('input', e => update(e.target.value)); update();
}
function categoryOptions(selected = '') { return '<option value="">문제의 분류 유지</option>' + CATEGORIES.map(c => '<option value="' + esc(c.id) + '" ' + (c.id === selected ? 'selected' : '') + '>' + esc(c.name) + '</option>').join(''); }
function renderImport() {
  preview = null;
  document.querySelector('#main-content').innerHTML = '<section class="page-heading"><div><div class="eyebrow">GROW YOUR QUESTION BANK</div><h1>새로운 문제를 담아보세요.</h1><p>문제와 정답·해설을 함께 가져오면 바로 학습할 수 있어요.</p></div></section><div class="import-layout"><section class="import-card"><div class="step-heading"><span>01</span><div><h2>문제 가져오기</h2><p>파일을 올리거나 ChatGPT 답변을 그대로 붙여넣으세요.</p></div></div><label class="drop-zone" id="drop-zone" tabindex="0">' + svg('upload') + '<strong>문제 파일을 여기에 놓아주세요</strong><span>또는 클릭하여 파일 선택</span><small>JSON · TXT · Markdown · CSV / 최대 10 MB</small><input type="file" id="question-file" accept=".json,.txt,.md,.markdown,.csv,text/plain,application/json" hidden></label><div class="or-divider"><span>또는 텍스트 붙여넣기</span></div><label class="field-label" for="import-text">문제 · 정답 · 해설</label><textarea id="import-text" placeholder="1. 문제 내용을 입력하세요.&#10;① 첫 번째 보기&#10;② 두 번째 보기&#10;③ 세 번째 보기&#10;④ 네 번째 보기&#10;⑤ 다섯 번째 보기&#10;정답: ③&#10;해설: 정답의 이유를 적어주세요."></textarea><label class="import-bank-field"><span class="field-label">문제 종류</span><select id="import-bank"><option value="generated" '+(activeBank==='generated'?'selected':'')+'>만든 문제</option><option value="past" '+(activeBank==='past'?'selected':'')+'>족보 기출</option></select></label><div class="form-row"><label><span class="field-label">추가할 족보 분류</span><select id="import-category">' + categoryOptions() + '</select></label><label><span class="field-label">문제 묶음 이름</span><input id="import-name" placeholder="예: 감염병 진단 복습 2차" maxlength="100"></label></div><p class="form-hint">분류가 없는 문제는 선택한 분류에 넣습니다. PDF·스캔본은 문제와 정답을 텍스트로 복사해 주세요.</p><button class="button primary import-parse" data-action="parse-import">문제 미리보기' + svg('arrow') + '</button><div id="import-feedback" aria-live="polite"></div></section><aside class="import-guide"><span class="guide-icon">' + svg('spark') + '</span><h3>어떤 문제든,<br>같은 흐름으로.</h3><p>번호와 보기, 정답이 있는 문제를 읽어 족보 분류에 맞춰 정리해요.</p><ol><li><strong>문제와 정답을 함께 준비</strong><span>정답이 없는 문제는 임의로 채우지 않아요.</span></li><li><strong>미리보기에서 확인</strong><span>분류와 정답을 확인하고 수정할 수 있어요.</span></li><li><strong>내 문제은행에 추가</strong><span>기존 문제와 함께 풀고 오답을 복습해요.</span></li></ol><div class="guide-download"><strong>처음이라면 양식부터</strong><button data-action="template-json">JSON 양식' + svg('download') + '</button><button data-action="template-markdown">텍스트 양식' + svg('download') + '</button></div><div class="guide-tip"><strong>ChatGPT에 이렇게 요청해 보세요</strong><p>“면역노트 JSON 양식에 맞춰 문제, 보기 5개, 정답 번호, 해설, 분류를 포함해 만들어줘.”</p><button class="text-button" data-action="copy-prompt">요청 문구 복사</button></div></aside></div><section id="import-preview"></section>';
  const input = document.querySelector('#question-file'); input.addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0]); });
  const zone = document.querySelector('#drop-zone');
  zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragging'); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); });
}
async function readFile(file) {
  if (file.size > 10 * 1024 * 1024) return toast('10 MB 이하의 문제 파일을 선택해 주세요.');
  if (!/\.(json|txt|md|markdown|csv)$/i.test(file.name)) return toast('JSON, TXT, Markdown, CSV 파일을 선택해 주세요.');
  try {
    importSource = file.name; document.querySelector('#import-text').value = await file.text();
    document.querySelector('#import-name').value = file.name.replace(/\.[^.]+$/, '');
    document.querySelector('#drop-zone strong').textContent = file.name;
    toast('파일을 읽었습니다. 미리보기에서 분류와 정답을 확인해 주세요.');
  } catch { toast('파일을 읽지 못했습니다. UTF-8 텍스트 파일인지 확인해 주세요.'); }
}
function parseUploaded() {
  const text = document.querySelector('#import-text').value.trim();
  if (!text) return toast('먼저 파일을 선택하거나 문제를 붙여넣어 주세요.');
  const selected = document.querySelector('#import-category').value;
  try {
    const data = parseImport(text, { category: selected, filename: importSource });
    const known = new Set(CATEGORIES.map(c => c.id));
    data.questions = data.questions.map(q => {
      const matched = CATEGORIES.find(c => c.id === q.category || c.name.replace(/\s/g, '') === String(q.category || '').replace(/\s/g, ''));
      return { ...q, bank: document.querySelector('#import-bank').value, category: matched?.id || (known.has(q.category) ? q.category : selected || ''), _originalCategory: q.category };
    });
    preview = { ...data, selectedCategory: selected, name: document.querySelector('#import-name').value.trim() || '새 문제 묶음', text };
    renderImportPreview();
    document.querySelector('#import-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) { document.querySelector('#import-feedback').innerHTML = '<p class="error-message">' + esc(error.message || '문제 형식을 확인해 주세요.') + '</p>'; }
}
function renderImportPreview() {
  const root = document.querySelector('#import-preview'); if (!preview) return;
  const warnings = preview.warnings || [];
  root.innerHTML = '<div class="preview-heading"><div class="step-heading"><span>02</span><div><h2>추가 전 확인</h2><p>' + preview.questions.length + '개 문제를 읽었습니다. 분류와 정답을 확인해 주세요.</p></div></div><button class="button primary" data-action="commit-import" ' + (!preview.questions.length ? 'disabled' : '') + '>문제은행에 추가' + svg('plus') + '</button></div>' + (warnings.length ? '<details class="import-warnings" open><summary>확인할 내용 ' + warnings.length + '개</summary><ul>' + warnings.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></details>' : '') + preview.questions.map((q, i) => '<article class="preview-card"><div class="preview-question"><span class="question-index">' + (i + 1) + '</span><strong>' + esc(q.title || q.stem.slice(0, 90)) + '</strong></div><p class="preview-stem">' + esc(q.stem) + '</p><ol class="preview-options">' + q.options.map(o => '<li>' + esc(o) + '</li>').join('') + '</ol><div class="preview-fields"><label><span class="field-label">족보 분류</span><select data-preview-category="' + i + '"><option value="">분류를 선택하세요</option>' + CATEGORIES.map(c => '<option value="' + esc(c.id) + '" ' + (q.category === c.id ? 'selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></label><label><span class="field-label">정답</span><select data-preview-answer="' + i + '"><option value="">정답 선택 필요</option>' + q.options.map((_, n) => '<option value="' + (n + 1) + '" ' + (q.answer === n + 1 ? 'selected' : '') + '>' + (n + 1) + '번</option>').join('') + '</select></label></div>' + (q.explanation ? '<details><summary>가져온 해설 확인</summary><p class="preview-explanation">' + esc(q.explanation) + '</p></details>' : '<p class="form-hint">해설이 없는 문제입니다.</p>') + '</article>').join('');
  root.querySelectorAll('[data-preview-category]').forEach(el => el.addEventListener('change', e => preview.questions[Number(e.target.dataset.previewCategory)].category = e.target.value));
  root.querySelectorAll('[data-preview-answer]').forEach(el => el.addEventListener('change', e => Object.assign(preview.questions[Number(e.target.dataset.previewAnswer)], {answer:e.target.value ? Number(e.target.value) : null,acceptedAnswers:e.target.value?[Number(e.target.value)]:[],answerMode:'single'})));
}
function commitImport() {
  if (!preview?.questions.length) return;
  const invalid = preview.questions.findIndex(q => !category(q.category) || !Number.isInteger(q.answer) || q.answer < 1 || q.answer > q.options.length);
  if (invalid !== -1) return toast((invalid + 1) + '번 문제의 분류와 정답을 확인해 주세요.');
  const seen = new Set(allQuestions().map(q => [getBank(q), q.stem.trim(), ...q.options].join('|')));
  const added = [];
  for (const q of preview.questions) {
    const signature = [getBank(q), q.stem.trim(), ...q.options].join('|'); if (seen.has(signature)) continue; seen.add(signature);
    const { _originalCategory, ...clean } = q;
    added.push({ ...clean, id: 'import-' + uid(), origin: q.origin || '추가 문제', importedAt: new Date().toISOString(), setName: preview.name });
  }
  if (!added.length) return toast('모든 문제가 이미 문제은행에 있습니다. 중복으로 추가하지 않았습니다.');
  state.customQuestions.push(...added);
  state.imports.unshift({ id: uid(), name: preview.name, at: new Date().toISOString(), count: added.length, questionIds: added.map(q => q.id) });
  persist(); activeBank = getBank(added[0]); state.activeBank=activeBank; preview = null; navigate(activeBank); toast(added.length + '개 문제를 추가했습니다.');
}
function showChatUpdates() {
  showModal('<div class="eyebrow">CHAT TO PUBLISH</div><h2 id="modal-title">이 채팅에서 문제은행 업데이트</h2><p class="modal-intro">면역노트를 만든 ChatGPT·Codex 채팅에 새 강의록, 족보 또는 문제 파일을 첨부해 주세요.</p><div class="info-box"><strong>파일 첨부 → 내용 검토 → 사이트 갱신</strong><p>제가 이 채팅에서 파일을 읽고 족보 분류에 맞춰 반영한 뒤, 게시본을 업데이트합니다. 새 질문을 처리할 때 적용되는 방식이며 상시 자동 감시 기능은 아닙니다.</p></div><p class="modal-intro">족보 원문과 만든 문제는 각각의 문제은행에 들어갑니다. 오류가 의심되면 원답과 별도로 검토 의견을 남깁니다. 새로 반영된 문제는 사이트를 새로고침하면 표시됩니다.</p><button class="button secondary" data-action="local-import">고급 · 이 브라우저에만 파일 가져오기</button>');
}
function renderMixed() {
  const pool = questions(); const ready = pool.filter(isGradable);
  const used = CATEGORIES.filter(c=>ready.some(q=>q.category===c.id));
  document.querySelector('#main-content').innerHTML='<section class="page-heading"><div><div class="eyebrow">SHUFFLE & STUDY</div><h1>'+bankName(activeBank)+' 전체 섞어 풀기</h1><p>여러 분류의 문제를 무작위로 섞어 한 번에 풀어보세요.</p></div></section>'+bankTabs()+'<section class="mixed-panel"><div class="mix-bank-lock">'+svg('check')+'<strong>'+bankName(activeBank)+'만 출제</strong><span>'+(activeBank==='past'?'만든 문제':'족보 기출')+'는 포함되지 않습니다.</span></div><div class="mixed-overview"><span class="subject-icon">'+svg('history')+'</span><div><h2>'+ready.length+'문항 · '+used.length+'개 분류</h2><p>문제 순서는 섞고, 보기 순서는 원문 그대로 유지합니다.</p></div></div><div class="mix-filters"><label><span class="field-label">풀 문제 수</span><select id="mix-count"><option value="all">전체 '+ready.length+'문항</option><option value="10">무작위 10문항</option><option value="20">무작위 20문항</option><option value="50">무작위 50문항</option></select></label><label><span class="field-label">풀이 방식</span><select id="mix-mode"><option value="practice">학습 모드 · 바로 채점</option><option value="exam">시험 모드 · 마지막에 채점</option></select></label><label><span class="field-label">문제 범위</span><select id="mix-status"><option value="all">모든 문제</option><option value="unsolved">미풀이만</option><option value="wrong">오답만</option></select></label></div><button class="button primary mix-start" data-action="start-mixed" '+(!ready.length?'disabled':'')+'>'+bankName(activeBank)+' 섞어서 시작'+svg('arrow')+'</button><div class="mix-legend">포함된 분류</div><div class="mix-category-tags">'+used.map(c=>'<span>'+esc(c.name)+' <small>'+ready.filter(q=>q.category===c.id).length+'</small></span>').join('')+'</div>'+(pool.length>ready.length?'<p class="mix-note">정답 확인이 필요한 '+(pool.length-ready.length)+'문항은 자동 채점에서 제외됩니다. 문제은행에서 원문을 확인하고 정답을 직접 등록할 수 있습니다.</p>':'')+'</section>';
}
function launchMixed() {
  const count=document.querySelector('#mix-count').value, mode=document.querySelector('#mix-mode').value, status=document.querySelector('#mix-status').value;
  const pool=questions().filter(q=>status==='all'||status==='unsolved'&&!state.records[q.id]?.attempts||status==='wrong'&&state.records[q.id]?.attempts&&!state.records[q.id].lastCorrect);
  startQuiz(pool, mode, count, true);
}
function safeScanUrl(url) { return typeof url==='string' && (/^\.\/data\/past-images\/[a-z0-9-]+\.webp$/.test(url)||/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(url)); }
function readPast(id) {
  const q=questions().find(q=>q.id===id); if(!q) return;
  showModal('<h2 id="modal-title">'+esc(q.title)+'</h2><p class="modal-intro">'+esc(q.source)+'</p><div class="unconfirmed-notice">원문 답안표에 일치하는 정답이 없어 자동 채점에서 제외한 문항입니다. 정답을 확인한 뒤 직접 등록할 수 있습니다.</div><div class="past-scan-reader">'+(q.scanImages||[]).filter(safeScanUrl).map((src,i)=>'<img data-scan-src="'+esc(src)+'" alt="족보 원문 '+(i+1)+'" loading="lazy">').join('')+'</div><details><summary>추출된 원문 텍스트</summary><p class="preview-stem">'+esc(q.stem)+'</p></details><label class="manual-answer-field"><span class="field-label">확인한 정답 직접 등록</span><select id="manual-answer"><option value="">정답 선택</option>'+q.options.map((_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'번</option>').join('')+'</select></label><button class="button primary" data-action="save-manual-answer" data-id="'+esc(q.id)+'">정답 등록</button>');
  document.querySelectorAll('.past-scan-reader img[data-scan-src]').forEach(img=>bindScanImage(img,img.dataset.scanSrc));
}
function saveManualAnswer(id) {
  const value=Number(document.querySelector('#manual-answer')?.value);
  if(!Number.isInteger(value)||value<1||value>5)return toast('확인한 정답을 선택해 주세요.');
  state.answerOverrides={...(state.answerOverrides||{}),[id]:value};persist();closeModal();render();toast('직접 확인한 정답을 등록했습니다.');
}
function renderHistory() {
  const stats = summarize(questions(), state);
  document.querySelector('#main-content').innerHTML = '<section class="page-heading"><div><div class="eyebrow">YOUR LEARNING JOURNEY</div><h1>'+bankName(activeBank)+' 학습 기록.</h1><p>선택한 문제은행의 학습 기록만 표시합니다.</p></div></section><div class="history-summary"><div><span>완료한 풀이</span><strong>' + state.sessions.filter(s=>(s.bank||'generated')===activeBank).length + '<small>회</small></strong></div><div><span>학습한 문제</span><strong>' + stats.solved + '<small>문항</small></strong></div><div><span>최근 답안 정답률</span><strong>' + (stats.rate ?? '—') + '<small>' + (stats.rate === null ? '' : '%') + '</small></strong></div></div><section class="history-list"><div class="section-heading"><div><h2>최근 학습 기록</h2><p>최근 100회의 완료 기록을 보관합니다.</p></div></div>' + (state.sessions.filter(s=>(s.bank||'generated')===activeBank).length ? state.sessions.filter(s=>(s.bank||'generated')===activeBank).map(s => '<div class="history-row"><span class="stat-icon teal">' + svg(s.mode === 'exam' ? 'clock' : 'book') + '</span><div><strong>' + esc(s.categories.map(categoryName).join(' · ')) + '</strong><small>' + timestamp(s.at) + ' · ' + (s.mode === 'exam' ? '시험 모드' : '학습 모드') + '</small></div><span class="history-score">' + s.correct + '<small> / ' + s.total + ' 정답</small></span><button class="button secondary small" data-action="retry-session" data-id="' + esc(s.id) + '">다시 풀기</button></div>').join('') : '<div class="empty-state"><span>' + svg('history') + '</span><h3>첫 번째 학습 기록을 기다리고 있어요.</h3><p>문제풀이를 완료하면 결과가 여기에 쌓입니다.</p><button class="button primary" data-action="all-questions">문제 보러 가기</button></div>') + '</section>';
}
function renderSettings() {
  document.querySelector('#main-content').innerHTML = '<section class="page-heading"><div><div class="eyebrow">KEEP YOUR LEARNING SAFE</div><h1>나의 학습 데이터.</h1><p>추가한 문제와 기록을 백업하고 다른 브라우저로 옮길 수 있어요.</p></div></section><section class="settings-card"><h2>문제 · 학습 기록 백업</h2><p>추가한 문제, 오답 기록, 북마크와 학습 기록을 하나의 파일로 내려받습니다. 기본 족보 기출과 채팅을 통해 게시한 제작 문제는 사이트에 포함되어 있어요.</p><div class="settings-actions"><button class="button primary" data-action="backup">' + svg('download') + '백업 내려받기</button><label class="button secondary">' + svg('upload') + '백업 복원<input type="file" id="restore-file" accept=".json,application/json" hidden></label></div><div class="info-box"><strong>현재 브라우저에 저장됩니다.</strong><p>다른 기기와 자동 동기화되지 않습니다. 브라우저 데이터를 지우거나 기기를 바꾸기 전 백업 파일을 보관해 주세요. 백업 복원은 현재 기록을 대체합니다.</p></div></section><section class="settings-card"><h2>문제 양식과 내보내기</h2><p>이 양식을 ChatGPT에 전달하면 앞으로 만든 문제를 간편하게 가져올 수 있습니다.</p><div class="settings-actions"><button class="button secondary" data-action="template-json">JSON 양식</button><button class="button secondary" data-action="template-markdown">텍스트 양식</button><button class="button secondary" data-action="export-questions">현재 문제은행 내보내기</button></div></section><section class="settings-card"><h2>학습 기록 초기화</h2><p>추가한 문제와 북마크는 유지하고, 정답·오답 및 풀이 기록만 초기화합니다.</p><button class="button danger" data-action="reset-progress">학습 기록 초기화</button></section>';
  document.querySelector('#restore-file').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 20 * 1024 * 1024) return toast('20 MB 이하의 백업 파일을 선택해 주세요.');
    try {
      const restored = restoreBackup(JSON.parse(await file.text()));
      for (const q of restored.customQuestions) {
        if (!q.id || typeof q.stem !== 'string' || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 10 || !q.options.every(o => typeof o === 'string') || !Number.isInteger(q.answer) || q.answer < 1 || q.answer > q.options.length || !category(q.category)) throw new Error('백업의 문제 형식을 확인해 주세요.');
      }
      if (!confirm('현재 문제와 학습 기록을 백업 파일의 내용으로 대체할까요? 먼저 현재 기록을 백업하는 것을 권장합니다.')) return;
      state = restored; persist(); render(); toast('백업을 복원했습니다.');
    } catch (error) { toast(error.message || '백업을 읽지 못했습니다.'); }
  });
}
document.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]'); if (!target) return;
  const action = target.dataset.action;
  if (action === 'navigate') return navigate(target.dataset.route);
  if (action === 'import') return showChatUpdates();
  if (action === 'local-import') return navigate('import');
  if (action === 'settings') return navigate('settings');
  if (action === 'all-questions') return navigate('library');
  if (action === 'menu') return document.body.classList.toggle('nav-open');
  if (action === 'close-nav') return document.body.classList.remove('nav-open');
  if (action === 'bookmark') return toggleBookmark(target.dataset.id);
  if (action === 'categories') return showCategories();
  if (action === 'close-modal') return closeModal();
  if (action === 'choose-category') { closeModal(); return navigate('category/' + target.dataset.id); }
  if (action === 'load-more') { listLimit += 20; return renderList(); }
  if (action === 'start-pool') return startQuiz(getPool());
  if (action === 'start-all') return startQuiz(questions(), filters.mode, 'all');
  if (action === 'read-past') return readPast(target.dataset.id);
  if (action === 'start-mixed') return launchMixed();
  if (action === 'save-manual-answer') return saveManualAnswer(target.dataset.id);
  if (action === 'start-one') return startQuiz(questions().filter(q => q.id === target.dataset.id));
  if (action === 'retry-session') { const s = state.sessions.find(s => s.id === target.dataset.id); if (!s) return; activeBank=s.bank||'generated';state.activeBank=activeBank; return startQuiz(questions().filter(q => s.questionIds.includes(q.id)), s.mode, 'all', Boolean(s.shuffled)); }
  if (action === 'parse-import') return parseUploaded();
  if (action === 'commit-import') return commitImport();
  if (action === 'backup') return backup();
  if (action === 'template-json') return download('면역노트-문제양식.json', IMPORT_TEMPLATE_JSON);
  if (action === 'template-markdown') return download('면역노트-문제양식.md', IMPORT_TEMPLATE_MARKDOWN, 'text/markdown');
  if (action === 'export-questions') return download('면역노트-'+bankName(activeBank)+'-문제.json', { version: 1, bank:activeBank, questions: questions() });
  if (action === 'copy-prompt') {
    const prompt = '아래 면역노트 JSON 형식으로 객관식 문제를 만들어줘. category는 족보 강의명, answer는 1부터 시작하는 정답 번호이고 보기는 5개야. 설명과 출처도 포함해줘.\n' + (typeof IMPORT_TEMPLATE_JSON === 'string' ? IMPORT_TEMPLATE_JSON : JSON.stringify(IMPORT_TEMPLATE_JSON, null, 2));
    try { await navigator.clipboard.writeText(prompt); toast('요청 문구를 복사했습니다.'); } catch { showModal('<h2 id="modal-title">요청 문구 복사</h2><textarea class="copy-area" readonly>' + esc(prompt) + '</textarea>'); document.querySelector('.copy-area').select(); }
  }
  if (action === 'reset-progress' && confirm('정답·오답 및 풀이 기록을 초기화할까요? 추가한 문제와 북마크는 유지됩니다.')) { state.records = {}; state.sessions = []; persist(); render(); toast('학습 기록을 초기화했습니다.'); }
});
window.addEventListener('hashchange', () => { if (activeQuiz) cleanupQuiz(); render(); window.scrollTo(0, 0); });
shell(); render();
