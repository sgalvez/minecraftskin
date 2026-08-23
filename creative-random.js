/* SkinForge creative random generator. Loaded after app-3.js. */
const CR_SIDES = ['front', 'back', 'left', 'right'];
const CR_SKINS = ['#f6d2b8','#edc3a2','#dca47b','#c98f65','#b87957','#a66f4f','#8f5d43','#754936','#5f3b2d','#4a3026'];
const CR_HAIRS = ['#17120f','#2b1b14','#3b241d','#5a3523','#7c4a2d','#a66a3f','#d3a15f','#e5d0a1','#6b7280','#d1d5db','#2563eb','#7c3aed','#db2777','#0f766e'];
const CR_EYES = ['#2563eb','#0f766e','#16a34a','#65a30d','#d97706','#7c3aed','#be123c','#334155'];
const CR_THEMES = [
  ['#166534','#365314','#a3e635','#263449','#3f2d20','#94a3b8'],
  ['#b45309','#78350f','#fde68a','#57534e','#292524','#d6d3d1'],
  ['#0369a1','#164e63','#22d3ee','#1e3a5f','#172554','#cbd5e1'],
  ['#b91c1c','#7f1d1d','#fb923c','#292524','#171717','#a8a29e'],
  ['#dbeafe','#1d4ed8','#67e8f9','#334155','#0f172a','#f8fafc'],
  ['#111827','#581c87','#22d3ee','#0f172a','#020617','#94a3b8'],
  ['#6d28d9','#312e81','#facc15','#1e1b4b','#171717','#fef3c7'],
  ['#18181b','#27272a','#ef4444','#09090b','#000000','#71717a'],
  ['#92400e','#44403c','#f59e0b','#3f3f46','#292524','#d97706'],
  ['#be185d','#831843','#f9a8d4','#4a044e','#2e1065','#fce7f3']
];
const CR_PERSONAS = [
  {id:'adventurer',label:'Aventurero',heads:['none','cap','hood'],faces:['none','glasses','scar'],backs:['none','backpack','cape'],emblems:['chevron','diamond','compass']},
  {id:'knight',label:'Caballero',heads:['helmet','none','crown'],faces:['none','beard','scar'],backs:['none','cape'],emblems:['cross','diamond','star']},
  {id:'mage',label:'Mago',heads:['hood','wizard','none'],faces:['none','beard','facepaint'],backs:['cape','none'],emblems:['rune','star','diamond']},
  {id:'cyber',label:'Ciberpunk',heads:['none','helmet','cap'],faces:['goggles','mask','facepaint'],backs:['tank','backpack','none'],emblems:['lightning','chevron','rune']},
  {id:'polar',label:'Explorador polar',heads:['beanie','hood'],faces:['goggles','scarf','none'],backs:['backpack','none'],emblems:['star','diamond','chevron']},
  {id:'pirate',label:'Pirata',heads:['bandana','none'],faces:['eyepatch','beard','scar'],backs:['cape','none'],emblems:['cross','chevron','diamond']},
  {id:'astronaut',label:'Astronauta',heads:['spacehelmet'],faces:['visor','none'],backs:['tank'],emblems:['star','chevron','diamond']},
  {id:'mechanic',label:'Mecánico',heads:['hardhat','cap','none'],faces:['goggles','glasses','beard'],backs:['backpack','none'],emblems:['gear','chevron','none']},
  {id:'ninja',label:'Ninja',heads:['hood','bandana'],faces:['mask','scar','none'],backs:['none','cape'],emblems:['chevron','rune','lightning']},
  {id:'druid',label:'Druida',heads:['hood','crown','none'],faces:['facepaint','beard','none'],backs:['cape','quiver','none'],emblems:['leaf','rune','star']},
  {id:'noble',label:'Noble',heads:['crown','none'],faces:['monocle','glasses','beard'],backs:['cape','none'],emblems:['star','diamond','cross']},
  {id:'miner',label:'Minero',heads:['hardhat'],faces:['goggles','beard','none'],backs:['backpack','none'],emblems:['gear','chevron','none']}
];
const CR_HAIR_STYLES = ['short','fringe','long','curly','sidecut','mohawk','bun','bald'];

function crPick(items) { return items[Math.floor(Math.random() * items.length)]; }
function crChance(p) { return Math.random() < p; }
function crClamp(v,min,max) { return Math.max(min,Math.min(max,v)); }
function crMix(a,b,t=.5) {
  const x=hexToRgb(a), y=hexToRgb(b), q=crClamp(t,0,1);
  return rgbaToHex(Math.round(x.r+(y.r-x.r)*q),Math.round(x.g+(y.g-x.g)*q),Math.round(x.b+(y.b-x.b)*q));
}
function crShade(c,n) { return n>=0 ? crMix(c,'#ffffff',n) : crMix(c,'#000000',-n); }
function crRect(part,layer,face,x,y,w,h,color,alpha=255) {
  const r=REGIONS[part][layer][face], x0=crClamp(x,0,r.w), y0=crClamp(y,0,r.h), x1=crClamp(x+w,0,r.w), y1=crClamp(y+h,0,r.h);
  for(let yy=y0;yy<y1;yy++) for(let xx=x0;xx<x1;xx++) localPixel(part,layer,face,xx,yy,color,alpha);
}
function crBand(part,layer,face,y,h,color,alpha=255) { crRect(part,layer,face,0,y,REGIONS[part][layer][face].w,h,color,alpha); }
function crStripe(part,layer,face,x,w,color,alpha=255) { crRect(part,layer,face,x,0,w,REGIONS[part][layer][face].h,color,alpha); }
function crFaces(part,layer,color) { for(const f of CR_SIDES) fillRegion(REGIONS[part][layer][f],color); }
function crPixel(part,layer,face,x,y,color,alpha=255) { crRect(part,layer,face,x,y,1,1,color,alpha); }

function crPlan() {
  const pool=CR_PERSONAS.filter(p=>p.id!==state.lastCreativePersona);
  const persona=crPick(pool.length?pool:CR_PERSONAS);
  state.lastCreativePersona=persona.id;
  return {persona,hair:crPick(CR_HAIR_STYLES),head:crPick(persona.heads),face:crPick(persona.faces),back:crPick(persona.backs),emblem:crPick(persona.emblems)};
}
function crScheme(plan) {
  const t=crPick(CR_THEMES), skin=crPick(CR_SKINS);
  return {skin,skinDark:crShade(skin,-.2),hair:crPick(CR_HAIRS),eye:crPick(CR_EYES),primary:t[0],secondary:t[1],accent:t[2],pants:t[3],boots:t[4],metal:t[5]};
}
function crBase(s) {
  fillPart('head','base',s.skin); fillPart('torso','base',s.primary);
  fillPart('rightArm','base',s.skin); fillPart('leftArm','base',s.skin);
  fillPart('rightLeg','base',s.pants); fillPart('leftLeg','base',s.pants);
  for(const p of Object.keys(REGIONS)) clearPart(p,'outer');
}
function crFace(s) {
  const y=crChance(.25)?2:3;
  if(crChance(.2)) {
    crPixel('head','base','front',2,y,crShade(s.eye,-.25)); crPixel('head','base','front',5,y,crShade(s.eye,-.25));
  } else {
    crPixel('head','base','front',1,y,'#f8fafc'); crPixel('head','base','front',2,y,s.eye);
    crPixel('head','base','front',5,y,crChance(.12)?crPick(CR_EYES):s.eye); crPixel('head','base','front',6,y,'#f8fafc');
  }
  const m=Math.floor(Math.random()*4);
  if(m===0) crRect('head','base','front',3,6,2,1,s.skinDark);
  else if(m===1) {crPixel('head','base','front',2,6,s.skinDark);crRect('head','base','front',3,7,2,1,s.skinDark);crPixel('head','base','front',5,6,s.skinDark);}
  else if(m===2) crRect('head','base','front',2,6,4,1,s.skinDark);
  else {crRect('head','base','front',3,6,2,2,crShade(s.skinDark,-.2));crRect('head','base','front',3,6,2,1,'#f8fafc');}
  if(crChance(.28)) for(const [x1,y1] of [[1,5],[2,5],[5,5],[6,5]]) crPixel('head','base','front',x1,y1,s.skinDark);
}
function crHair(s,style) {
  const h=s.hair, hi=crShade(h,.15), dark=crShade(h,-.15);
  if(style==='bald') return;
  if(style==='mohawk') {crRect('head','outer','top',3,0,2,8,h);crRect('head','outer','front',3,0,2,3,h);crRect('head','outer','back',3,0,2,6,h);return;}
  if(style==='sidecut') {fillRegion(REGIONS.head.outer.top,h);crRect('head','outer','front',1,0,6,3,h);crRect('head','outer','back',1,0,6,4,h);crBand('head','base','left',0,2,dark);crBand('head','base','right',0,2,dark);}
  else if(style==='long') {fillRegion(REGIONS.head.outer.top,h);fillRegion(REGIONS.head.outer.back,h);crRect('head','outer','left',0,0,8,7,h);crRect('head','outer','right',0,0,8,7,h);crBand('head','outer','front',0,2,h);crRect('head','outer','front',0,2,2,5,h);crRect('head','outer','front',6,2,2,5,h);}
  else if(style==='bun') {fillRegion(REGIONS.head.outer.top,h);crBand('head','outer','front',0,2,h);crBand('head','outer','back',0,4,h);crRect('head','outer','back',2,4,4,4,dark);crBand('head','outer','left',0,3,h);crBand('head','outer','right',0,3,h);}
  else {fillRegion(REGIONS.head.outer.top,h);crBand('head','outer','back',0,5,h);crBand('head','outer','left',0,4,h);crBand('head','outer','right',0,4,h);crBand('head','outer','front',0,2,h);if(style==='fringe'||style==='curly') for(let x=0;x<8;x+=2) crPixel('head','outer','front',x,2+(style==='curly'&&x%4===0?1:0),h);else crBand('head','outer','front',2,1,h);}
  if(crChance(.2)){crStripe('head','outer','top',crChance(.5)?2:5,1,hi);crRect('head','outer','front',crChance(.5)?1:6,0,1,3,hi);}
}
function crHead(s,style) {
  if(style==='none') return;
  const main=style==='helmet'||style==='spacehelmet'?s.metal:s.secondary, trim=style==='crown'?'#facc15':s.accent;
  if(style==='cap'||style==='beanie'||style==='hardhat') {fillRegion(REGIONS.head.outer.top,main);for(const f of CR_SIDES) crBand('head','outer',f,0,style==='beanie'?4:3,main);crBand('head','outer','front',style==='beanie'?3:2,1,trim);if(style==='hardhat') crRect('head','outer','front',0,3,8,1,main);}
  else if(style==='hood'||style==='helmet'||style==='spacehelmet') {fillRegion(REGIONS.head.outer.top,main);fillRegion(REGIONS.head.outer.back,main);fillRegion(REGIONS.head.outer.left,main);fillRegion(REGIONS.head.outer.right,main);crBand('head','outer','front',0,2,main);crRect('head','outer','front',0,1,1,7,main);crRect('head','outer','front',7,1,1,7,main);if(style==='spacehelmet')crRect('head','outer','front',1,2,6,3,crShade(s.eye,.2),215);}
  else if(style==='bandana') {for(const f of CR_SIDES) crBand('head','outer',f,2,1,trim);crRect('head','outer','back',5,3,2,3,trim);}
  else if(style==='crown') {for(const f of CR_SIDES) crBand('head','outer',f,1,2,'#facc15');for(const x of [0,3,4,7])crPixel('head','outer','front',x,0,'#facc15');crRect('head','outer','front',3,2,2,1,trim);}
  else if(style==='wizard') {fillRegion(REGIONS.head.outer.top,main);crBand('head','outer','front',0,3,main);crBand('head','outer','back',0,4,main);crBand('head','outer','left',0,4,main);crBand('head','outer','right',0,4,main);crPixel('head','outer','front',3,1,trim);crPixel('head','outer','front',4,1,trim);}
}
function crSleeves(s,color,len=9) {for(const p of ['rightArm','leftArm']){fillRegion(REGIONS[p].base.top,color);for(const f of CR_SIDES)crRect(p,'base',f,0,0,4,len,color);}}
function crShoes(s,h=3,color=s.boots) {for(const p of ['rightLeg','leftLeg']){for(const f of CR_SIDES)crRect(p,'base',f,0,12-h,4,h,color);fillRegion(REGIONS[p].base.bottom,color);}}
function crOutfit(s,id) {
  if(id==='adventurer'){fillPart('torso','base',s.primary);crSleeves(s,s.primary,5);crFaces('torso','outer',s.secondary);crRect('torso','outer','front',1,4,2,2,s.accent);crRect('torso','outer','front',5,4,2,2,s.accent);crBand('torso','base','front',8,1,s.boots);crShoes(s,4);}
  else if(id==='knight'){fillPart('torso','base','#1f2937');crSleeves(s,'#1f2937',9);crFaces('torso','outer',s.metal);fillRegion(REGIONS.torso.outer.top,s.metal);crRect('torso','outer','front',1,1,6,8,crShade(s.metal,.1));crStripe('torso','outer','front',3,2,crShade(s.metal,-.15));for(const p of ['rightArm','leftArm'])for(const f of CR_SIDES)crRect(p,'outer',f,0,0,4,4,s.metal);crShoes(s,4,crShade(s.metal,-.35));}
  else if(id==='mage'||id==='druid'){fillPart('torso','base',s.primary);crSleeves(s,s.primary,10);crStripe('torso','base','front',3,2,s.accent);for(const p of ['rightLeg','leftLeg'])for(const f of CR_SIDES)crRect(p,'base',f,0,0,4,8,s.primary);crShoes(s,3,crShade(s.secondary,-.25));}
  else if(id==='cyber'){fillPart('torso','base',s.secondary);crSleeves(s,s.secondary,10);crStripe('torso','base','front',crChance(.5)?1:6,1,s.accent);crBand('torso','base','front',4,1,s.accent);const a=crChance(.5)?'rightArm':'leftArm',l=crChance(.5)?'rightLeg':'leftLeg';crStripe(a,'base','front',0,1,s.accent);crStripe(l,'base','front',3,1,s.accent);crShoes(s,4,'#111827');}
  else if(id==='polar'){fillPart('torso','base',s.primary);crSleeves(s,s.secondary,10);crFaces('torso','outer',s.secondary);crStripe('torso','outer','front',3,2,crShade(s.secondary,-.18));for(const p of ['rightArm','leftArm'])for(const f of CR_SIDES)crRect(p,'base',f,0,9,4,3,s.boots);crShoes(s,5);}
  else if(id==='pirate'){fillPart('torso','base','#f5f5dc');crSleeves(s,'#f5f5dc',5);fillRegion(REGIONS.torso.outer.back,s.secondary);fillRegion(REGIONS.torso.outer.left,s.secondary);fillRegion(REGIONS.torso.outer.right,s.secondary);crRect('torso','outer','front',0,0,3,10,s.secondary);crRect('torso','outer','front',5,0,3,10,s.secondary);crBand('torso','base','front',7,2,s.accent);crShoes(s,5);}
  else if(id==='astronaut'){fillPart('torso','base',s.metal);crSleeves(s,s.metal,9);fillPart('rightLeg','base',s.metal);fillPart('leftLeg','base',s.metal);crRect('torso','outer','front',1,2,6,5,crShade(s.metal,-.12));crRect('torso','outer','front',2,3,4,2,'#111827');for(const [x,c] of [[2,'#ef4444'],[3,'#22c55e'],[4,'#3b82f6'],[5,'#facc15']])crPixel('torso','outer','front',x,3,c);crShoes(s,4,s.boots);}
  else if(id==='mechanic'||id==='miner'){fillPart('torso','base',s.primary);crSleeves(s,s.primary,4);crRect('torso','base','front',2,2,4,8,s.pants);crRect('torso','base','front',1,0,1,5,crShade(s.pants,.15));crRect('torso','base','front',6,0,1,5,crShade(s.pants,.15));crRect('torso','outer','front',5,6,2,2,s.accent);crShoes(s,4);}
  else if(id==='ninja'){fillPart('torso','base',s.secondary);crSleeves(s,s.secondary,10);fillPart('rightLeg','base',s.pants);fillPart('leftLeg','base',s.pants);crBand('torso','base','front',7,2,s.accent);for(const p of ['rightArm','leftArm'])crBand(p,'base','front',7,1,s.accent);crShoes(s,4,'#09090b');}
  else {fillPart('torso','base','#f8fafc');crSleeves(s,s.secondary,9);fillRegion(REGIONS.torso.outer.back,s.secondary);fillRegion(REGIONS.torso.outer.left,s.secondary);fillRegion(REGIONS.torso.outer.right,s.secondary);crRect('torso','outer','front',0,0,3,12,s.secondary);crRect('torso','outer','front',5,0,3,12,s.secondary);crRect('torso','base','front',3,2,2,4,s.accent);fillPart('rightLeg','base',crShade(s.secondary,.04));fillPart('leftLeg','base',crShade(s.secondary,.04));crShoes(s,3);}
}
function crBack(s,style){if(style==='cape'){fillRegion(REGIONS.torso.outer.back,s.secondary);crRect('torso','outer','back',1,1,6,10,crShade(s.secondary,.08));crStripe('torso','outer','back',3,2,s.accent);}else if(style==='backpack'){crRect('torso','outer','back',1,1,6,9,crShade(s.secondary,-.1));crRect('torso','outer','back',2,2,4,6,s.secondary);crBand('torso','outer','back',7,2,s.accent);}else if(style==='tank'){crRect('torso','outer','back',1,1,2,9,s.metal);crRect('torso','outer','back',5,1,2,9,s.metal);crBand('torso','outer','back',3,1,s.accent);}else if(style==='quiver'){for(let i=0;i<7;i++)crPixel('torso','outer','back',Math.min(7,i+1),9-i,s.boots);crRect('torso','outer','back',5,1,2,8,crShade(s.secondary,-.12));}}
function crEmblem(s,e){if(e==='none')return;if(e==='diamond'){crRect('torso','outer','front',3,3,2,1,s.accent);crRect('torso','outer','front',2,4,4,2,s.accent);crRect('torso','outer','front',3,6,2,1,s.accent);}else if(e==='cross'){crRect('torso','outer','front',3,2,2,6,s.accent);crRect('torso','outer','front',1,4,6,2,s.accent);}else if(e==='chevron'){for(const [x,y] of [[1,3],[2,4],[3,5],[4,5],[5,4],[6,3]])crPixel('torso','outer','front',x,y,s.accent);}else if(e==='rune'){crRect('torso','outer','front',3,2,2,6,s.accent);for(const [x,y] of [[2,3],[5,3],[2,6],[5,6]])crPixel('torso','outer','front',x,y,s.accent);}else if(e==='star'){crRect('torso','outer','front',2,3,4,4,s.accent);crBand('torso','outer','front',4,2,s.accent);}else if(e==='lightning'){crRect('torso','outer','front',4,2,2,2,s.accent);crRect('torso','outer','front',3,4,2,2,s.accent);crRect('torso','outer','front',2,6,2,2,s.accent);}else if(e==='gear'){crRect('torso','outer','front',2,3,4,1,s.accent);crRect('torso','outer','front',2,6,4,1,s.accent);crRect('torso','outer','front',1,4,1,2,s.accent);crRect('torso','outer','front',6,4,1,2,s.accent);}else if(e==='leaf'){for(let i=0;i<5;i++)crPixel('torso','outer','front',2+Math.floor(i/2),3+i,s.accent);}else{crRect('torso','outer','front',3,2,2,6,s.accent);crBand('torso','outer','front',4,2,s.accent);}}
function crFaceAccessory(s,a){if(a==='glasses'||a==='goggles'){const c=a==='goggles'?s.accent:'#111827';crRect('head','outer','front',1,3,2,2,c);crRect('head','outer','front',5,3,2,2,c);crRect('head','outer','front',3,4,2,1,c);}else if(a==='mask'||a==='scarf'){crRect('head','outer','front',1,5,6,3,s.secondary);crBand('head','outer','left',5,3,s.secondary);crBand('head','outer','right',5,3,s.secondary);}else if(a==='visor'){crRect('head','outer','front',1,2,6,3,crShade(s.accent,.12),220);}else if(a==='eyepatch'){crRect('head','outer','front',1,3,2,2,'#111827');crBand('head','outer','front',2,1,'#111827');}else if(a==='beard'){crRect('head','outer','front',2,5,4,3,crShade(s.hair,-.1));crPixel('head','outer','front',1,6,s.hair);crPixel('head','outer','front',6,6,s.hair);}else if(a==='monocle'){crRect('head','outer','front',5,3,2,2,'#facc15');crRect('head','outer','front',6,5,1,2,'#facc15');}else if(a==='scar'){for(const [x,y] of [[5,2],[4,3],[3,4]])crPixel('head','base','front',x,y,crShade(s.skinDark,-.15));}else if(a==='facepaint'){crStripe('head','outer','front',3,2,s.accent,210);}}
function crAsymmetry(s){if(!crChance(.45))return;const arm=crChance(.5)?'rightArm':'leftArm',leg=crChance(.5)?'rightLeg':'leftLeg';if(crChance(.5)){for(const f of CR_SIDES)crBand(arm,'outer',f,8,2,s.accent);}else{crRect(leg,'outer','front',0,4,4,3,crShade(s.accent,-.08));crRect(leg,'outer','front',1,5,2,1,'#f8fafc');}}

function makeTemplate(recordHistory=true){
  if(recordHistory&&!confirm('¿Generar una skin random? La skin actual se reemplazará y podrás deshacer el cambio.'))return;
  if(recordHistory)pushHistory();
  skinCtx.clearRect(0,0,64,64);
  const plan=crPlan(),s=crScheme(plan);
  crBase(s);crFace(s);crHair(s,plan.hair);crOutfit(s,plan.persona.id);crBack(s,plan.back);crEmblem(s,plan.emblem);crHead(s,plan.head);crFaceAccessory(s,plan.face);crAsymmetry(s);
  afterChange();
  showToast(recordHistory?`Generado: ${plan.persona.label}`:`Plantilla: ${plan.persona.label}`);
}
