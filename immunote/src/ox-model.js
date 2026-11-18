export function emptyOxProgress() { return { records: {}, sessions: [], cursor: 0 }; }
export function validOxProgress(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.records || typeof value.records !== 'object' || Array.isArray(value.records) || !Array.isArray(value.sessions) || !Number.isInteger(value.cursor) || value.cursor < 0) return false;
  return Object.entries(value.records).every(([id, r]) => id.startsWith('ox-') && r && Number.isInteger(r.attempts) && r.attempts > 0 && Number.isInteger(r.correctCount) && r.correctCount >= 0 && r.correctCount <= r.attempts && typeof r.lastCorrect === 'boolean' && typeof r.lastSelected === 'boolean' && typeof r.lastAttempt === 'string' && Number.isFinite(Date.parse(r.lastAttempt))) && value.sessions.every(s => s && typeof s.id === 'string' && typeof s.at === 'string' && Number.isFinite(Date.parse(s.at)) && ['ordered','shuffled','wrong','retry'].includes(s.mode) && Array.isArray(s.questionIds) && s.questionIds.every(id => typeof id === 'string' && id.startsWith('ox-')) && Number.isInteger(s.total) && s.total > 0 && s.questionIds.length===s.total && Number.isInteger(s.correct) && s.correct >= 0 && s.correct <= s.total);
}
export function recordOxAnswer(progress, { questionId, selected, correct }, at = new Date().toISOString()) {
  if (typeof questionId !== 'string' || !questionId.startsWith('ox-') || typeof selected !== 'boolean' || typeof correct !== 'boolean') throw new Error('올바른 OX 답안이 아닙니다.');
  const old = progress.records[questionId] || { attempts:0, correctCount:0 };
  progress.records[questionId] = { attempts:old.attempts+1, correctCount:old.correctCount+Number(correct), lastCorrect:correct, lastSelected:selected, lastAttempt:at };
}
export function summarizeOx(questions, progress) {
  let solved=0,wrong=0;
  for (const q of questions) { const r=progress.records[q.id]; if(r?.attempts){solved++;if(!r.lastCorrect)wrong++;} }
  return {total:questions.length,solved,wrong,correct:solved-wrong,unsolved:questions.length-solved,rate:solved?Math.round((solved-wrong)/solved*100):null};
}
export function selectOxQuestions(questions, { count=30, shuffle=false, start=0, wrongOnly=false, progress=emptyOxProgress(), random=Math.random }={}) {
  let list=questions.filter(q=>!wrongOnly || progress.records[q.id]?.attempts&&!progress.records[q.id].lastCorrect);
  if(shuffle){list=[...list];for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}}
  else if(!wrongOnly)list=list.slice(Number.isInteger(start)&&start>=0&&start<list.length?start:0);
  const amount=count==='all'?list.length:Number(count);
  return list.slice(0,Number.isInteger(amount)&&amount>0?amount:30);
}
