import {mkdir,rm,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';

// Second-exam sources remain editable; the publication contains bounded ES modules.
// Read both flat and already-packed modules using their ordinary exports, so a
// future published checkout builds exactly the same question and note objects.
export async function packSecondExam(root,output){
  const source=resolve(root,'data/exam-2'),target=resolve(output,'data/exam-2');
  const specifications=[
    ['past-questions.js','PAST_QUESTIONS','past-question-packs','QUESTIONS',false],
    ['chat-questions.js','CHAT_QUESTIONS','chat-question-packs','QUESTIONS',false],
    ['ox-questions.js','OX_QUESTIONS','ox-packs','QUESTIONS',false],
    ['choice-notes.js','CHOICE_NOTES','choice-note-packs','NOTES',true],
  ];
  const summary={};
  for(const[entryName,exportName,directory,packExport,object]of specifications){
    const module=await import(pathToFileURL(join(source,entryName)));
    const value=module[exportName];
    if(object?(!value||typeof value!=='object'||Array.isArray(value)):!Array.isArray(value))throw Error('Invalid second-exam export '+exportName);
    const values=object?Object.entries(value).sort(([a],[b])=>a.localeCompare(b)):value;
    const dir=join(target,directory);await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});
    const names=[];let entries=[],bytes=0;
    async function flush(){
      if(!entries.length)return;
      const name='part-'+String(names.length+1).padStart(3,'0')+'.js';
      const serialized=object?JSON.stringify(Object.fromEntries(entries)):JSON.stringify(entries);
      const text='export const '+packExport+' = '+serialized+';\n';
      if(Buffer.byteLength(text)>96*1024)throw Error('Second-exam module exceeds upload bound: '+entryName);
      await writeFile(join(dir,name),text);names.push(name);entries=[];bytes=0;
    }
    for(const entry of values){
      const length=Buffer.byteLength(JSON.stringify(object?Object.fromEntries([entry]):entry))+2;
      if(length+80>96*1024)throw Error('A second-exam entry is too large: '+entryName);
      if(entries.length&&bytes+length+80>80*1024)await flush();
      entries.push(entry);bytes+=length;
    }
    await flush();
    const imports=names.map((name,index)=>`import { ${packExport} as PACK_${index} } from './${directory}/${name}';`).join('\n');
    const spread=names.map((_,index)=>'...PACK_'+index).join(',');
    await writeFile(join(target,entryName),'// Generated second-exam entry point; objects, IDs and order are preserved.\n'+imports+'\nexport const '+exportName+' = '+(object?'{'+spread+'}':'['+spread+']')+';\n');
    summary[exportName]={entries:values.length,packs:names.length};
  }
  return summary;
}
