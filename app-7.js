'use strict';

/*
 * SkinForge Pocket — authoritative prompt interpreter v2.
 * Replaces the generate button listener so unknown prompts never fall back to a random persona.
 */
(function () {
  const COLOR_WORDS = {
    negro:'#111827', negra:'#111827', black:'#111827', gris:'#64748b', blanco:'#f8fafc', blanca:'#f8fafc',
    rojo:'#dc2626', roja:'#dc2626', azul:'#2563eb', celeste:'#38bdf8', cyan:'#22d3ee', turquesa:'#14b8a6',
    verde:'#16a34a', amarillo:'#facc15', amarilla:'#facc15', naranja:'#f97316', morado:'#7c3aed', morada:'#7c3aed',
    violeta:'#8b5cf6', rosa:'#ec4899', rosado:'#ec4899', cafe:'#78350f', marron:'#78350f', dorado:'#f59e0b',
    plateado:'#cbd5e1', beige:'#d6b98c'
  };

  const PRESETS = [
    { id:'surgeon', label:'Cirujano', words:['cirujano','cirujana','cirugia','cirugía'], primary:'#0f766e', secondary:'#dbeafe', accent:'#22c55e', head:'surgical-cap', face:'surgical-mask', emblem:'medical' },
    { id:'doctor', label:'Médico', words:['medico','médico','medica','médica','doctor','doctora','enfermero','enfermera','paramedico','paramédico'], primary:'#e2e8f0', secondary:'#0f766e', accent:'#ef4444', head:'none', face:'none', emblem:'medical' },
    { id:'chef', label:'Chef', words:['chef','cocinero','cocinera','cocina'], primary:'#f8fafc', secondary:'#1f2937', accent:'#dc2626', head:'chef-hat', face:'none', emblem:'buttons' },
    { id:'police', label:'Policía', words:['policia','policía','carabinero','carabinera','detective','sheriff'], primary:'#1e3a8a', secondary:'#0f172a', accent:'#facc15', head:'cap', face:'none', emblem:'badge' },
    { id:'firefighter', label:'Bombero', words:['bombero','bombera','firefighter'], primary:'#b91c1c', secondary:'#111827', accent:'#facc15', head:'helmet', face:'none', emblem:'stripe' },
    { id:'scientist', label:'Científico', words:['cientifico','científico','cientifica','científica','investigador','investigadora','laboratorio','quimico','químico'], primary:'#f8fafc', secondary:'#dbeafe', accent:'#22d3ee', head:'none', face:'glasses', emblem:'lab' },
    { id:'teacher', label:'Profesor', words:['profesor','profesora','maestro','maestra','docente'], primary:'#334155', secondary:'#e2e8f0', accent:'#38bdf8', head:'none', face:'glasses', emblem:'buttons' },
    { id:'builder', label:'Constructor', words:['constructor','constructora','albanil','albañil','obra','operario','operaria'], primary:'#f97316', secondary:'#334155', accent:'#facc15', head:'hardhat', face:'none', emblem:'stripe' },
    { id:'farmer', label:'Granjero', words:['granjero','granjera','agricultor','agricultora','campesino','campesina'], primary:'#166534', secondary:'#78350f', accent:'#facc15', head:'cap', face:'none', emblem:'pocket' },
    { id:'athlete', label:'Deportista', words:['futbolista','deportista','atleta','runner','corredor','corredora','basquetbolista'], primary:'#2563eb', secondary:'#f8fafc', accent:'#ef4444', head:'none', face:'none', emblem:'number' },
    { id:'vigilante', label:'Vigilante oscuro', words:['batman','bruce wayne','dark knight','caballero de la noche','murcielago','murciélago','vigilante'], primary:'#111827', secondary:'#1f2937', accent:'#facc15', head:'cowl', face:'mask', emblem:'bat', back:'cape' },
    { id:'arachnid', label:'Héroe arácnido', words:['spiderman','spider-man','hombre arana','hombre araña'], primary:'#dc2626', secondary:'#1d4ed8', accent:'#111827', head:'full-mask', face:'mask', emblem:'web' },
    { id:'capedhero', label:'Héroe con capa', words:['superman','super girl','supergirl'], primary:'#2563eb', secondary:'#dc2626', accent:'#facc15', head:'none', face:'none', emblem:'shield', back:'cape' },
    { id:'armoredhero', label:'Héroe acorazado', words:['iron man','ironman'], primary:'#b91c1c', secondary:'#f59e0b', accent:'#22d3ee', head:'helmet', face:'visor', emblem:'reactor' }
  ];

  function norm(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ñ/g, 'n');
  }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function mix(a,b,t){ const x=hexToRgb(a), y=hexToRgb(b), q=clamp(t,0,1); return rgbaToHex(Math.round(x.r+(y.r-x.r)*q),Math.round(x.g+(y.g-x.g)*q),Math.round(x.b+(y.b-x.b)*q)); }
  function shade(c,n){ return n>=0 ? mix(c,'#ffffff',n) : mix(c,'#000000',-n); }
  function rect(part,layer,face,x,y,w,h,color,alpha=255){ const r=REGIONS[part][layer][face]; const x1=clamp(x,0,r.w),y1=clamp(y,0,r.h),x2=clamp(x+w,0,r.w),y2=clamp(y+h,0,r.h); for(let yy=y1;yy<y2;yy++)for(let xx=x1;xx<x2;xx++)localPixel(part,layer,face,xx,yy,color,alpha); }
  function band(part,layer,face,y,h,color,alpha=255){ rect(part,layer,face,0,y,REGIONS[part][layer][face].w,h,color,alpha); }
  function pixel(part,layer,face,x,y,color,alpha=255){ rect(part,layer,face,x,y,1,1,color,alpha); }
  function hash(text){ let h=2166136261; for(let i=0;i<text.length;i++){ h^=text.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function contains(text, words){ return words.some(w=>text.includes(norm(w))); }

  function findPreset(text){
    for(const preset of PRESETS) if(contains(text,preset.words)) return {...preset};
    return null;
  }

  function colorsIn(text){
    const out=[];
    Object.entries(COLOR_WORDS).forEach(([word,hex])=>{ const i=text.indexOf(norm(word)); if(i>=0) out.push({word,hex,index:i}); });
    return out.sort((a,b)=>a.index-b.index);
  }

  function nearbyColor(text,nouns,hits,max=32){
    let best=null;
    for(const noun of nouns){ const n=norm(noun); const idx=text.indexOf(n); if(idx<0)continue; for(const hit of hits){ const d=Math.abs(hit.index-idx); if(d<=max&&(!best||d<best.d))best={...hit,d}; } }
    return best?.hex||null;
  }

  function deterministicCustom(text){
    const h=hash(text);
    const themes=[
      ['#334155','#0f172a','#38bdf8'],['#166534','#14532d','#a3e635'],['#7c2d12','#431407','#fb923c'],
      ['#581c87','#2e1065','#e879f9'],['#1e3a8a','#172554','#60a5fa'],['#9f1239','#4c0519','#fb7185']
    ];
    const t=themes[h%themes.length];
    return { id:'custom', label:'Personaje personalizado', primary:t[0], secondary:t[1], accent:t[2], head:'none', face:'none', emblem:'diamond' };
  }

  function applyPromptOverrides(preset,text){
    const hits=colorsIn(text);
    const clothing=nearbyColor(text,['ropa','traje','uniforme','chaqueta','camisa','polera','vestido','scrubs','pijama'],hits,45);
    const eye=nearbyColor(text,['ojo','ojos'],hits,25);
    const hair=nearbyColor(text,['pelo','cabello'],hits,25);
    const skin=nearbyColor(text,['piel','rostro','cara'],hits,25);
    const pants=nearbyColor(text,['pantalon','pantalones','piernas'],hits,30);
    const accent=nearbyColor(text,['detalle','detalles','acento','borde','cinturon','cinturón'],hits,35);
    if(clothing)preset.primary=clothing; else if(hits.length===1)preset.primary=hits[0].hex;
    if(accent)preset.accent=accent;
    preset.eye=eye||'#3b82f6'; preset.hair=hair||'#3b241d'; preset.skin=skin||'#c98f65'; preset.skinDark=shade(preset.skin,-.18); preset.pants=pants||shade(preset.primary,-.22); preset.boots='#111827';
    if(contains(text,['piel oscura','moreno','morena'])){preset.skin='#754936';preset.skinDark='#563328';}
    if(contains(text,['piel clara','palido','palida'])){preset.skin='#f2c6a0';preset.skinDark='#d5a27b';}
    if(contains(text,['capucha']))preset.head='hood';
    if(contains(text,['gorro quirurgico','gorro quirúrgico']))preset.head='surgical-cap';
    if(contains(text,['mascara','mascarilla']))preset.face='mask';
    if(contains(text,['lentes','gafas']))preset.face='glasses';
    if(contains(text,['barba']))preset.face='beard';
    if(contains(text,['capa']))preset.back='cape';
    return preset;
  }

  function clearOuter(){ Object.keys(REGIONS).forEach(part=>clearPart(part,'outer')); }

  function drawFace(p){
    pixel('head','base','front',1,3,'#ffffff'); pixel('head','base','front',2,3,p.eye); pixel('head','base','front',5,3,p.eye); pixel('head','base','front',6,3,'#ffffff');
    rect('head','base','front',3,6,2,1,p.skinDark);
    if(p.face==='mask'||p.face==='surgical-mask'){ rect('head','outer','front',1,5,6,3,p.face==='surgical-mask'?'#dbeafe':p.secondary); band('head','outer','left',5,3,p.face==='surgical-mask'?'#dbeafe':p.secondary); band('head','outer','right',5,3,p.face==='surgical-mask'?'#dbeafe':p.secondary); }
    if(p.face==='glasses'){ const c='#111827'; rect('head','outer','front',1,3,2,2,c); rect('head','outer','front',5,3,2,2,c); rect('head','outer','front',3,4,2,1,c); }
    if(p.face==='beard'){ rect('head','outer','front',2,5,4,3,p.hair); pixel('head','outer','front',1,6,p.hair); pixel('head','outer','front',6,6,p.hair); }
    if(p.face==='visor'){ rect('head','outer','front',1,2,6,3,p.accent,220); }
  }

  function drawHead(p){
    if(!p.head||p.head==='none')return;
    if(p.head==='surgical-cap'){ fillRegion(REGIONS.head.outer.top,p.primary); ['front','back','left','right'].forEach(f=>band('head','outer',f,0,2,p.primary)); return; }
    if(p.head==='chef-hat'){ fillRegion(REGIONS.head.outer.top,'#f8fafc'); ['front','back','left','right'].forEach(f=>band('head','outer',f,0,3,'#f8fafc')); rect('head','outer','front',1,0,2,1,'#ffffff');rect('head','outer','front',5,0,2,1,'#ffffff');return; }
    if(p.head==='cowl'||p.head==='full-mask'){ fillRegion(REGIONS.head.outer.top,p.secondary); fillRegion(REGIONS.head.outer.back,p.secondary); fillRegion(REGIONS.head.outer.left,p.secondary); fillRegion(REGIONS.head.outer.right,p.secondary); band('head','outer','front',0,2,p.secondary); rect('head','outer','front',0,1,1,7,p.secondary); rect('head','outer','front',7,1,1,7,p.secondary); if(p.head==='full-mask')rect('head','outer','front',0,2,8,6,p.primary); return; }
    const c=p.head==='hardhat'?'#facc15':p.secondary;
    fillRegion(REGIONS.head.outer.top,c); ['front','back','left','right'].forEach(f=>band('head','outer',f,0,2,c)); if(p.head==='hood'){fillRegion(REGIONS.head.outer.back,c);fillRegion(REGIONS.head.outer.left,c);fillRegion(REGIONS.head.outer.right,c);rect('head','outer','front',0,1,1,7,c);rect('head','outer','front',7,1,1,7,c);} if(p.head==='helmet')band('head','outer','front',2,1,shade(c,-.2));
  }

  function drawEmblem(p){
    if(p.emblem==='medical'){ const c=p.accent; rect('torso','outer','front',3,2,2,6,c); rect('torso','outer','front',1,4,6,2,c); }
    else if(p.emblem==='badge'){ rect('torso','outer','front',5,2,2,3,p.accent); pixel('torso','outer','front',6,5,p.accent); }
    else if(p.emblem==='buttons'){ for(let y=2;y<9;y+=2)pixel('torso','outer','front',4,y,p.accent); }
    else if(p.emblem==='stripe'){ band('torso','outer','front',5,2,p.accent); }
    else if(p.emblem==='lab'){ rect('torso','outer','front',1,3,2,2,p.accent); rect('torso','outer','front',5,3,2,2,p.accent); }
    else if(p.emblem==='pocket'){ rect('torso','outer','front',5,4,2,2,p.accent); }
    else if(p.emblem==='number'){ rect('torso','outer','front',3,3,2,5,p.accent); }
    else if(p.emblem==='bat'){ pixel('torso','outer','front',2,4,p.accent);pixel('torso','outer','front',5,4,p.accent);rect('torso','outer','front',2,5,4,1,p.accent);pixel('torso','outer','front',3,6,p.accent);pixel('torso','outer','front',4,6,p.accent); }
    else if(p.emblem==='web'){ pixel('torso','outer','front',3,3,p.accent);pixel('torso','outer','front',4,3,p.accent);rect('torso','outer','front',2,4,4,1,p.accent);rect('torso','outer','front',3,5,2,3,p.accent); }
    else if(p.emblem==='shield'){ rect('torso','outer','front',2,3,4,4,p.accent);rect('torso','outer','front',3,7,2,1,p.accent); }
    else if(p.emblem==='reactor'){ rect('torso','outer','front',3,3,2,2,p.accent);rect('torso','outer','front',2,4,4,2,p.accent);rect('torso','outer','front',3,6,2,1,p.accent); }
    else { rect('torso','outer','front',3,3,2,1,p.accent);rect('torso','outer','front',2,4,4,2,p.accent);rect('torso','outer','front',3,6,2,1,p.accent); }
  }

  function drawBody(p){
    fillPart('head','base',p.skin); fillPart('torso','base',p.primary); fillPart('rightArm','base',p.primary); fillPart('leftArm','base',p.primary); fillPart('rightLeg','base',p.pants); fillPart('leftLeg','base',p.pants); clearOuter();
    ['rightArm','leftArm'].forEach(part=>['front','back','left','right'].forEach(face=>rect(part,'base',face,0,9,4,3,p.skin)));
    drawFace(p); drawHead(p); drawEmblem(p);
    if(p.back==='cape'){ fillRegion(REGIONS.torso.outer.back,p.secondary); rect('torso','outer','back',1,1,6,10,shade(p.secondary,.08)); }
    ['rightLeg','leftLeg'].forEach(part=>{['front','back','left','right'].forEach(face=>rect(part,'base',face,0,9,4,3,p.boots));fillRegion(REGIONS[part].base.bottom,p.boots);});
    if(p.id==='surgeon'||p.id==='doctor'){ ['rightArm','leftArm'].forEach(part=>['front','back','left','right'].forEach(face=>rect(part,'base',face,0,9,4,3,'#dbeafe'))); }
    if(p.id==='scientist'||p.id==='doctor'){ rect('torso','outer','front',0,0,2,12,'#f8fafc');rect('torso','outer','front',6,0,2,12,'#f8fafc');fillRegion(REGIONS.torso.outer.back,'#f8fafc'); }
    if(p.id==='police')band('torso','base','front',8,2,'#111827');
    if(p.id==='firefighter'){band('torso','base','front',5,2,p.accent);['rightArm','leftArm'].forEach(part=>band(part,'base','front',5,1,p.accent));}
  }

  function updateFeedback(prompt,p,recognized){
    const status=document.getElementById('aiSkinStatus'); const tags=document.getElementById('aiSkinInterpretation');
    if(status)status.textContent=recognized?`Interpretado como: ${p.label}. Se usó exactamente tu texto actual.`:`No reconocí una categoría exacta; generé una interpretación personalizada y estable de “${prompt}”.`;
    if(tags){tags.hidden=false;tags.innerHTML='';[p.label,`ropa ${p.primary}`,p.head&&p.head!=='none'?`cabeza ${p.head}`:null,p.face&&p.face!=='none'?`cara ${p.face}`:null,p.back?`espalda ${p.back}`:null].filter(Boolean).forEach(item=>{const s=document.createElement('span');s.className='ai-token';s.textContent=item;tags.appendChild(s);});}
  }

  function generate(prompt){
    const clean=String(prompt||'').trim(); if(clean.length<2){showToast('Describe la skin con unas pocas palabras',true);return;}
    const text=norm(clean); let preset=findPreset(text); const recognized=!!preset;
    if(!preset && typeof aiPersonaFromText==='function' && aiPersonaFromText(text)){
      aiGenerateFromPrompt(clean); return;
    }
    if(!preset)preset=deterministicCustom(text);
    preset=applyPromptOverrides(preset,text);
    pushHistory(); skinCtx.clearRect(0,0,64,64); drawBody(preset); afterChange(); if(typeof scheduleSave==='function')scheduleSave(true); updateFeedback(clean,preset,recognized); showToast(`Skin creada: ${preset.label}`);
  }

  function bind(){
    const oldBtn=document.getElementById('aiSkinGenerate'); const input=document.getElementById('aiSkinPrompt'); if(!oldBtn||!input)return false;
    if(document.getElementById('aiSkinGenerateV2'))return true;
    const btn=oldBtn.cloneNode(true); btn.id='aiSkinGenerateV2'; btn.textContent='Interpretar y crear'; oldBtn.replaceWith(btn);
    btn.addEventListener('click',()=>generate(input.value));
    input.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();generate(input.value);}},true);
    input.placeholder='Ej.: Cirujano con uniforme turquesa, mascarilla y guantes blancos';
    return true;
  }

  let tries=0; const timer=setInterval(()=>{if(bind()||++tries>80)clearInterval(timer);},150); setTimeout(bind,0);
})();
