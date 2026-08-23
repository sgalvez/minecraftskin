"use strict";

(function () {
  function norm(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }
  function hasAny(text, words) {
    return words.some(w => text.includes(w));
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mixHex(a, b, t) {
    const x = hexToRgb(a), y = hexToRgb(b), q = clamp(t, 0, 1);
    return rgbaToHex(
      Math.round(x.r + (y.r - x.r) * q),
      Math.round(x.g + (y.g - x.g) * q),
      Math.round(x.b + (y.b - x.b) * q)
    );
  }
  function shade(c, n) { return n >= 0 ? mixHex(c, '#ffffff', n) : mixHex(c, '#000000', -n); }
  function rect(part, layer, face, x, y, w, h, color, alpha = 255) {
    const r = REGIONS[part][layer][face];
    const x1 = clamp(x, 0, r.w), y1 = clamp(y, 0, r.h), x2 = clamp(x + w, 0, r.w), y2 = clamp(y + h, 0, r.h);
    for (let yy = y1; yy < y2; yy++) for (let xx = x1; xx < x2; xx++) localPixel(part, layer, face, xx, yy, color, alpha);
  }
  function band(part, layer, face, y, h, color, alpha = 255) { rect(part, layer, face, 0, y, REGIONS[part][layer][face].w, h, color, alpha); }
  function pixel(part, layer, face, x, y, color, alpha = 255) { rect(part, layer, face, x, y, 1, 1, color, alpha); }

  function updateBatmanFeedback(prompt) {
    const summary = document.getElementById('aiSkinStatus') || document.getElementById('aiSummary');
    const tags = document.getElementById('aiSkinInterpretation') || document.getElementById('aiTags');
    if (summary) summary.textContent = `Interpretado como: Vigilante oscuro${prompt ? ' (inspirado en tu descripción)' : ''}`;
    if (!tags) return;
    tags.innerHTML = '';
    tags.hidden = false;
    ['Vigilante oscuro', 'cabeza: capucha/casco', 'cara: máscara', 'espalda: capa', 'paleta: oscura'].forEach(text => {
      const span = document.createElement('span');
      span.textContent = text;
      span.className = 'ai-token';
      if (!span.className) {
        span.style.padding = '6px 10px';
        span.style.borderRadius = '999px';
      }
      tags.appendChild(span);
    });
  }

  function renderBatmanLike(prompt) {
    if (typeof pushHistory === 'function') pushHistory();

    const text = norm(prompt);
    const primary = hasAny(text, ['azul']) ? '#1e3a8a' : '#111827';
    const secondary = hasAny(text, ['gris', 'gray', 'grey']) ? '#4b5563' : '#1f2937';
    const accent = hasAny(text, ['amarillo', 'yellow', 'dorado', 'gold']) ? '#facc15' : '#64748b';
    const eye = hasAny(text, ['rojo', 'red']) ? '#ef4444' : '#93c5fd';
    const skin = '#c98f65';
    const skinDark = '#a96f4d';

    skinCtx.clearRect(0, 0, 64, 64);
    fillPart('head', 'base', skin);
    fillPart('torso', 'base', primary);
    fillPart('rightArm', 'base', primary);
    fillPart('leftArm', 'base', primary);
    fillPart('rightLeg', 'base', '#0f172a');
    fillPart('leftLeg', 'base', '#0f172a');
    Object.keys(REGIONS).forEach(part => clearPart(part, 'outer'));

    pixel('head', 'base', 'front', 2, 3, eye);
    pixel('head', 'base', 'front', 5, 3, eye);
    rect('head', 'base', 'front', 1, 3, 2, 1, '#ffffff');
    rect('head', 'base', 'front', 5, 3, 2, 1, '#ffffff');
    rect('head', 'base', 'front', 3, 6, 2, 1, skinDark);

    fillRegion(REGIONS.head.outer.top, secondary);
    fillRegion(REGIONS.head.outer.back, secondary);
    fillRegion(REGIONS.head.outer.left, secondary);
    fillRegion(REGIONS.head.outer.right, secondary);
    band('head', 'outer', 'front', 0, 2, secondary);
    rect('head', 'outer', 'front', 0, 1, 1, 7, secondary);
    rect('head', 'outer', 'front', 7, 1, 1, 7, secondary);
    rect('head', 'outer', 'front', 0, 4, 8, 4, secondary);
    pixel('head', 'outer', 'front', 1, 0, secondary);
    pixel('head', 'outer', 'front', 2, 0, secondary);
    pixel('head', 'outer', 'front', 5, 0, secondary);
    pixel('head', 'outer', 'front', 6, 0, secondary);
    pixel('head', 'outer', 'front', 1, 1, secondary);
    pixel('head', 'outer', 'front', 6, 1, secondary);

    rect('torso', 'base', 'front', 3, 1, 2, 8, shade(primary, .08));
    band('torso', 'base', 'front', 8, 2, accent);
    rect('torso', 'outer', 'front', 2, 3, 4, 2, shade(accent, -0.15));
    pixel('torso', 'outer', 'front', 3, 3, accent);
    pixel('torso', 'outer', 'front', 4, 3, accent);
    pixel('torso', 'outer', 'front', 2, 4, accent);
    pixel('torso', 'outer', 'front', 5, 4, accent);
    pixel('torso', 'outer', 'front', 3, 5, accent);
    pixel('torso', 'outer', 'front', 4, 5, accent);

    fillRegion(REGIONS.torso.outer.back, secondary);
    rect('torso', 'outer', 'back', 1, 1, 6, 10, shade(secondary, .05));
    rect('torso', 'outer', 'back', 3, 0, 2, 11, shade(secondary, -0.08));

    ['rightArm', 'leftArm'].forEach(part => {
      ['front', 'back', 'left', 'right'].forEach(face => {
        rect(part, 'base', face, 0, 8, 4, 4, shade(primary, -0.12));
        rect(part, 'outer', face, 0, 8, 4, 2, accent);
      });
    });
    ['rightLeg', 'leftLeg'].forEach(part => {
      ['front', 'back', 'left', 'right'].forEach(face => rect(part, 'base', face, 0, 9, 4, 3, '#09090b'));
      fillRegion(REGIONS[part].base.bottom, '#09090b');
    });

    afterChange();
    if (typeof scheduleSave === 'function') scheduleSave(true);
    updateBatmanFeedback(prompt);
    if (typeof showToast === 'function') showToast(`Listo: interpreté "${prompt}"`);
  }

  function patchedGenerate() {
    const input = document.getElementById('aiSkinPrompt') || document.getElementById('aiPromptInput');
    if (!input) return;
    const prompt = (input.value || '').trim();
    if (!prompt) {
      if (typeof showToast === 'function') showToast('Escribe primero cómo quieres la skin', true);
      input.focus();
      return;
    }
    const text = norm(prompt);
    if (hasAny(text, ['batman', 'bruce wayne', 'caballero de la noche', 'dark knight', 'murcielago', 'vigilante'])) {
      renderBatmanLike(prompt);
      return;
    }
    if (typeof aiGenerateFromPrompt === 'function') {
      aiGenerateFromPrompt(prompt);
      return;
    }
    if (typeof aiRenderFromPrompt === 'function') {
      aiRenderFromPrompt(prompt, true);
      return;
    }
    if (typeof makeTemplate === 'function') makeTemplate(true);
  }

  function bindPatch() {
    const btn = document.getElementById('aiSkinGenerate') || document.getElementById('aiGenerateBtn');
    const input = document.getElementById('aiSkinPrompt') || document.getElementById('aiPromptInput');
    if (!btn || !input) return false;
    if (btn.dataset.aiPatch6Bound === '1') return true;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      patchedGenerate();
    }, true);

    input.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        patchedGenerate();
      }
    }, true);

    input.placeholder = 'Ej.: Que sea como Batman, oscuro, con capa, máscara y cinturón amarillo';
    btn.dataset.aiPatch6Bound = '1';
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    if (bindPatch() || ++tries > 80) clearInterval(timer);
  }, 250);
  setTimeout(bindPatch, 50);
})();
