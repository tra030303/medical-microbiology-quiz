import { CBL_MODULES, CBL_CASE_INDEX } from '../data/cbl-index.js';
import { CBL_CASES } from '../data/cbl-guides.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const route = c => '#/cbl/' + c.module + '/' + c.id;
const items = values => '<ul>' + values.map(v => '<li>' + esc(v) + '</li>').join('') + '</ul>';
function table(headers, rows) {
  return '<div class="cbl-table-wrap" tabindex="0" role="region" aria-label="' + esc(headers.join(' · ')) + '"><table><thead><tr>' + headers.map(h => '<th scope="col">'+esc(h)+'</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map((v,i) => i ? '<td>'+esc(v)+'</td>' : '<th scope="row">'+esc(v)+'</th>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
function moduleTabs(id) {
  return '<nav class="cbl-module-tabs" aria-label="CBL 선택"><a href="#/cbl" '+(!id?'aria-current="page"':'')+'>전체 증례</a>' + CBL_MODULES.map(m => '<a href="#/cbl/'+m.id+'" '+(m.id===id?'aria-current="page"':'')+'>'+esc(m.label)+' <span>'+m.caseIds.length+'개 증례</span></a>').join('')+'</nav>';
}
function practiceButton(caseId, label, cls='primary') {
  return '<button class="button '+cls+'" data-action="cbl-practice" data-case-id="'+esc(caseId)+'">'+esc(label)+'</button>';
}
function references(c) {
  return '<section class="cbl-section cbl-references" aria-labelledby="cbl-refs"><h2 id="cbl-refs">출처</h2><p class="cbl-lecture-source"><strong>필기본</strong> '+esc(c.source.filename)+' · 실제 PDF '+c.source.pages.join('·')+'쪽</p><p class="cbl-muted">위 정리는 필기본을 재구성했습니다. AI 보충·정정은 아래 근거와 구분해 표시합니다.</p><ul>'+c.references.map(r => '<li id="cbl-ref-'+esc(r.id)+'">'+(/^https:\/\//.test(r.url)?'<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.label)+'</a>':esc(r.label))+'</li>').join('')+'</ul></section>';
}
function caseCard(c) {
  return '<article class="cbl-case-card"><a href="'+route(c)+'"><span class="cbl-case-number">증례 '+c.number+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.summary)+'</p><span class="cbl-card-link">증례 해설 읽기 <span aria-hidden="true">→</span></span></a><div class="cbl-card-practice">'+practiceButton(c.id,'이 증례 '+CBL_CASE_INDEX[c.id].questionIds.length+'문제','secondary')+'</div></article>';
}

/** Guides are independent reading pages. Opening one never records an attempt. */
export function renderCblPage(container, { moduleId, caseId, findQuestion = () => null } = {}) {
  const module = CBL_MODULES.find(m => m.id === moduleId);
  const selected = CBL_CASES.find(c => c.id === caseId && c.module === moduleId);
  if ((moduleId && !module) || (caseId && !selected)) {
    container.innerHTML='<section class="page-heading"><div><h1>증례를 찾을 수 없습니다.</h1><p>CBL 목록에서 증례를 다시 선택해 주세요.</p></div></section><a class="button secondary" href="#/cbl">전체 증례 보기</a>';
    return () => {};
  }
  if (selected) {
    const c=selected, index=CBL_CASE_INDEX[c.id], siblings=CBL_CASES.filter(x=>x.module===c.module);
    const current=siblings.findIndex(x=>x.id===c.id), previous=siblings[current-1], next=siblings[current+1];
    const past=c.pastConnections.map(link=>{const q=findQuestion(link.id);return q?'<li><button class="cbl-past-link" data-action="cbl-past" data-id="'+esc(q.id)+'">'+esc(q.title)+' · 족보 보기</button><p>'+esc(link.point)+'</p></li>':'';}).join('');
    container.innerHTML='<div class="cbl-page">'+moduleTabs(module.id)+'<a class="cbl-back" href="#/cbl/'+module.id+'">← '+esc(module.label)+' 증례 목록</a><header class="cbl-detail-heading"><div class="eyebrow">CASE-BASED LEARNING</div><p class="cbl-kicker">'+esc(module.label)+' · 증례 '+c.number+'</p><h1>'+esc(c.title)+'</h1><p>'+esc(module.subtitle)+'</p><div class="cbl-actions">'+practiceButton(c.id,'이 증례 '+index.questionIds.length+'문제 풀기')+'<button class="button secondary" data-action="cbl-module-practice" data-module-id="'+module.id+'">'+esc(module.label)+' '+module.questionCount+'문제 섞어 풀기</button></div></header>'+
      '<div class="cbl-detail-layout"><article class="cbl-reading"><section class="cbl-section cbl-summary"><h2>증례 요약</h2><p>'+esc(c.summary)+'</p></section>'+
      '<section class="cbl-section"><h2>핵심 소견과 의미</h2>'+table(['소견','해석'],c.findings)+'</section>'+
      '<section class="cbl-section"><h2>진단과 추론</h2>'+table(['항목','판단'],c.diagnosis)+'<ol class="cbl-reasoning">'+c.reasoning.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></section>'+
      '<section class="cbl-section"><h2>감별진단</h2>'+table(['감별','비교할 점','확인·해석'],c.differential)+'</section>'+
      '<section class="cbl-section"><h2>검사 선택과 해석</h2>'+table(['검사·평가','목적과 주의점'],c.tests)+'</section>'+
      '<section class="cbl-section"><h2>치료·감염관리 원칙</h2>'+items(c.management)+'</section>'+
      '<section class="cbl-section cbl-lecture-focus"><h2>필기본의 핵심</h2>'+items(c.lectureFocus)+'</section>'+
      '<section class="cbl-section cbl-ai-section"><h2>AI 보충·정정</h2><p class="cbl-muted">필기본의 답안과 구분한 설명입니다. 조건·근거의 범위를 함께 확인하세요.</p>'+c.aiNotes.map(n=>'<article class="cbl-ai-note"><span class="cbl-note-type">'+esc(n.type)+'</span><h3>'+esc(n.title)+'</h3><p>'+esc(n.text)+'</p><p class="cbl-note-refs">근거: '+n.refs.map(id=>{const r=c.references.find(x=>x.id===id);return r?'<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.label)+'</a>':'';}).join(' · ')+'</p></article>').join('')+'</section>'+
      '<section class="cbl-section cbl-exam-points"><h2>문제에서 구별할 포인트</h2>'+items(c.examPoints)+'</section>'+
      '<section class="cbl-section"><h2>족보와 연결해서 보기</h2><p class="cbl-muted">해마다 증례가 달라 직접 같은 증례가 아닌 문항도 있습니다. 아래에는 연결되는 출제 원리를 표시했습니다.</p><ul class="cbl-past-list">'+past+'</ul></section>'+references(c)+
      '<section class="cbl-practice-end"><h2>정리한 내용을 문제로 확인하기</h2><p>새 문제와 족보는 각각의 문제은행에서 출제됩니다.</p>'+practiceButton(c.id,'이 증례 '+index.questionIds.length+'문제 풀기')+'</section></article>'+
      '<aside class="cbl-case-sidebar" aria-label="같은 CBL의 증례"><h2>'+esc(module.label)+' 증례</h2>'+siblings.map(x=>'<a href="'+route(x)+'" '+(x.id===c.id?'aria-current="page"':'')+'><span>증례 '+x.number+'</span>'+esc(x.title)+'</a>').join('')+'</aside></div>'+
      '<nav class="cbl-neighbor-nav" aria-label="이전·다음 증례">'+(previous?'<a href="'+route(previous)+'">← 증례 '+previous.number+'</a>':'<span></span>')+(next?'<a href="'+route(next)+'">증례 '+next.number+' →</a>':'<a href="#/cbl">전체 증례 →</a>')+'</nav></div>';
    return () => {};
  }
  const pool=module?CBL_CASES.filter(c=>c.module===module.id):CBL_CASES;
  container.innerHTML='<div class="cbl-page"><section class="page-heading"><div><div class="eyebrow">CASE-BASED LEARNING</div><h1>'+(module?esc(module.label)+' 증례 해설':'CBL 증례 해설')+'</h1><p>핵심 소견에서 진단·검사·치료까지, 증례의 판단 흐름을 정리하세요.</p></div></section>'+moduleTabs(module?.id)+'<div class="cbl-overview"><div><strong>'+pool.length+'개 증례</strong><span>필기본 정리 · AI 보충 · 관련 기출 · 증례 문제</span></div>'+(module?'<button class="button primary" data-action="cbl-module-practice" data-module-id="'+module.id+'">'+module.questionCount+'문제 섞어 풀기</button>':'<button class="button primary" data-action="cbl-all-practice">CBL 새 문제 60문항 섞어 풀기</button>')+'</div><label class="search-box cbl-search">증례 검색<input id="cbl-search" type="search" placeholder="예: 간농양, 자반, 격리, 칸디다" aria-label="CBL 증례 검색"></label><p class="cbl-search-count" role="status" aria-live="polite"></p><div id="cbl-case-groups"></div></div>';
  const input=container.querySelector('#cbl-search'), groups=container.querySelector('#cbl-case-groups'), status=container.querySelector('.cbl-search-count');
  function update() {
    const query=input.value.trim().toLocaleLowerCase('ko-KR');
    const filtered=pool.filter(c=>[c.title,c.summary,...c.examPoints,...c.findings.flat()].join(' ').toLocaleLowerCase('ko-KR').includes(query));
    status.textContent=filtered.length+'개 증례';
    groups.innerHTML=filtered.length?CBL_MODULES.map(m=>{const cases=filtered.filter(c=>c.module===m.id);return !cases.length?'':'<section class="cbl-case-group"><header><div><h2>'+esc(m.label)+' · '+esc(m.title)+'</h2><p>'+esc(m.subtitle)+'</p></div></header><div class="cbl-case-grid">'+cases.map(caseCard).join('')+'</div></section>';}).join(''):'<div class="empty-state"><h2>일치하는 증례가 없습니다.</h2><p>다른 증상이나 병원체 이름으로 찾아보세요.</p></div>';
  }
  input.addEventListener('input',update);update();
  return () => input.removeEventListener('input',update);
}
