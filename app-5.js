'use strict';

const CG_SKIN = ['#f6d2b8','#edc3a2','#dca47b','#c98f65','#b87957','#a66f4f','#8f5d43','#754936','#5f3b2d','#4a3026'];
const CG_HAIR = ['#17120f','#2b1b14','#3b241d','#5a3523','#7c4a2d','#a66a3f','#d3a15f','#e5d0a1','#6b7280','#d1d5db','#2563eb','#7c3aed','#db2777','#0f766e'];
const CG_EYES = ['#2563eb','#0f766e','#16a34a','#65a30d','#d97706','#7c3aed','#be123c','#334155'];
const CG_THEMES = [
  ['#166534','#365314','#a3e635','#263449','#3f2d20','#94a3b8'],
  ['#b45309','#78350f','#fde68a','#57534e','#292524','#d6d3d1'],
  ['#0369a1','#164e63','#22d3ee','#1e3a5f','#172554','#cbd5e1'],
  ['#b91c1c','#7f1d1d','#fb923c','#292524','#171717','#a8a29e'],
  ['#dbeafe','#1d4ed8','#67e8f9','#334155','#0f172a','#f8fafc'],
  ['#111827','#581c87','#22d3ee','#0f172a','#020617','#94a3b8'],
  ['#6d28d9','#312e81','#facc15','#1e1b4b','#171717','#fef3c7'],
  ['#18181b','#27272a','#ef4444','#09090b','#000000','#71717a'],
  ['#92400e','#44403c','#f59e0b','#3f3f46','#292524','#d97706'],
  ['#1e3a8a','#312e81','#e0e7ff','#172554','#0f172a','#f8fafc'],
  ['#be185d','#831843','#f9a8d4','#4a044e','#2e1065','#fce7f3'],
  ['#475569','#1f2937','#f97316','#334155','#111827','#d1d5db']
];
const CG_PERSONAS = [
  {id:'adventurer',label:'Aventurero',hair:['short','fringe','long','curly','sidecut'],head:['none','cap','hood'],face:['none','glasses','scar','scarf'],back:['none','backpack','cape']},
  {id:'knight',label:'Caballero',hair:['short','long','bald'],head:['helmet','none','crown'],face:['none','beard','scar'],back:['none','cape']},
  {id:'mage',label:'Mago',hair:['long','curly','bald','bun'],head:['hood','wizard','none'],face:['none','beard','facepaint'],back:['none','cape']},
  {id:'cyber',label:'Ciberpunk',hair:['mohawk','sidecut','fringe','short'],head:['none','helmet','cap'],face:['goggles','mask','facepaint','none'],back:['none','tank','backpack']},
  {id:'polar',label:'Explorador polar',hair:['short','long','fringe'],head:['beanie','hood'],face:['goggles','scarf','none'],back:['backpack','none']},
  {id:'pirate',label:'Pirata',hair:['long','curly','short','bald'],head:['bandana','none'],face:['eyepatch','beard','scar','none'],back:['none','cape']},
  {id:'astronaut',label:'Astronauta',hair:['short','bald'],head:['spacehelmet'],face:['none','visor'],back:['tank']},
  {id:'mechanic',label:'Mecánico',hair:['short','curly','sidecut','bald'],head:['hardhat','cap','none'],face:['goggles','glasses','beard','none'],back:['backpack','none']},
  {id:'ninja',label:'Ninja',hair:['short','sidecut','bald'],head:['hood','bandana'],face:['mask','scar','none'],back:['none','cape']},
  {id:'druid',label:'Druida',hair:['long','curly','bun','bald'],head:['hood','crown','none'],face:['facepaint','beard','none'],back:['cape','quiver','none']},
  {id:'noble',label:'Noble',hair:['long','short','bun','curly'],head:['crown','none'],face:['monocle','glasses','beard','none'],back:['cape','none']},
  {id:'miner',label:'Minero',hair:['short','curly','bald'],head:['hardhat'],face:['goggles','beard','scarf','none'],back:['backpack','none']}
];

function cgPick(a){return a[Math.floor(Math.random()*a.length)];}
function cgChance(p){return Math.random()<p;}
function cgClamp(v,a,b){return Math.max(a,Math.min(b,v));}
function cgMix(a,b,t){const x=hexToRgb(a),y=hexToRgb(b),q=cgClamp(t,0,1);return rgbaToHex(Math.round(x.r+(y.r-x.r)*q),Math.round(x.g+(y.g-x.g)*q),Math.round(x.b+(y.b-x.b)*q));}
function cgShade(c,n){return n>=0?cgMix(c,'#ffffff',n):cgMix(c,'#000000',-n);}
function cgRect(part,layer,face,x,y,w,h,color,alpha=255){const r=REGIONS[part][layer][face],x1=cgClamp(x,0,r.w),y1=cgClamp(y,0,r.h),x2=cgClamp(x+w,0,r.w),y2=cgClamp(y+h,0,r.h);for(let yy=y1;yy<y2;yy++)for(let xx=x1;xx<x2;xx++)localPixel(part,layer,face,xx,yy,color,alpha);}
function cgBand(part,layer,face,y,h,color,alpha=255){cgRect(part,layer,face,0,y,REGIONS[part][layer][face].w,h,color,alpha);}
function cgStripe(part,layer,face,x,w,color,alpha=255){cgRect(part,layer,face,x,0,w,REGIONS[part][layer][face].h,color,alpha);}
function cgFaces(part,layer,faces,color){faces.forEach(f=>fillRegion(REGIONS[part][layer][f],color));}
function cgPixel(part,layer,face,x,y,color,alpha=255){cgRect(part,layer,face,x,y,1,1,color,alpha);}

function cgProfile(){
  let persona,signature,profile,tries=0;
  do{
    const pool=CG_PERSONAS.filter(p=>p.id!==state.lastCreativePersona);
    persona=cgPick(pool.length?pool:CG_PERSONAS);
    profile={persona,hair:cgPick(persona.hair),head:cgPick(persona.head),face:cgPick(persona.face),back:cgPick(persona.back),eyes:cgPick(['normal','normal','wide','narrow','hetero']),mouth:cgPick(['neutral','smile','smirk','open','frown']),detail:cgPick(['none','none','freckles','blush','brows']),asym:cgPick(['none','wrist','shoulder','legpatch','armstripe'])};
    signature=[persona.id,profile.hair,profile.head,profile.face,profile.back,profile.eyes,profile.mouth,profile.detail,profile.asym].join('|');
    tries++;
  }while(signature===state.lastCreativeSignature&&tries<12);
  state.lastCreativePersona=persona.id;state.lastCreativeSignature=signature;return profile;
}
function cgPalette(profile){
  const t=cgPick(CG_THEMES),skin=cgPick(CG_SKIN),shift=cgPick([-.12,-.06,0,.06,.12]);
  let p={skin,skinDark:cgShade(skin,-.18),hair:cgPick(CG_HAIR),eye:cgPick(CG_EYES),eye2:cgPick(CG_EYES),primary:cgShade(t[0],shift),secondary:cgShade(t[1],shift/2),accent:cgShade(t[2],cgPick([-.12,0,.12])),pants:cgShade(t[3],-shift/2),boots:t[4],metal:cgShade(t[5],cgPick([-.08,0,.08]))};
  if(profile.persona.id==='astronaut'){p.primary=cgPick(['#f8fafc','#e5e7eb','#dbeafe']);p.secondary=cgShade(p.primary,-.15);p.pants=p.primary;p.boots='#334155';}
  if(profile.persona.id==='ninja'){p.primary=cgPick(['#111827','#18181b','#1e293b']);p.secondary=cgShade(p.primary,-.12);p.pants=cgShade(p.primary,.06);p.boots='#09090b';}
  if(profile.persona.id==='pirate')p.primary=cgPick(['#f5f5dc','#e7e5e4','#fef3c7']);
  return p;
}
function cgBase(c){fillPart('head','base',c.skin);fillPart('torso','base',c.primary);fillPart('rightArm','base',c.skin);fillPart('leftArm','base',c.skin);fillPart('rightLeg','base',c.pants);fillPart('leftLeg','base',c.pants);Object.keys(REGIONS).forEach(p=>clearPart(p,'outer'));}

function cgFace(p,c){
  const y=cgChance(.25)?2:3,left=p.eyes==='hetero'?c.eye2:c.eye;
  if(p.eyes==='wide'){cgRect('head','base','front',1,y,2,2,'#fff');cgRect('head','base','front',5,y,2,2,'#fff');cgPixel('head','base','front',2,y+1,left);cgPixel('head','base','front',5,y+1,c.eye);}
  else if(p.eyes==='narrow'){cgRect('head','base','front',1,y,2,1,cgShade(c.skinDark,-.2));cgRect('head','base','front',5,y,2,1,cgShade(c.skinDark,-.2));cgPixel('head','base','front',2,y+1,left);cgPixel('head','base','front',5,y+1,c.eye);}
  else{cgPixel('head','base','front',1,y,'#fff');cgPixel('head','base','front',2,y,left);cgPixel('head','base','front',5,y,c.eye);cgPixel('head','base','front',6,y,'#fff');}
  if(cgChance(.55)){cgPixel('head','base','front',1,y-1,cgShade(c.hair,-.15));cgPixel('head','base','front',6,y-1,cgShade(c.hair,-.15));}
  cgPixel('head','base','front',cgChance(.5)?3:4,5,c.skinDark);
  if(p.mouth==='smile'){cgPixel('head','base','front',2,6,c.skinDark);cgRect('head','base','front',3,7,2,1,c.skinDark);cgPixel('head','base','front',5,6,c.skinDark);}
  else if(p.mouth==='smirk'){cgRect('head','base','front',3,6,2,1,c.skinDark);cgPixel('head','base','front',5,5,c.skinDark);}
  else if(p.mouth==='open'){cgRect('head','base','front',3,6,2,2,cgShade(c.skinDark,-.25));cgRect('head','base','front',3,7,2,1,'#fda4af');}
  else if(p.mouth==='frown'){cgPixel('head','base','front',2,7,c.skinDark);cgRect('head','base','front',3,6,2,1,c.skinDark);cgPixel('head','base','front',5,7,c.skinDark);}
  else cgRect('head','base','front',3,6,2,1,c.skinDark);
  if(p.detail==='freckles')[[1,5],[2,5],[5,5],[6,5]].forEach(v=>cgPixel('head','base','front',v[0],v[1],c.skinDark));
  if(p.detail==='blush'){cgRect('head','base','front',0,5,2,1,'#e98b8b');cgRect('head','base','front',6,5,2,1,'#e98b8b');}
  if(p.detail==='brows'){cgRect('head','base','front',1,2,2,1,cgShade(c.hair,-.1));cgRect('head','base','front',5,2,2,1,cgShade(c.hair,-.1));}
}
function cgHair(style,c){
  const h=c.hair;if(style==='bald')return;
  if(style==='mohawk'){cgRect('head','outer','top',3,0,2,8,h);cgRect('head','outer','front',2,0,4,2,h);cgRect('head','outer','back',2,0,4,4,h);return;}
  if(style==='sidecut'){fillRegion(REGIONS.head.outer.top,h);cgRect('head','outer','front',1,0,6,3,h);cgRect('head','outer','back',1,0,6,4,h);cgBand('head','base','left',0,2,cgShade(h,-.2));cgBand('head','base','right',0,2,cgShade(h,-.2));return;}
  fillRegion(REGIONS.head.outer.top,h);
  if(style==='long'){fillRegion(REGIONS.head.outer.back,h);cgRect('head','outer','left',0,0,8,7,h);cgRect('head','outer','right',0,0,8,7,h);cgBand('head','outer','front',0,3,h);cgRect('head','outer','front',0,3,2,4,h);cgRect('head','outer','front',6,3,2,4,h);}
  else if(style==='bun'){cgBand('head','outer','front',0,2,h);cgBand('head','outer','back',0,5,h);cgBand('head','outer','left',0,4,h);cgBand('head','outer','right',0,4,h);cgRect('head','outer','back',3,5,2,3,cgShade(h,-.15));}
  else if(style==='curly'){['front','back','left','right'].forEach(f=>{for(let x=0;x<8;x++){cgPixel('head','outer',f,x,0,h);if(x%2===0)cgPixel('head','outer',f,x,1,h);if(x%3===0)cgPixel('head','outer',f,x,2,h);}});}
  else if(style==='fringe'){cgBand('head','outer','front',0,2,h);[0,2,5,7].forEach((x,i)=>cgPixel('head','outer','front',x,2+i%2,h));cgBand('head','outer','back',0,5,h);cgBand('head','outer','left',0,4,h);cgBand('head','outer','right',0,4,h);}
  else{cgBand('head','outer','front',0,2,h);cgBand('head','outer','back',0,4,h);cgBand('head','outer','left',0,3,h);cgBand('head','outer','right',0,3,h);}
  if(cgChance(.2)){const s=c.accent;cgRect('head','outer','front',cgChance(.5)?1:6,0,1,3,s);cgRect('head','outer','top',cgChance(.5)?2:5,0,1,8,s);}
}
function cgHead(style,c){
  if(style==='none')return;const main=style==='helmet'||style==='spacehelmet'?c.metal:c.secondary,trim=cgShade(main,-.18);
  if(style==='cap'){fillRegion(REGIONS.head.outer.top,main);['front','back','left','right'].forEach(f=>cgBand('head','outer',f,0,f==='front'?3:4,main));cgBand('head','outer','front',3,1,trim);}
  else if(style==='beanie'){fillRegion(REGIONS.head.outer.top,main);['front','back','left','right'].forEach(f=>{cgBand('head','outer',f,0,4,main);cgBand('head','outer',f,3,1,c.accent);});}
  else if(style==='hood'){fillRegion(REGIONS.head.outer.top,main);fillRegion(REGIONS.head.outer.back,main);fillRegion(REGIONS.head.outer.left,main);fillRegion(REGIONS.head.outer.right,main);cgBand('head','outer','front',0,2,main);cgRect('head','outer','front',0,1,1,7,main);cgRect('head','outer','front',7,1,1,7,main);}
  else if(style==='helmet'||style==='spacehelmet'){fillRegion(REGIONS.head.outer.top,main);fillRegion(REGIONS.head.outer.back,main);fillRegion(REGIONS.head.outer.left,main);fillRegion(REGIONS.head.outer.right,main);cgBand('head','outer','front',0,2,main);cgRect('head','outer','front',0,1,1,7,main);cgRect('head','outer','front',7,1,1,7,main);if(style==='spacehelmet')cgRect('head','outer','front',1,2,6,3,cgShade(c.eye,.2),210);}
  else if(style==='bandana'){['front','back','left','right'].forEach(f=>cgBand('head','outer',f,2,2,c.accent));cgRect('head','outer','back',6,4,2,3,c.accent);}
  else if(style==='crown'){['front','back','left','right'].forEach(f=>cgBand('head','outer',f,1,2,'#facc15'));[0,3,4,7].forEach(x=>cgPixel('head','outer','front',x,0,'#facc15'));cgRect('head','outer','front',3,2,2,1,c.accent);}
  else if(style==='hardhat'){fillRegion(REGIONS.head.outer.top,main);['front','back','left','right'].forEach(f=>cgBand('head','outer',f,0,2,main));cgBand('head','outer','front',2,1,trim);cgRect('head','outer','front',3,0,2,2,c.accent);}
  else if(style==='wizard'){fillRegion(REGIONS.head.outer.top,main);cgBand('head','outer','front',2,2,trim);cgRect('head','outer','front',1,1,6,1,main);cgRect('head','outer','front',2,0,4,1,main);cgBand('head','outer','back',0,4,main);}
}
function cgFaceAccessory(style,c){
  const d=cgShade(c.secondary,-.35);if(style==='none')return;
  if(style==='glasses'||style==='goggles'){const f=style==='goggles'?c.accent:d;cgRect('head','outer','front',1,3,2,2,f,style==='goggles'?225:255);cgRect('head','outer','front',5,3,2,2,f,style==='goggles'?225:255);cgRect('head','outer','front',3,4,2,1,f);}
  else if(style==='beard'){const b=cgShade(c.hair,cgChance(.5)?-.12:.08);cgRect('head','outer','front',2,5,4,3,b);cgPixel('head','outer','front',1,6,b);cgPixel('head','outer','front',6,6,b);}
  else if(style==='eyepatch'){cgRect('head','outer','front',1,3,2,2,d);cgBand('head','outer','front',2,1,d);}
  else if(style==='mask'){cgRect('head','outer','front',0,4,8,4,c.secondary);['left','right','back'].forEach(f=>cgBand('head','outer',f,4,4,c.secondary));}
  else if(style==='monocle'){cgRect('head','outer','front',5,3,2,2,c.metal);cgPixel('head','outer','front',6,5,c.metal);cgPixel('head','outer','front',6,6,c.metal);}
  else if(style==='scar'){cgPixel('head','outer','front',5,2,'#7f1d1d');cgPixel('head','outer','front',4,3,'#7f1d1d');cgPixel('head','outer','front',5,4,'#7f1d1d');}
  else if(style==='facepaint'){cgRect('head','outer','front',0,4,3,1,c.accent);cgRect('head','outer','front',5,4,3,1,c.accent);cgRect('head','outer','front',3,5,2,1,c.accent);}
  else if(style==='scarf'){['front','back','left','right'].forEach(f=>cgBand('head','outer',f,6,2,c.accent));cgRect('torso','outer','front',3,0,2,4,c.accent);}
  else if(style==='visor')cgRect('head','outer','front',1,2,6,3,cgShade(c.accent,.15),215);
}
function cgSleeves(c,color,len=4,hands=3){['rightArm','leftArm'].forEach(p=>{fillRegion(REGIONS[p].base.top,color);['front','back','left','right'].forEach(f=>{cgRect(p,'base',f,0,0,4,len,color);if(hands)cgRect(p,'base',f,0,12-hands,4,hands,c.skin);});});}
function cgShoes(c,h=3,color=c.boots){['rightLeg','leftLeg'].forEach(p=>{['front','back','left','right'].forEach(f=>cgRect(p,'base',f,0,12-h,4,h,color));fillRegion(REGIONS[p].base.bottom,color);});}
function cgOutfit(p,c){
  const id=p.persona.id,F=['front','back','left','right'];
  if(id==='adventurer'){cgSleeves(c,c.primary,5,7);cgFaces('torso','outer',F,c.secondary);cgRect('torso','outer','front',3,0,2,12,cgShade(c.secondary,-.18));cgRect('torso','outer','front',1,4,2,2,c.accent);cgRect('torso','outer','front',5,4,2,2,c.accent);cgBand('torso','base','front',7,1,c.boots);cgShoes(c,4);}
  else if(id==='knight'){fillPart('torso','base','#1f2937');cgSleeves(c,'#1f2937',9,3);cgFaces('torso','outer',F,c.metal);cgRect('torso','outer','front',1,1,6,8,cgShade(c.metal,.1));cgRect('torso','outer','front',3,1,2,8,c.accent);['rightArm','leftArm'].forEach(a=>F.forEach(f=>cgRect(a,'outer',f,0,0,4,4,c.metal)));cgShoes(c,4,cgShade(c.metal,-.35));}
  else if(id==='mage'||id==='druid'){fillPart('torso','base',c.primary);cgSleeves(c,c.primary,11,1);cgStripe('torso','base','front',3,2,c.accent);cgRect('torso','outer','front',2,3,4,4,cgShade(c.secondary,.08));cgRect('torso','outer','front',3,3,2,4,c.accent);['rightLeg','leftLeg'].forEach(l=>F.forEach(f=>cgRect(l,'base',f,0,0,4,8,c.primary)));cgShoes(c,3,cgShade(c.secondary,-.3));}
  else if(id==='cyber'){const d=cgShade(c.secondary,-.2);fillPart('torso','base',d);cgSleeves(c,d,10,2);fillPart('rightLeg','base',c.pants);fillPart('leftLeg','base',c.pants);cgStripe('torso','base','front',cgChance(.5)?1:6,1,c.accent);cgBand('torso','base','front',4,1,c.accent);cgRect('torso','outer','front',2,2,4,3,cgShade(d,.12));cgShoes(c,4,'#111827');}
  else if(id==='polar'){cgSleeves(c,c.secondary,10,2);cgFaces('torso','outer',F,c.secondary);cgStripe('torso','outer','front',3,2,cgShade(c.secondary,-.18));cgBand('torso','outer','front',9,1,c.accent);['rightArm','leftArm'].forEach(a=>F.forEach(f=>cgRect(a,'base',f,0,9,4,3,c.boots)));cgShoes(c,5);}
  else if(id==='pirate'){fillPart('torso','base',c.primary);cgSleeves(c,c.primary,5,7);fillRegion(REGIONS.torso.outer.back,c.secondary);cgRect('torso','outer','front',0,0,3,10,c.secondary);cgRect('torso','outer','front',5,0,3,10,c.secondary);cgBand('torso','base','front',7,2,c.accent);cgShoes(c,5);}
  else if(id==='astronaut'){fillPart('torso','base',c.primary);cgSleeves(c,c.primary,9,0);fillPart('rightLeg','base',c.primary);fillPart('leftLeg','base',c.primary);cgRect('torso','outer','front',1,2,6,5,c.secondary);cgRect('torso','outer','front',2,3,4,2,'#111827');['#ef4444','#22c55e','#3b82f6','#facc15'].forEach((x,i)=>cgPixel('torso','outer','front',2+i,3,x));['rightArm','leftArm'].forEach(a=>F.forEach(f=>cgRect(a,'base',f,0,9,4,3,c.boots)));cgShoes(c,4,c.boots);}
  else if(id==='mechanic'||id==='miner'){fillPart('torso','base',c.primary);cgSleeves(c,c.primary,4,8);fillPart('rightLeg','base',c.pants);fillPart('leftLeg','base',c.pants);cgRect('torso','base','front',2,2,4,8,c.pants);cgRect('torso','base','front',1,0,1,5,cgShade(c.pants,.15));cgRect('torso','base','front',6,0,1,5,cgShade(c.pants,.15));cgRect('torso','outer','front',5,6,2,2,c.accent);cgShoes(c,4);}
  else if(id==='ninja'){fillPart('torso','base',c.primary);cgSleeves(c,c.primary,10,1);fillPart('rightLeg','base',c.pants);fillPart('leftLeg','base',c.pants);cgBand('torso','base','front',7,2,c.accent);cgShoes(c,4,'#09090b');}
  else if(id==='noble'){fillPart('torso','base','#f8fafc');cgSleeves(c,c.secondary,9,3);fillRegion(REGIONS.torso.outer.back,c.secondary);cgRect('torso','outer','front',0,0,3,12,c.secondary);cgRect('torso','outer','front',5,0,3,12,c.secondary);cgRect('torso','base','front',3,2,2,4,c.accent);fillPart('rightLeg','base',cgShade(c.secondary,.03));fillPart('leftLeg','base',cgShade(c.secondary,.03));cgShoes(c,3);}
}
function cgBack(style,c){if(style==='cape'){fillRegion(REGIONS.torso.outer.back,c.secondary);cgRect('torso','outer','back',1,1,6,10,cgShade(c.secondary,.08));cgStripe('torso','outer','back',3,2,c.accent);}else if(style==='backpack'){cgRect('torso','outer','back',1,1,6,9,cgShade(c.secondary,-.1));cgRect('torso','outer','back',2,2,4,6,c.secondary);cgBand('torso','outer','back',7,2,c.accent);}else if(style==='tank'){cgRect('torso','outer','back',1,1,2,9,c.metal);cgRect('torso','outer','back',5,1,2,9,c.metal);cgBand('torso','outer','back',3,1,c.accent);}else if(style==='quiver'){for(let i=0;i<7;i++)cgPixel('torso','outer','back',Math.min(7,i+1),9-i,c.boots);cgRect('torso','outer','back',5,1,2,8,c.secondary);}}
function cgAsym(style,c){const arm=cgChance(.5)?'rightArm':'leftArm',leg=arm==='rightArm'?'leftLeg':'rightLeg';if(style==='wrist')['front','back','left','right'].forEach(f=>cgBand(arm,'outer',f,8,2,c.accent));else if(style==='shoulder'){['front','back','left','right'].forEach(f=>cgRect(arm,'outer',f,0,0,4,3,c.metal));fillRegion(REGIONS[arm].outer.top,c.metal);}else if(style==='legpatch'){cgRect(leg,'outer','front',0,4,4,3,c.accent);}else if(style==='armstripe'){cgStripe(arm,'base','front',cgChance(.5)?0:3,1,c.accent);}}

function makeTemplate(recordHistory=true){
  if(recordHistory&&!confirm('¿Generar una skin random? La skin actual se reemplazará y podrás deshacer el cambio.'))return;
  if(recordHistory)pushHistory();skinCtx.clearRect(0,0,64,64);
  const p=cgProfile(),c=cgPalette(p);cgBase(c);cgFace(p,c);cgHair(p.hair,c);cgOutfit(p,c);cgBack(p.back,c);cgHead(p.head,c);cgFaceAccessory(p.face,c);cgAsym(p.asym,c);afterChange();showToast(recordHistory?`Generado: ${p.persona.label}`:`Plantilla: ${p.persona.label}`);
}
