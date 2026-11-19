import { summarizeOx } from './ox-model.js';
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pending;
export function loadOxQuestions() { return pending ||= import('../data/ox-questions.js').then(m=>m.OX_QUESTIONS); }
function sourceHtml(q,lectures) {
  const lecture=lectures.find(l=>l.id===q.lecture);
  const references=(q.references||[]).filter(r=>/^https:\/\//.test(r.url));
  const specific=(Array.isArray(q.sourceRefs)?q.sourceRefs:[]).filter(r=>Number.isInteger(r.index)&&lecture?.sources?.[r.index]&&Array.isArray(r.pages)&&r.pages.length);
  const sourceText=specific.length?specific.map(r=>'<p>'+esc(lecture.sources[r.index].name)+' · 실제 PDF '+r.pages.map(Number).join(', ')+'쪽</p>').join(''):(lecture?.sources||[]).map(s=>'<p>'+esc(s.name)+'</p>').join('')+(q.pages?.length?'<p>첫 번째 출처의 실제 PDF '+q.pages.map(Number).join(', ')+'쪽</p>':'');
  return '<div class="ox-source"><strong>강의록 출처</strong><p>'+esc(lecture?.title||'')+' · '+esc(q.topic)+'</p>'+sourceText+(q.note?'<p class="ox-source-note">'+esc(q.note)+'</p>':'')+(q.guideId?'<a href="#/cbl/'+esc(q.lecture)+'/'+esc(q.guideId)+'" data-action="cbl-guide" data-case-id="'+esc(q.guideId)+'">이 증례의 전체 해설 읽기 →</a>':'')+(references.length?'<p><strong>AI 보충 근거</strong></p><ul>'+references.map(r=>'<li><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.label)+'</a></li>').join('')+'</ul>':'')+'</div>';
}
function feedbackHtml(q,lectures,selected) {
  return '<section class="ox-feedback '+(selected===q.answer?'is-correct':'is-wrong')+'" aria-live="polite"><h2>'+(selected===q.answer?'맞았어요.':'다시 확인해 보세요.')+' <span>정답 '+(q.answer?'O':'X')+'</span></h2><p>'+esc(q.explanation)+'</p><details><summary>강의록 출처 보기</summary>'+sourceHtml(q,lectures)+'</details></section>';
}
export function renderOxPage(container,{wrong=false,progress,lectures,tabs='',onStart,onError=()=>{}}) {
  let disposed=false;
  container.innerHTML='<section class="page-heading"><div><div class="eyebrow">ONE CONCEPT AT A TIME</div><h1>'+(wrong?'OX 오답 노트':'기본 개념 OX')+'</h1><p>'+(wrong?'최근에 틀린 OX만 모았어요. 다시 맞히면 이 목록에서 빠집니다.':'한 문장씩, 알고 있는 개념인지 확인해 보세요. 답을 고르면 짧은 해설이 나옵니다.')+'</p></div></section>'+tabs+'<div class="ox-page" aria-busy="true"><p class="ox-loading" role="status">OX 문제를 불러오고 있어요.</p></div>';
  const host=container.querySelector('.ox-page');
  function render(questions) {
    if(disposed)return;
    const stats=summarizeOx(questions,progress),wrongPool=questions.filter(q=>progress.records[q.id]?.attempts&&!progress.records[q.id].lastCorrect);
    const cursor=progress.cursor>=questions.length?0:progress.cursor;
    const options='<option value="10">10문항</option><option value="30" selected>30문항</option><option value="50">50문항</option><option value="100">100문항</option><option value="all">전체</option>';
    host.removeAttribute('aria-busy');
    if(wrong){
      host.innerHTML='<section class="ox-wrong-overview"><div><span class="eyebrow">REVIEW YOUR OX</span><h2>복습할 OX '+wrongPool.length+'문항</h2><p>족보·객관식 오답과 구분해 저장합니다.</p></div><a class="button secondary" href="#/ox">전체 OX로</a></section>'+(wrongPool.length?'<div class="ox-wrong-actions"><label>한 번에 풀 문제 수 <select id="ox-count">'+options+'</select></label><button class="button primary" data-ox-start="wrong">OX 오답 순서대로 풀기</button><button class="button secondary" data-ox-start="wrong-shuffled">OX 오답 섞어 풀기</button></div><div class="ox-wrong-list"></div><button class="button secondary ox-more" data-ox-more>더 보기</button>':'<div class="empty-state"><h2>모아둔 OX 오답이 없어요.</h2><p>OX를 풀면 틀린 개념이 이곳에 모입니다.</p><a class="button primary" href="#/ox">OX 풀러 가기</a></div>');
      let limit=20;
      const renderList=()=>{host.querySelector('.ox-wrong-list').innerHTML=wrongPool.slice(0,limit).map(q=>'<article class="ox-wrong-card"><div class="ox-wrong-title"><span>OX '+String(q.order).padStart(4,'0')+'</span><button class="text-button" data-ox-one="'+esc(q.id)+'">다시 풀기 →</button></div><h3>'+esc(q.statement)+'</h3><details><summary>정답·해설 보기</summary><p><strong>정답 '+(q.answer?'O':'X')+'</strong> · '+esc(q.explanation)+'</p>'+sourceHtml(q,lectures)+'</details></article>').join('');host.querySelector('[data-ox-more]').hidden=limit>=wrongPool.length;};
      if(wrongPool.length){renderList();host.querySelector('[data-ox-more]').addEventListener('click',()=>{limit+=20;renderList();});}
    }else{
      host.innerHTML='<section class="ox-stats" aria-label="OX 학습 현황">'+[['전체 OX',stats.total],['풀어본 문제',stats.solved],['OX 오답',stats.wrong],['최근 답안 정답률',stats.rate===null?'—':stats.rate+'%']].map(([label,value])=>'<div><span>'+label+'</span><strong>'+value+'</strong></div>').join('')+'</section><div class="ox-session-options"><label for="ox-count">한 번에 풀 문제 수</label><select id="ox-count">'+options+'</select><a href="#/wrong/ox">OX 오답 '+stats.wrong+'문항 보기 →</a></div><section class="ox-mode-grid"><article class="ox-mode-card"><span class="ox-mode-symbol" aria-hidden="true">01 →</span><h2>순서대로 풀기</h2><p>자료 순서대로 개념을 쌓아보세요.<br>채점한 다음 문제부터 이어서 시작합니다.</p><span class="ox-resume">'+(progress.cursor>=questions.length?'끝까지 풀었어요. 처음부터 다시 시작할 수 있어요.':'다음은 OX '+String(cursor+1).padStart(4,'0')+'번입니다.')+'</span><button class="button primary" data-ox-start="ordered">'+(progress.cursor>0&&progress.cursor<questions.length?'이어서 풀기':'순서대로 시작')+'</button>'+(progress.cursor>0?'<button class="text-button ox-restart" data-ox-start="restart">처음부터 풀기</button>':'')+'</article><article class="ox-mode-card"><span class="ox-mode-symbol" aria-hidden="true">↗ ↙</span><h2>전체 섞어 풀기</h2><p>강의를 구분하지 않고 모두 섞어 풀어요.<br>매번 새로운 순서로 기억을 확인하세요.</p><span class="ox-resume">전체 '+questions.length+'문항에서 무작위 출제</span><button class="button primary" data-ox-start="shuffled">섞어서 시작</button></article></section><p class="ox-footnote">답을 고른 뒤 해설과 출처를 확인하고, 헷갈린 개념은 OX 오답 노트에서 복습하세요.</p>'+(progress.sessions.length?'<section class="ox-recent"><h2>최근 OX 풀이</h2>'+progress.sessions.slice(0,5).map(s=>'<p><span>'+esc(new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'short',day:'numeric'}).format(new Date(s.at)))+' · '+({ordered:'순서대로',shuffled:'전체 섞기',wrong:'OX 오답',retry:'다시 풀기'}[s.mode]||'OX')+'</span><strong>'+s.correct+' / '+s.total+' 정답</strong></p>').join('')+'</section>':'');
    }
    const click=e=>{const start=e.target.closest('[data-ox-start]'),one=e.target.closest('[data-ox-one]');if(one){const q=questions.find(q=>q.id===one.dataset.oxOne);if(q)onStart({mode:'retry',list:[q]});}else if(start){onStart({mode:start.dataset.oxStart,count:host.querySelector('#ox-count').value,questions});}};
    host.addEventListener('click',click);disposeClick=()=>host.removeEventListener('click',click);
  }
  let disposeClick=()=>{};
  loadOxQuestions().then(render).catch(error=>{if(!disposed){host.removeAttribute('aria-busy');host.innerHTML='<p role="alert">문제를 불러오지 못했습니다. 새로고침해 다시 시도해 주세요.</p>';onError(error);}});
  return ()=>{disposed=true;disposeClick();};
}
export function mountOxQuiz(container,questions,{lectures,onAnswer=()=>{},onFinish=()=>{},onExit=()=>{},onRetry=()=>{}}={}) {
  let index=0,finished=false,reported=false,disposed=false;
  const answers=new Map(),started=Date.now();
  function render(){
    if(disposed)return;
    const q=questions[index],response=answers.get(q.id),graded=answers.has(q.id);
    container.innerHTML='<section class="ox-quiz"><div class="ox-quiz-top"><button class="text-button" data-ox-action="exit">← OX 목록으로</button><span>기본 개념 OX</span><strong>'+(index+1)+' / '+questions.length+'</strong></div><div class="ox-progress" role="progressbar" aria-label="OX 채점 진행률" aria-valuemin="0" aria-valuemax="'+questions.length+'" aria-valuenow="'+answers.size+'"><span style="width:'+answers.size/questions.length*100+'%"></span></div><article class="ox-question"><span class="eyebrow">OX '+String(q.order).padStart(4,'0')+'</span><h1 tabindex="-1">'+esc(q.statement)+'</h1><p class="ox-question-hint">맞는 설명이면 O, 틀린 설명이면 X를 선택하세요.</p><div class="ox-answer-buttons" role="group" aria-label="OX 답안"><button data-ox-answer="true" '+(graded?'disabled':'')+' class="'+(graded&&response.selected===true?'selected':'')+'" aria-pressed="'+(graded&&response.selected===true)+'"><strong>O</strong><span>맞아요</span></button><button data-ox-answer="false" '+(graded?'disabled':'')+' class="'+(graded&&response.selected===false?'selected':'')+'" aria-pressed="'+(graded&&response.selected===false)+'"><strong>X</strong><span>틀려요</span></button></div>'+(graded?feedbackHtml(q,lectures,response.selected):'<p class="ox-keyboard">키보드 O / X로도 답할 수 있어요.</p>')+'</article><div class="ox-quiz-navigation"><button class="button secondary" data-ox-action="prev" '+(index===0?'disabled':'')+'>이전 문제</button><button class="button primary" data-ox-action="next" '+(!graded?'disabled':'')+'>'+(index===questions.length-1?'결과 보기':'다음 문제 →')+'</button></div><button class="text-button ox-finish" data-ox-action="finish">여기까지 결과 보기 ('+answers.size+'문항 채점)</button></section>';
  }
  function grade(selected){if(finished||disposed||answers.has(questions[index].id))return;const q=questions[index];const answer={questionId:q.id,selected,correct:selected===q.answer};answers.set(q.id,answer);onAnswer(answer,q);render();container.querySelector('.ox-feedback h2')?.setAttribute('tabindex','-1');container.querySelector('.ox-feedback h2')?.focus({preventScroll:true});}
  function finish(){
    if(disposed)return;finished=true;
    const responses=[...answers.values()],wrong=questions.filter(q=>answers.has(q.id)&&!answers.get(q.id).correct),correct=responses.filter(a=>a.correct).length;
    if(!reported&&responses.length){reported=true;onFinish({total:responses.length,correct,questionIds:responses.map(a=>a.questionId),elapsedMs:Date.now()-started});}
    container.innerHTML='<section class="ox-result"><span class="eyebrow">YOUR OX RESULT</span><h1>개념을 한 번 더 쌓았어요.</h1><div class="ox-result-score"><strong>'+correct+'</strong><span>/ '+responses.length+' 정답</span></div><p>오답 '+wrong.length+'문항 · 미풀이 '+(questions.length-responses.length)+'문항</p><p>'+(wrong.length?'틀린 개념은 OX 오답 노트에 모았습니다.':responses.length?'이번에 채점한 문제를 모두 맞혔어요.':'아직 채점한 문제가 없어요.')+'</p><div class="ox-result-actions">'+(wrong.length?'<button class="button primary" data-ox-action="retry">이번에 틀린 문제 다시 풀기</button>':'')+'<a class="button secondary" href="#/wrong/ox">OX 오답 노트</a><button class="button secondary" data-ox-action="exit">OX 목록으로</button></div></section>';
  }
  const click=e=>{const answer=e.target.closest('[data-ox-answer]');if(answer){grade(answer.dataset.oxAnswer==='true');return;}const action=e.target.closest('[data-ox-action]')?.dataset.oxAction;if(action==='exit')onExit();if(action==='prev'&&!finished&&index>0){index--;render();window.scrollTo(0,0);}if(action==='next'&&!finished&&answers.has(questions[index].id)){if(index===questions.length-1)finish();else{index++;render();window.scrollTo(0,0);container.querySelector('h1')?.focus({preventScroll:true});}}if(action==='finish')finish();if(action==='retry'&&finished)onRetry(questions.filter(q=>answers.has(q.id)&&!answers.get(q.id).correct));};
  const key=e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.target?.closest?.('input,textarea,select,[contenteditable="true"]')||document.querySelector('[role="dialog"]')||finished)return;if(e.key.toLowerCase()==='o'||e.key.toLowerCase()==='x'){e.preventDefault();grade(e.key.toLowerCase()==='o');}};
  container.addEventListener('click',click);document.addEventListener('keydown',key);render();
  return ()=>{disposed=true;container.removeEventListener('click',click);document.removeEventListener('keydown',key);};
}
