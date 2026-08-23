'use strict';

/*
 * SkinForge Pocket — generador creativo + intérprete de lenguaje natural.
 * Todo se ejecuta en el navegador. No usa API keys ni envía el prompt a un servidor.
 */

const AI_SKIN_TONES = ['#f6d2b8','#edc3a2','#dca47b','#c98f65','#b87957','#a66f4f','#8f5d43','#754936','#5f3b2d','#4a3026'];
const AI_HAIR_COLORS = ['#17120f','#2b1b14','#3b241d','#5a3523','#7c4a2d','#a66a3f','#d3a15f','#e5d0a1','#6b7280','#d1d5db','#2563eb','#7c3aed','#db2777','#0f766e'];
const AI_EYE_COLORS = ['#2563eb','#0f766e','#16a34a','#65a30d','#d97706','#7c3aed','#be123c','#334155'];
const AI_THEMES = [
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

const AI_PERSONAS = [
  { id:'adventurer', label:'Aventurero', keywords:['aventurero','aventurera','explorador','exploradora','arqueologo','arqueologa','ranger'], hair:['short','fringe','long','curly','sidecut'], head:['none','cap','hood'], face:['none','glasses','scar','scarf'], back:['none','backpack','cape'], emblems:['chevron','diamond','compass'] },
  { id:'knight', label:'Caballero', keywords:['caballero','caballera','guerrero','guerrera','paladin','paladina','samurai','armadura'], hair:['short','long','bald'], head:['helmet','none','crown'], face:['none','beard','scar'], back:['none','cape'], emblems:['cross','diamond','star'] },
  { id:'mage', label:'Mago', keywords:['mago','maga','hechicero','hechicera','brujo','bruja','wizard','sorcerer'], hair:['long','curly','bald','bun'], head:['hood','wizard','none'], face:['none','beard','facepaint'], back:['none','cape'], emblems:['rune','star','diamond'] },
  { id:'cyber', label:'Ciberpunk', keywords:['cyberpunk','ciberpunk','hacker','futurista','futuristico','futuristica','neon','cyber'], hair:['mohawk','sidecut','fringe','short'], head:['none','helmet','cap'], face:['goggles','mask','facepaint','none'], back:['none','tank','backpack'], emblems:['lightning','chevron','rune'] },
  { id:'polar', label:'Explorador polar', keywords:['polar','nieve','hielo','invierno','artico','antartico','esquiador','esquiadora'], hair:['short','long','fringe'], head:['beanie','hood'], face:['goggles','scarf','none'], back:['backpack','none'], emblems:['star','diamond','chevron'] },
  { id:'pirate', label:'Pirata', keywords:['pirata','corsario','corsaria','bucanero','bucanera'], hair:['long','curly','short','bald'], head:['bandana','none'], face:['eyepatch','beard','scar','none'], back:['none','cape'], emblems:['cross','chevron','diamond'] },
  { id:'astronaut', label:'Astronauta', keywords:['astronauta','espacial','espacio','cosmonauta','nasa'], hair:['short','bald'], head:['spacehelmet'], face:['none','visor'], back:['tank'], emblems:['star','chevron','diamond'] },
  { id:'mechanic', label:'Mecánico', keywords:['mecanico','mecanica','ingeniero','ingeniera','tecnico','tecnica','taller'], hair:['short','curly','sidecut','bald'], head:['hardhat','cap','none'], face:['goggles','glasses','beard','none'], back:['backpack','none'], emblems:['gear','chevron','none'] },
  { id:'ninja', label:'Ninja', keywords:['ninja','shinobi','asesino','asesina','sigiloso','sigilosa'], hair:['short','sidecut','bald'], head:['hood','bandana'], face:['mask','scar','none'], back:['none','cape'], emblems:['chevron','rune','lightning'] },
  { id:'druid', label:'Druida', keywords:['druida','bosque','naturaleza','elfo','elfa','forestal'], hair:['long','curly','bun','bald'], head:['hood','crown','none'], face:['facepaint','beard','none'], back:['cape','quiver','none'], emblems:['leaf','rune','star'] },
  { id:'noble', label:'Noble', keywords:['noble','rey','reina','principe','princesa','aristocrata','monarca'], hair:['long','short','bun','curly'], head:['crown','none'], face:['monocle','glasses','beard','none'], back:['cape','none'], emblems:['star','diamond','cross'] },
  { id:'miner', label:'Minero', keywords:['minero','minera','mina','mineria','excavador','excavadora'], hair:['short','curly','bald'], head:['hardhat'], face:['goggles','beard','scarf','none'], back:['backpack','none'], emblems:['gear','chevron','none'] }
];

const AI_COLOR_WORDS = {
  'negro':'#111111', 'negra':'#111111', 'black':'#111111',
  'blanco':'#f8fafc', 'blanca':'#f8fafc', 'white':'#f8fafc',
  'gris':'#64748b', 'gray':'#64748b', 'grey':'#64748b', 'plateado':'#cbd5e1', 'plateada':'#cbd5e1', 'silver':'#cbd5e1',
  'rojo':'#dc2626', 'roja':'#dc2626', 'red':'#dc2626', 'granate':'#991b1b',
  'naranja':'#f97316', 'orange':'#f97316',
  'amarillo':'#facc15', 'amarilla':'#facc15', 'yellow':'#facc15', 'dorado':'#f59e0b', 'dorada':'#f59e0b', 'gold':'#f59e0b',
  'verde':'#16a34a', 'green':'#16a34a', 'esmeralda':'#059669', 'lima':'#84cc16',
  'turquesa':'#14b8a6', 'teal':'#14b8a6', 'cyan':'#22d3ee', 'cian':'#22d3ee',
  'celeste':'#38bdf8', 'azul':'#2563eb', 'blue':'#2563eb', 'marino':'#1e3a8a',
  'morado':'#7c3aed', 'morada':'#7c3aed', 'purple':'#7c3aed', 'violeta':'#8b5cf6', 'violet':'#8b5cf6',
  'rosa':'#ec4899', 'rosado':'#ec4899', 'rosada':'#ec4899', 'pink':'#ec4899', 'magenta':'#db2777',
  'cafe':'#78350f', 'marron':'#78350f', 'brown':'#78350f', 'beige':'#d6b98c'
};

const AI_TRAIT_WORDS = {
  hair: {
    long:['pelo largo','cabello largo','melena larga','long hair'], short:['pelo corto','cabello corto','short hair'], curly:['pelo rizado','cabello rizado','rulos','rizado','rizada','curly'],
    mohawk:['mohawk','cresta','punk'], sidecut:['sidecut','rapado al lado','laterales rapados','undercut'], bun:['mono','moño','bun','coleta alta'], bald:['calvo','calva','rapado','rapada','sin pelo','bald'], fringe:['flequillo','fringe','chascas']
  },
  head: {
    cap:['gorra','cap'], hood:['capucha','hood'], beanie:['gorro','beanie'], hardhat:['casco de obra','casco minero','hardhat'], bandana:['bandana','pañuelo','panuelo'], crown:['corona','crown'], helmet:['casco','helmet'], spacehelmet:['casco espacial','space helmet'], wizard:['sombrero de mago','sombrero magico','wizard hat']
  },
  face: {
    glasses:['lentes','anteojos','gafas','glasses'], goggles:['antiparras','goggles'], beard:['barba','beard'], eyepatch:['parche','eyepatch'], mask:['mascara','mask'], monocle:['monoculo','monocle'], scar:['cicatriz','scar'], facepaint:['pintura facial','maquillaje de guerra','face paint'], scarf:['bufanda','scarf'], visor:['visor']
  },
  back: { cape:['capa','cape'], backpack:['mochila','backpack'], tank:['tanque de oxigeno','tanques de oxigeno','oxygen tank','jetpack'], quiver:['carcaj','flechas','quiver'] },
  expression: { smile:['sonriente','sonriendo','feliz','alegre','smile','happy'], frown:['enojado','enojada','triste','serio','seria','frown'], smirk:['sonrisa de lado','picaro','picara','smirk'], open:['boca abierta','sorprendido','sorprendida'] }
};

function aiPick(list) { return list[Math.floor(Math.random() * list.length)]; }
function aiChance(probability) { return Math.random() < probability; }
function aiClamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function aiNormalize(value) { return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ñ/g, 'n'); }
function aiContains(text, terms) { return terms.some(term => text.includes(aiNormalize(term))); }
function aiMix(a, b, t = .5) { const x = hexToRgb(a), y = hexToRgb(b), q = aiClamp(t, 0, 1); return rgbaToHex(Math.round(x.r + (y.r - x.r) * q), Math.round(x.g + (y.g - x.g) * q), Math.round(x.b + (y.b - x.b) * q)); }
function aiShade(color, amount) { return amount >= 0 ? aiMix(color, '#ffffff', amount) : aiMix(color, '#000000', -amount); }
function aiRect(part, layer, face, x, y, w, h, color, alpha = 255) { const r = REGIONS[part][layer][face]; const x0 = aiClamp(x, 0, r.w), y0 = aiClamp(y, 0, r.h), x1 = aiClamp(x + w, 0, r.w), y1 = aiClamp(y + h, 0, r.h); for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) localPixel(part, layer, face, xx, yy, color, alpha); }
function aiPixel(part, layer, face, x, y, color, alpha = 255) { aiRect(part, layer, face, x, y, 1, 1, color, alpha); }
function aiBand(part, layer, face, y, h, color, alpha = 255) { aiRect(part, layer, face, 0, y, REGIONS[part][layer][face].w, h, color, alpha); }
function aiStripe(part, layer, face, x, w, color, alpha = 255) { aiRect(part, layer, face, x, 0, w, REGIONS[part][layer][face].h, color, alpha); }
function aiSideFaces(part, layer, color) { ['front','back','left','right'].forEach(face => fillRegion(REGIONS[part][layer][face], color)); }

function aiPersonaFromText(text) {
  let winner = null, score = 0;
  for (const persona of AI_PERSONAS) { let s = 0; for (const keyword of persona.keywords) if (text.includes(aiNormalize(keyword))) s += keyword.length > 7 ? 3 : 2; if (s > score) { score = s; winner = persona; } }
  return winner;
}
function aiTraitFromText(text, group) { const variants = AI_TRAIT_WORDS[group]; for (const [value, words] of Object.entries(variants)) if (aiContains(text, words)) return value; return null; }
function aiColorCandidates(text) {
  const hits = [];
  for (const [word, hex] of Object.entries(AI_COLOR_WORDS)) { let start = 0; while (true) { const index = text.indexOf(word, start); if (index < 0) break; hits.push({ word, hex, index }); start = index + word.length; } }
  const hexRegex = /#[0-9a-f]{6}\b/gi; for (const match of text.matchAll(hexRegex)) hits.push({ word: match[0], hex: match[0].toLowerCase(), index: match.index || 0 });
  return hits.sort((a, b) => a.index - b.index);
}
function aiNearestColor(text, nouns, hits, maxDistance = 36) {
  let best = null;
  for (const noun of nouns) { let from = 0, normalizedNoun = aiNormalize(noun); while (true) { const nounIndex = text.indexOf(normalizedNoun, from); if (nounIndex < 0) break; for (const hit of hits) { const distance = Math.abs(hit.index - nounIndex); if (distance <= maxDistance && (!best || distance < best.distance)) best = { ...hit, distance }; } from = nounIndex + normalizedNoun.length; } }
  return best?.hex || null;
}

function aiRandomProfile() {
  const pool = AI_PERSONAS.filter(persona => persona.id !== state.lastCreativePersona), persona = aiPick(pool.length ? pool : AI_PERSONAS);
  const profile = { persona, hair: aiPick(persona.hair), head: aiPick(persona.head), face: aiPick(persona.face), back: aiPick(persona.back), emblem: aiPick(persona.emblems), eyes: aiPick(['normal','normal','wide','narrow','hetero']), mouth: aiPick(['neutral','smile','smirk','open','frown']), detail: aiPick(['none','none','freckles','blush','brows']), asym: aiPick(['none','wrist','shoulder','legpatch','armstripe']) };
  state.lastCreativePersona = persona.id; return profile;
}
function aiRandomPalette(profile) {
  const theme = aiPick(AI_THEMES), skin = aiPick(AI_SKIN_TONES), shift = aiPick([-.12,-.06,0,.06,.12]);
  const palette = { skin, skinDark: aiShade(skin, -.18), hair: aiPick(AI_HAIR_COLORS), eye: aiPick(AI_EYE_COLORS), eye2: aiPick(AI_EYE_COLORS), primary: aiShade(theme[0], shift), secondary: aiShade(theme[1], shift / 2), accent: aiShade(theme[2], aiPick([-.12,0,.12])), pants: aiShade(theme[3], -shift / 2), boots: theme[4], metal: aiShade(theme[5], aiPick([-.08,0,.08])) };
  if (profile.persona.id === 'astronaut') { palette.primary = aiPick(['#f8fafc','#e5e7eb','#dbeafe']); palette.secondary = aiShade(palette.primary, -.15); palette.pants = palette.primary; palette.boots = '#334155'; }
  if (profile.persona.id === 'ninja') { palette.primary = aiPick(['#111827','#18181b','#1e293b']); palette.secondary = aiShade(palette.primary, -.12); palette.pants = aiShade(palette.primary, .06); palette.boots = '#09090b'; }
  if (profile.persona.id === 'pirate') palette.primary = aiPick(['#f5f5dc','#e7e5e4','#fef3c7']); return palette;
}

function aiInterpretPrompt(rawPrompt) {
  const text = aiNormalize(rawPrompt), base = aiRandomProfile(), detectedPersona = aiPersonaFromText(text); if (detectedPersona) base.persona = detectedPersona;
  base.hair = aiTraitFromText(text, 'hair') || (base.persona.hair.includes(base.hair) ? base.hair : aiPick(base.persona.hair));
  base.head = aiTraitFromText(text, 'head') || aiPick(base.persona.head); base.face = aiTraitFromText(text, 'face') || aiPick(base.persona.face); base.back = aiTraitFromText(text, 'back') || aiPick(base.persona.back); base.emblem = aiPick(base.persona.emblems); base.mouth = aiTraitFromText(text, 'expression') || base.mouth;
  if (aiContains(text, ['sin sombrero','sin casco','sin gorro','cabeza descubierta'])) base.head = 'none';
  if (aiContains(text, ['sin barba','afeitado','afeitada']) && base.face === 'beard') base.face = 'none';
  if (aiContains(text, ['sin capa','sin mochila']) && ['cape','backpack'].includes(base.back)) base.back = 'none';
  if (aiContains(text, ['pecas','freckles'])) base.detail = 'freckles'; if (aiContains(text, ['rubor','mejillas rosadas'])) base.detail = 'blush'; if (aiContains(text, ['cejas marcadas','cejas gruesas'])) base.detail = 'brows';
  if (aiContains(text, ['heterocromia','ojos de distinto color'])) base.eyes = 'hetero'; if (aiContains(text, ['ojos grandes'])) base.eyes = 'wide'; if (aiContains(text, ['ojos pequenos','ojos estrechos'])) base.eyes = 'narrow';

  const palette = aiRandomPalette(base), hits = aiColorCandidates(text);
  const skinColor = aiNearestColor(text, ['piel','skin','cara','rostro'], hits, 30), hairColor = aiNearestColor(text, ['pelo','cabello','hair','melena'], hits, 30), eyeColor = aiNearestColor(text, ['ojo','ojos','eyes'], hits, 24), primaryColor = aiNearestColor(text, ['ropa','traje','camiseta','polera','chaqueta','hoodie','tunica','armadura','vestido','uniforme'], hits, 44), pantsColor = aiNearestColor(text, ['pantalon','pantalones','jeans','piernas'], hits, 30), bootsColor = aiNearestColor(text, ['botas','zapatos','calzado'], hits, 30), accentColor = aiNearestColor(text, ['detalle','detalles','acento','luces','lineas','borde'], hits, 30);
  if (skinColor) { palette.skin = skinColor; palette.skinDark = aiShade(skinColor, -.18); } else if (aiContains(text, ['piel oscura','moreno','morena'])) { palette.skin = '#754936'; palette.skinDark = '#563328'; } else if (aiContains(text, ['piel clara','palido','palida'])) { palette.skin = '#f2c6a0'; palette.skinDark = '#d5a27b'; }
  if (hairColor) palette.hair = hairColor; if (eyeColor) { palette.eye = eyeColor; palette.eye2 = eyeColor; } if (primaryColor) palette.primary = primaryColor; if (pantsColor) palette.pants = pantsColor; if (bootsColor) palette.boots = bootsColor; if (accentColor) palette.accent = accentColor;
  if (!primaryColor && hits.length === 1 && !hairColor && !eyeColor && !skinColor && !pantsColor && !bootsColor) palette.primary = hits[0].hex;
  if (aiContains(text, ['oscuro','oscura','dark'])) { palette.primary = aiShade(palette.primary, -.25); palette.secondary = aiShade(palette.secondary, -.25); palette.pants = aiShade(palette.pants, -.18); }
  if (aiContains(text, ['pastel','suave'])) { palette.primary = aiShade(palette.primary, .3); palette.secondary = aiShade(palette.secondary, .3); palette.accent = aiShade(palette.accent, .22); }
  if (aiContains(text, ['neon','brillante','luminoso','luminosa'])) palette.accent = aiPick(['#22d3ee','#a3e635','#f0abfc','#facc15','#fb7185']);
  if (aiContains(text, ['metalico','metalica','plateado','plateada'])) palette.metal = '#cbd5e1'; if (aiContains(text, ['dorado','dorada','oro'])) palette.metal = '#f59e0b';
  state.lastCreativePersona = base.persona.id; return { profile: base, palette, hits };
}

function aiBase(palette) { fillPart('head','base',palette.skin); fillPart('torso','base',palette.primary); fillPart('rightArm','base',palette.skin); fillPart('leftArm','base',palette.skin); fillPart('rightLeg','base',palette.pants); fillPart('leftLeg','base',palette.pants); Object.keys(REGIONS).forEach(part => clearPart(part,'outer')); }
function aiDrawFace(profile, palette) {
  const y = aiChance(.25) ? 2 : 3, leftEye = profile.eyes === 'hetero' ? palette.eye2 : palette.eye;
  if (profile.eyes === 'wide') { aiRect('head','base','front',1,y,2,2,'#ffffff'); aiRect('head','base','front',5,y,2,2,'#ffffff'); aiPixel('head','base','front',2,y+1,leftEye); aiPixel('head','base','front',5,y+1,palette.eye); }
  else if (profile.eyes === 'narrow') { aiRect('head','base','front',1,y,2,1,aiShade(palette.skinDark,-.15)); aiRect('head','base','front',5,y,2,1,aiShade(palette.skinDark,-.15)); aiPixel('head','base','front',2,y+1,leftEye); aiPixel('head','base','front',5,y+1,palette.eye); }
  else { aiPixel('head','base','front',1,y,'#ffffff'); aiPixel('head','base','front',2,y,leftEye); aiPixel('head','base','front',5,y,palette.eye); aiPixel('head','base','front',6,y,'#ffffff'); }
  if (aiChance(.5)) { aiPixel('head','base','front',1,y-1,aiShade(palette.hair,-.15)); aiPixel('head','base','front',6,y-1,aiShade(palette.hair,-.15)); } aiPixel('head','base','front',aiChance(.5)?3:4,5,palette.skinDark);
  if (profile.mouth === 'smile') { aiPixel('head','base','front',2,6,palette.skinDark); aiRect('head','base','front',3,7,2,1,palette.skinDark); aiPixel('head','base','front',5,6,palette.skinDark); }
  else if (profile.mouth === 'smirk') { aiRect('head','base','front',3,6,2,1,palette.skinDark); aiPixel('head','base','front',5,5,palette.skinDark); }
  else if (profile.mouth === 'open') { aiRect('head','base','front',3,6,2,2,aiShade(palette.skinDark,-.25)); aiRect('head','base','front',3,7,2,1,'#fda4af'); }
  else if (profile.mouth === 'frown') { aiPixel('head','base','front',2,7,palette.skinDark); aiRect('head','base','front',3,6,2,1,palette.skinDark); aiPixel('head','base','front',5,7,palette.skinDark); } else aiRect('head','base','front',3,6,2,1,palette.skinDark);
  if (profile.detail === 'freckles') [[1,5],[2,5],[5,5],[6,5]].forEach(([x,yy]) => aiPixel('head','base','front',x,yy,palette.skinDark)); if (profile.detail === 'blush') { aiRect('head','base','front',0,5,2,1,'#e98b8b'); aiRect('head','base','front',6,5,2,1,'#e98b8b'); } if (profile.detail === 'brows') { aiRect('head','base','front',1,2,2,1,aiShade(palette.hair,-.1)); aiRect('head','base','front',5,2,2,1,aiShade(palette.hair,-.1)); }
}
function aiDrawHair(style, palette) {
  const color = palette.hair; if (style === 'bald') return;
  if (style === 'mohawk') { aiRect('head','outer','top',3,0,2,8,color); aiRect('head','outer','front',2,0,4,2,color); aiRect('head','outer','back',2,0,4,4,color); return; }
  if (style === 'sidecut') { fillRegion(REGIONS.head.outer.top,color); aiRect('head','outer','front',1,0,6,3,color); aiRect('head','outer','back',1,0,6,4,color); aiBand('head','base','left',0,2,aiShade(color,-.2)); aiBand('head','base','right',0,2,aiShade(color,-.2)); return; }
  fillRegion(REGIONS.head.outer.top,color);
  if (style === 'long') { fillRegion(REGIONS.head.outer.back,color); aiRect('head','outer','left',0,0,8,7,color); aiRect('head','outer','right',0,0,8,7,color); aiBand('head','outer','front',0,3,color); aiRect('head','outer','front',0,3,2,4,color); aiRect('head','outer','front',6,3,2,4,color); }
  else if (style === 'bun') { aiBand('head','outer','front',0,2,color); aiBand('head','outer','back',0,5,color); aiBand('head','outer','left',0,4,color); aiBand('head','outer','right',0,4,color); aiRect('head','outer','back',3,5,2,3,aiShade(color,-.15)); }
  else if (style === 'curly') { ['front','back','left','right'].forEach(face => { for (let x=0;x<8;x++) { aiPixel('head','outer',face,x,0,color); if (x%2===0) aiPixel('head','outer',face,x,1,color); if (x%3===0) aiPixel('head','outer',face,x,2,color); } }); }
  else if (style === 'fringe') { aiBand('head','outer','front',0,2,color); [0,2,5,7].forEach((x,i) => aiPixel('head','outer','front',x,2+i%2,color)); aiBand('head','outer','back',0,5,color); aiBand('head','outer','left',0,4,color); aiBand('head','outer','right',0,4,color); }
  else { aiBand('head','outer','front',0,2,color); aiBand('head','outer','back',0,4,color); aiBand('head','outer','left',0,3,color); aiBand('head','outer','right',0,3,color); }
  if (aiChance(.18)) { aiRect('head','outer','front',aiChance(.5)?1:6,0,1,3,palette.accent); aiRect('head','outer','top',aiChance(.5)?2:5,0,1,8,palette.accent); }
}
function aiDrawHeadwear(style, palette) {
  if (style === 'none') return; const main = ['helmet','spacehelmet'].includes(style) ? palette.metal : palette.secondary, trim = aiShade(main,-.18);
  if (style === 'cap') { fillRegion(REGIONS.head.outer.top,main); ['front','back','left','right'].forEach(face => aiBand('head','outer',face,0,face==='front'?3:4,main)); aiBand('head','outer','front',3,1,trim); }
  else if (style === 'beanie') { fillRegion(REGIONS.head.outer.top,main); ['front','back','left','right'].forEach(face => { aiBand('head','outer',face,0,4,main); aiBand('head','outer',face,3,1,palette.accent); }); }
  else if (style === 'hood') { fillRegion(REGIONS.head.outer.top,main); fillRegion(REGIONS.head.outer.back,main); fillRegion(REGIONS.head.outer.left,main); fillRegion(REGIONS.head.outer.right,main); aiBand('head','outer','front',0,2,main); aiRect('head','outer','front',0,1,1,7,main); aiRect('head','outer','front',7,1,1,7,main); }
  else if (style === 'helmet' || style === 'spacehelmet') { fillRegion(REGIONS.head.outer.top,main); fillRegion(REGIONS.head.outer.back,main); fillRegion(REGIONS.head.outer.left,main); fillRegion(REGIONS.head.outer.right,main); aiBand('head','outer','front',0,2,main); aiRect('head','outer','front',0,1,1,7,main); aiRect('head','outer','front',7,1,1,7,main); if (style === 'spacehelmet') aiRect('head','outer','front',1,2,6,3,aiShade(palette.eye,.2),210); }
  else if (style === 'bandana') { ['front','back','left','right'].forEach(face => aiBand('head','outer',face,2,2,palette.accent)); aiRect('head','outer','back',6,4,2,3,palette.accent); }
  else if (style === 'crown') { ['front','back','left','right'].forEach(face => aiBand('head','outer',face,1,2,'#facc15')); [0,3,4,7].forEach(x => aiPixel('head','outer','front',x,0,'#facc15')); aiRect('head','outer','front',3,2,2,1,palette.accent); }
  else if (style === 'hardhat') { fillRegion(REGIONS.head.outer.top,main); ['front','back','left','right'].forEach(face => aiBand('head','outer',face,0,2,main)); aiBand('head','outer','front',2,1,trim); aiRect('head','outer','front',3,0,2,2,palette.accent); }
  else if (style === 'wizard') { fillRegion(REGIONS.head.outer.top,main); aiBand('head','outer','front',2,2,trim); aiRect('head','outer','front',1,1,6,1,main); aiRect('head','outer','front',2,0,4,1,main); aiBand('head','outer','back',0,4,main); }
}
function aiDrawFaceAccessory(style, palette) {
  if (style === 'none') return; const dark = aiShade(palette.secondary,-.35);
  if (style === 'glasses' || style === 'goggles') { const color = style === 'goggles' ? palette.accent : dark, alpha = style === 'goggles' ? 225 : 255; aiRect('head','outer','front',1,3,2,2,color,alpha); aiRect('head','outer','front',5,3,2,2,color,alpha); aiRect('head','outer','front',3,4,2,1,color); }
  else if (style === 'beard') { const beard = aiShade(palette.hair, aiChance(.5) ? -.12 : .08); aiRect('head','outer','front',2,5,4,3,beard); aiPixel('head','outer','front',1,6,beard); aiPixel('head','outer','front',6,6,beard); }
  else if (style === 'eyepatch') { aiRect('head','outer','front',1,3,2,2,dark); aiBand('head','outer','front',2,1,dark); }
  else if (style === 'mask') { aiRect('head','outer','front',0,4,8,4,palette.secondary); ['left','right','back'].forEach(face => aiBand('head','outer',face,4,4,palette.secondary)); }
  else if (style === 'monocle') { aiRect('head','outer','front',5,3,2,2,palette.metal); aiPixel('head','outer','front',6,5,palette.metal); aiPixel('head','outer','front',6,6,palette.metal); }
  else if (style === 'scar') { aiPixel('head','outer','front',5,2,'#7f1d1d'); aiPixel('head','outer','front',4,3,'#7f1d1d'); aiPixel('head','outer','front',5,4,'#7f1d1d'); }
  else if (style === 'facepaint') { aiRect('head','outer','front',0,4,3,1,palette.accent); aiRect('head','outer','front',5,4,3,1,palette.accent); aiRect('head','outer','front',3,5,2,1,palette.accent); }
  else if (style === 'scarf') { ['front','back','left','right'].forEach(face => aiBand('head','outer',face,6,2,palette.accent)); aiRect('torso','outer','front',3,0,2,4,palette.accent); }
  else if (style === 'visor') aiRect('head','outer','front',1,2,6,3,aiShade(palette.accent,.15),215);
}
function aiSleeves(palette, color, length = 4, hands = 3) { ['rightArm','leftArm'].forEach(part => { fillRegion(REGIONS[part].base.top,color); ['front','back','left','right'].forEach(face => { aiRect(part,'base',face,0,0,4,length,color); if (hands) aiRect(part,'base',face,0,12-hands,4,hands,palette.skin); }); }); }
function aiShoes(palette, height = 3, color = palette.boots) { ['rightLeg','leftLeg'].forEach(part => { ['front','back','left','right'].forEach(face => aiRect(part,'base',face,0,12-height,4,height,color)); fillRegion(REGIONS[part].base.bottom,color); }); }
function aiDrawOutfit(profile, palette) {
  const id = profile.persona.id;
  if (id === 'adventurer') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.primary,5,7); aiSideFaces('torso','outer',palette.secondary); aiRect('torso','outer','front',3,0,2,12,aiShade(palette.secondary,-.18)); aiRect('torso','outer','front',1,4,2,2,palette.accent); aiRect('torso','outer','front',5,4,2,2,palette.accent); aiShoes(palette,4); }
  else if (id === 'knight') { fillPart('torso','base','#1f2937'); aiSleeves(palette,'#1f2937',9,3); aiSideFaces('torso','outer',palette.metal); aiRect('torso','outer','front',1,1,6,8,aiShade(palette.metal,.1)); aiRect('torso','outer','front',3,1,2,8,palette.accent); ['rightArm','leftArm'].forEach(part => ['front','back','left','right'].forEach(face => aiRect(part,'outer',face,0,0,4,4,palette.metal))); aiShoes(palette,4,aiShade(palette.metal,-.35)); }
  else if (id === 'mage' || id === 'druid') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.primary,11,1); aiStripe('torso','base','front',3,2,palette.accent); aiRect('torso','outer','front',2,3,4,4,aiShade(palette.secondary,.08)); aiRect('torso','outer','front',3,3,2,4,palette.accent); ['rightLeg','leftLeg'].forEach(part => ['front','back','left','right'].forEach(face => aiRect(part,'base',face,0,0,4,8,palette.primary))); aiShoes(palette,3,aiShade(palette.secondary,-.3)); }
  else if (id === 'cyber') { const dark = aiShade(palette.secondary,-.2); fillPart('torso','base',dark); aiSleeves(palette,dark,10,2); aiStripe('torso','base','front',aiChance(.5)?1:6,1,palette.accent); aiBand('torso','base','front',4,1,palette.accent); aiRect('torso','outer','front',2,2,4,3,aiShade(dark,.12)); aiShoes(palette,4,'#111827'); }
  else if (id === 'polar') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.secondary,10,2); aiSideFaces('torso','outer',palette.secondary); aiStripe('torso','outer','front',3,2,aiShade(palette.secondary,-.18)); aiBand('torso','outer','front',9,1,palette.accent); aiShoes(palette,5); }
  else if (id === 'pirate') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.primary,5,7); fillRegion(REGIONS.torso.outer.back,palette.secondary); aiRect('torso','outer','front',0,0,3,10,palette.secondary); aiRect('torso','outer','front',5,0,3,10,palette.secondary); aiBand('torso','base','front',7,2,palette.accent); aiShoes(palette,5); }
  else if (id === 'astronaut') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.primary,9,0); fillPart('rightLeg','base',palette.primary); fillPart('leftLeg','base',palette.primary); aiRect('torso','outer','front',1,2,6,5,palette.secondary); aiRect('torso','outer','front',2,3,4,2,'#111827'); ['#ef4444','#22c55e','#3b82f6','#facc15'].forEach((color,i) => aiPixel('torso','outer','front',2+i,3,color)); aiShoes(palette,4,palette.boots); }
  else if (id === 'mechanic' || id === 'miner') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.primary,4,8); fillPart('rightLeg','base',palette.pants); fillPart('leftLeg','base',palette.pants); aiRect('torso','base','front',2,2,4,8,palette.pants); aiRect('torso','base','front',1,0,1,5,aiShade(palette.pants,.15)); aiRect('torso','base','front',6,0,1,5,aiShade(palette.pants,.15)); aiRect('torso','outer','front',5,6,2,2,palette.accent); aiShoes(palette,4); }
  else if (id === 'ninja') { fillPart('torso','base',palette.primary); aiSleeves(palette,palette.primary,10,1); fillPart('rightLeg','base',palette.pants); fillPart('leftLeg','base',palette.pants); aiBand('torso','base','front',7,2,palette.accent); aiShoes(palette,4,'#09090b'); }
  else { fillPart('torso','base','#f8fafc'); aiSleeves(palette,palette.secondary,9,3); fillRegion(REGIONS.torso.outer.back,palette.secondary); aiRect('torso','outer','front',0,0,3,12,palette.secondary); aiRect('torso','outer','front',5,0,3,12,palette.secondary); aiRect('torso','base','front',3,2,2,4,palette.accent); fillPart('rightLeg','base',aiShade(palette.secondary,.03)); fillPart('leftLeg','base',aiShade(palette.secondary,.03)); aiShoes(palette,3); }
}
function aiDrawBack(style, palette) { if (style === 'cape') { fillRegion(REGIONS.torso.outer.back,palette.secondary); aiRect('torso','outer','back',1,1,6,10,aiShade(palette.secondary,.08)); aiStripe('torso','outer','back',3,2,palette.accent); } else if (style === 'backpack') { aiRect('torso','outer','back',1,1,6,9,aiShade(palette.secondary,-.1)); aiRect('torso','outer','back',2,2,4,6,palette.secondary); aiBand('torso','outer','back',7,2,palette.accent); } else if (style === 'tank') { aiRect('torso','outer','back',1,1,2,9,palette.metal); aiRect('torso','outer','back',5,1,2,9,palette.metal); aiBand('torso','outer','back',3,1,palette.accent); } else if (style === 'quiver') { for (let i=0;i<7;i++) aiPixel('torso','outer','back',Math.min(7,i+1),9-i,palette.boots); aiRect('torso','outer','back',5,1,2,8,palette.secondary); } }
function aiDrawEmblem(emblem, palette) { if (emblem === 'none') return; if (emblem === 'diamond') { aiRect('torso','outer','front',3,3,2,1,palette.accent); aiRect('torso','outer','front',2,4,4,2,palette.accent); aiRect('torso','outer','front',3,6,2,1,palette.accent); } else if (emblem === 'cross') { aiRect('torso','outer','front',3,2,2,6,palette.accent); aiRect('torso','outer','front',1,4,6,2,palette.accent); } else if (emblem === 'chevron') [[1,3],[2,4],[3,5],[4,5],[5,4],[6,3]].forEach(([x,y]) => aiPixel('torso','outer','front',x,y,palette.accent)); else if (emblem === 'rune') { aiRect('torso','outer','front',3,2,2,6,palette.accent); [[2,3],[5,3],[2,6],[5,6]].forEach(([x,y]) => aiPixel('torso','outer','front',x,y,palette.accent)); } else if (emblem === 'star') { aiRect('torso','outer','front',2,3,4,4,palette.accent); aiBand('torso','outer','front',4,2,palette.accent); } else if (emblem === 'lightning') { aiRect('torso','outer','front',4,2,2,2,palette.accent); aiRect('torso','outer','front',3,4,2,2,palette.accent); aiRect('torso','outer','front',2,6,2,2,palette.accent); } else if (emblem === 'gear') { aiRect('torso','outer','front',2,3,4,1,palette.accent); aiRect('torso','outer','front',2,6,4,1,palette.accent); aiRect('torso','outer','front',1,4,1,2,palette.accent); aiRect('torso','outer','front',6,4,1,2,palette.accent); } else if (emblem === 'leaf') { for (let i=0;i<5;i++) aiPixel('torso','outer','front',2+Math.floor(i/2),3+i,palette.accent); } else { aiRect('torso','outer','front',3,2,2,6,palette.accent); aiBand('torso','outer','front',4,2,palette.accent); } }
function aiDrawAsymmetry(style, palette) { const arm = aiChance(.5) ? 'rightArm' : 'leftArm', leg = aiChance(.5) ? 'rightLeg' : 'leftLeg'; if (style === 'wrist') ['front','back','left','right'].forEach(face => aiBand(arm,'outer',face,8,2,palette.accent)); else if (style === 'shoulder') ['front','back','left','right'].forEach(face => aiRect(arm,'outer',face,0,0,4,3,palette.metal)); else if (style === 'legpatch') { aiRect(leg,'outer','front',0,4,4,3,aiShade(palette.accent,-.08)); aiRect(leg,'outer','front',1,5,2,1,'#f8fafc'); } else if (style === 'armstripe') aiStripe(arm,'outer','front',aiChance(.5)?0:3,1,palette.accent); }
function aiRenderSkin(profile, palette) { skinCtx.clearRect(0,0,64,64); aiBase(palette); aiDrawFace(profile,palette); aiDrawHair(profile.hair,palette); aiDrawOutfit(profile,palette); aiDrawBack(profile.back,palette); aiDrawEmblem(profile.emblem,palette); aiDrawHeadwear(profile.head,palette); aiDrawFaceAccessory(profile.face,palette); aiDrawAsymmetry(profile.asym,palette); }

const AI_LABELS = { short:'pelo corto', fringe:'flequillo', long:'pelo largo', curly:'pelo rizado', sidecut:'sidecut', mohawk:'mohawk', bun:'moño', bald:'rapado', cap:'gorra', hood:'capucha', beanie:'gorro', hardhat:'casco de trabajo', bandana:'bandana', crown:'corona', helmet:'casco', spacehelmet:'casco espacial', wizard:'sombrero de mago', none:'sin accesorio', glasses:'lentes', goggles:'antiparras', beard:'barba', eyepatch:'parche', mask:'máscara', monocle:'monóculo', scar:'cicatriz', facepaint:'pintura facial', scarf:'bufanda', visor:'visor', backpack:'mochila', cape:'capa', tank:'tanques', quiver:'carcaj', smile:'sonriente', frown:'serio', smirk:'sonrisa lateral', open:'sorprendido' };
function aiSummary(profile, palette, fromPrompt = false) { const labels = [profile.persona.label, AI_LABELS[profile.hair], AI_LABELS[profile.head], AI_LABELS[profile.face], AI_LABELS[profile.back]].filter(Boolean); if (fromPrompt) labels.push(`ropa ${palette.primary}`); return labels; }

makeTemplate = function(recordHistory = true) { if (recordHistory && !confirm('¿Generar una skin random? La skin actual se reemplazará y podrás deshacer el cambio.')) return; if (recordHistory) pushHistory(); const profile = aiRandomProfile(), palette = aiRandomPalette(profile); aiRenderSkin(profile,palette); afterChange(); showToast(recordHistory ? `Generado: ${profile.persona.label}` : `Plantilla: ${profile.persona.label}`); };

function aiGenerateFromPrompt(rawPrompt) {
  const prompt = String(rawPrompt || '').trim(); if (prompt.length < 3) { showToast('Describe la skin con unas pocas palabras', true); return; }
  pushHistory(); const result = aiInterpretPrompt(prompt); aiRenderSkin(result.profile,result.palette); afterChange(); scheduleSave(true);
  const summary = aiSummary(result.profile,result.palette,true), output = document.getElementById('aiSkinInterpretation');
  if (output) { output.innerHTML = summary.map(item => `<span class="ai-token">${item}</span>`).join(''); output.hidden = false; }
  const status = document.getElementById('aiSkinStatus'); if (status) status.textContent = `Interpretado como ${result.profile.persona.label.toLowerCase()}. Todo se procesó localmente.`;
  showToast(`Skin creada: ${result.profile.persona.label}`);
}

function aiMountPromptUI() {
  if (document.getElementById('aiSkinCard')) return; const firstStack = document.querySelector('.workspace > .stack'); if (!firstStack) return;
  const style = document.createElement('style'); style.textContent = `.ai-skin-card .ai-skin-body{padding:16px;display:grid;gap:12px}.ai-skin-card .ai-skin-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ai-skin-card .ai-badge{font-size:11px;font-weight:800;letter-spacing:.02em;padding:6px 9px;border-radius:999px;background:rgba(67,216,121,.12);color:#78e79d;border:1px solid rgba(67,216,121,.24);white-space:nowrap}.ai-skin-card textarea{width:100%;min-height:96px;resize:vertical;border:1px solid var(--border,#2a3443);border-radius:13px;background:rgba(8,15,25,.72);color:inherit;padding:13px 14px;font:inherit;font-size:16px;line-height:1.45;outline:none;box-sizing:border-box}.ai-skin-card textarea:focus{border-color:#43d879;box-shadow:0 0 0 3px rgba(67,216,121,.12)}.ai-skin-actions{display:flex;gap:9px;flex-wrap:wrap}.ai-skin-actions .btn{min-height:44px}.ai-examples{display:flex;gap:7px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.ai-examples::-webkit-scrollbar{display:none}.ai-example{border:1px solid var(--border,#2a3443);background:rgba(255,255,255,.035);color:inherit;border-radius:999px;padding:8px 11px;font:inherit;font-size:12px;white-space:nowrap;min-height:36px}.ai-example:active{transform:scale(.98)}.ai-interpretation{display:flex;gap:6px;flex-wrap:wrap}.ai-token{font-size:11px;padding:5px 8px;border-radius:999px;background:rgba(56,189,248,.09);color:#93dcfa;border:1px solid rgba(56,189,248,.18)}.ai-skin-status{margin:0;color:var(--muted,#9ba8ba);font-size:12px;line-height:1.45}@media(max-width:620px){.ai-skin-card .ai-skin-heading{display:block}.ai-skin-card .ai-badge{display:inline-block;margin-top:8px}.ai-skin-actions .btn{flex:1 1 150px}}`; document.head.appendChild(style);
  const section = document.createElement('section'); section.className = 'card ai-skin-card'; section.id = 'aiSkinCard';
  section.innerHTML = `<div class="card-header"><div class="ai-skin-heading" style="width:100%"><div><h2 style="margin:0">Crear con IA local</h2><p>Describe tu personaje con palabras simples. El intérprete entiende arquetipo, ropa, colores, pelo y accesorios.</p></div><span class="ai-badge">En tu navegador · sin API</span></div></div><div class="ai-skin-body"><label for="aiSkinPrompt" class="section-label"><span>¿Qué skin quieres?</span></label><textarea id="aiSkinPrompt" maxlength="320" autocapitalize="sentences" spellcheck="true" placeholder="Ej.: Un ninja oscuro con capucha morada, máscara, ojos verdes y una cicatriz"></textarea><div class="ai-skin-actions"><button class="btn primary" id="aiSkinGenerate" type="button">Interpretar y crear</button><button class="btn ghost" id="aiSkinSurprise" type="button">Dame una idea</button></div><div class="ai-examples" aria-label="Ejemplos de prompts"><button class="ai-example" type="button">Astronauta blanco con visor azul y mochila</button><button class="ai-example" type="button">Pirata con pelo largo negro, parche y chaqueta roja</button><button class="ai-example" type="button">Maga del bosque con pelo morado y capa verde</button><button class="ai-example" type="button">Ciberpunk oscuro con mohawk rosa, goggles y detalles cyan</button></div><div class="ai-interpretation" id="aiSkinInterpretation" hidden></div><p class="ai-skin-status" id="aiSkinStatus">Procesamiento local: el texto no sale del dispositivo. No es un LLM remoto; es un intérprete NLP optimizado para estas skins.</p></div>`; firstStack.insertBefore(section, firstStack.firstElementChild);
  const prompt = section.querySelector('#aiSkinPrompt'), ideas = ['Caballero plateado con capa roja, cicatriz y ojos azules','Exploradora polar con gorro celeste, antiparras y mochila naranja','Ninja negro con máscara, detalles verdes neón y ojos morados','Mecánica con pelo rizado rojo, overol azul y lentes','Druida del bosque con pelo largo café, capa verde y pintura facial','Astronauta blanco con casco espacial, visor cyan y tanques plateados','Reina con corona dorada, pelo largo negro y ropa morada','Minero con barba, casco amarillo, ropa naranja y botas negras'];
  section.querySelector('#aiSkinGenerate').addEventListener('click', () => aiGenerateFromPrompt(prompt.value)); section.querySelector('#aiSkinSurprise').addEventListener('click', () => { prompt.value = aiPick(ideas); prompt.focus(); }); section.querySelectorAll('.ai-example').forEach(button => button.addEventListener('click', () => { prompt.value = button.textContent.trim(); aiGenerateFromPrompt(prompt.value); })); prompt.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); aiGenerateFromPrompt(prompt.value); } });
}

aiMountPromptUI();
