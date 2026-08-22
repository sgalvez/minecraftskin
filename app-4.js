function selectFace(face) { state.face = face; state.cursorCell = null; renderAll(); }
function selectTool(tool) { state.tool = tool; updateSelectors(); }
function selectView(view) { state.previewView = view; renderPreview(); updateSelectors(); }

function buildPalette() {
  els.palette.innerHTML = '';
  PALETTE.forEach(color => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.backgroundColor = color;
    btn.dataset.color = color;
    btn.setAttribute('aria-label', `Color ${color}`);
    btn.addEventListener('click', () => {
      state.color = color;
      els.colorPicker.value = color;
      state.tool = 'pencil';
      refreshPaletteActive();
      updateSelectors();
    });
    els.palette.appendChild(btn);
  });
  refreshPaletteActive();
}

function refreshPaletteActive() {
  document.querySelectorAll('.swatch').forEach(btn => btn.classList.toggle('active', btn.dataset.color.toLowerCase() === state.color.toLowerCase()));
}

function showToast(message, error = false) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.toggle('error', error);
  els.toast.classList.add('show');
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2300);
}

function sanitizeName(value) {
  return (value || 'mi-skin').trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'mi-skin';
}

function saveLocal() {
  try {
    const payload = {
      image: skinCanvas.toDataURL('image/png'),
      name: els.skinName.value,
      challenge: els.challengeText.textContent,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    els.saveStatus.textContent = 'Guardado ahora';
    setTimeout(() => { els.saveStatus.textContent = 'Local automático'; }, 1400);
  } catch (_) {
    els.saveStatus.textContent = 'Sin guardado local';
  }
}

function scheduleSave(immediate = false) {
  clearTimeout(state.saveTimer);
  if (immediate) saveLocal();
  else state.saveTimer = setTimeout(saveLocal, 450);
}

async function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const payload = JSON.parse(raw);
    if (!payload.image) return false;
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = payload.image; });
    skinCtx.clearRect(0, 0, 64, 64);
    skinCtx.drawImage(img, 0, 0, 64, 64);
    if (payload.name) els.skinName.value = payload.name;
    if (payload.challenge) els.challengeText.textContent = payload.challenge;
    return true;
  } catch (_) { return false; }
}

async function importFile(file) {
  if (!file) return;
  if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
    showToast('Selecciona un archivo PNG', true);
    return;
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    if (!((img.naturalWidth === 64 && img.naturalHeight === 64) || (img.naturalWidth === 128 && img.naturalHeight === 128))) {
      showToast(`La imagen mide ${img.naturalWidth}×${img.naturalHeight}; usa 64×64 o 128×128`, true);
      return;
    }
    pushHistory();
    skinCtx.clearRect(0, 0, 64, 64);
    skinCtx.imageSmoothingEnabled = false;
    skinCtx.drawImage(img, 0, 0, 64, 64);
    els.skinName.value = sanitizeName(file.name.replace(/\.png$/i, ''));
    afterChange();
    showToast(img.naturalWidth === 128 ? 'Skin importada y reducida a 64×64' : 'Skin importada');
  } catch (_) {
    showToast('No se pudo leer la imagen', true);
  } finally {
    URL.revokeObjectURL(url);
    els.fileInput.value = '';
  }
}

async function exportSkin() {
  const blob = await new Promise(resolve => skinCanvas.toBlob(resolve, 'image/png'));
  if (!blob) { showToast('No se pudo generar el PNG', true); return; }
  const filename = `${sanitizeName(els.skinName.value)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename, text: 'Skin 64×64 creada en SkinForge Pocket' });
      showToast('PNG compartido');
      return;
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  showToast('PNG generado');
}

function handleUVTap(event) {
  const rect = els.uvCanvas.getBoundingClientRect();
  const px = Math.floor((event.clientX - rect.left) / rect.width * 64);
  const py = Math.floor((event.clientY - rect.top) / rect.height * 64);
  let found = null;
  for (const [part, layers] of Object.entries(REGIONS)) {
    for (const [layer, faces] of Object.entries(layers)) {
      for (const [face, reg] of Object.entries(faces)) {
        if (px >= reg.x && px < reg.x + reg.w && py >= reg.y && py < reg.y + reg.h) {
          found = { part, layer, face };
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }
  if (!found) { showToast('Zona no utilizada por el modelo'); return; }
  Object.assign(state, found, { cursorCell: null });
  renderAll();
  document.getElementById('editorTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextChallenge() {
  let next = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  if (CHALLENGES.length > 1) while (next === els.challengeText.textContent) next = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  els.challengeText.textContent = next;
  scheduleSave();
}

function bindEvents() {
  document.getElementById('partSelector').addEventListener('click', e => { const b = e.target.closest('[data-part]'); if (b) selectPart(b.dataset.part); });
  document.getElementById('layerSelector').addEventListener('click', e => { const b = e.target.closest('[data-layer]'); if (b) selectLayer(b.dataset.layer); });
  document.getElementById('faceSelector').addEventListener('click', e => { const b = e.target.closest('[data-face]'); if (b) selectFace(b.dataset.face); });
  document.getElementById('toolSelector').addEventListener('click', e => { const b = e.target.closest('[data-tool]'); if (b) selectTool(b.dataset.tool); });
  document.querySelector('.preview-controls').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) selectView(b.dataset.view); });

  els.colorPicker.addEventListener('input', e => { state.color = e.target.value; state.tool = 'pencil'; refreshPaletteActive(); updateSelectors(); });
  els.opacityRange.addEventListener('input', e => { state.opacity = Number(e.target.value) / 100; els.opacityValue.textContent = `${e.target.value}%`; });
  els.brushSize.addEventListener('change', e => { state.brush = Number(e.target.value); });
  els.mirrorToggle.addEventListener('change', e => { state.mirror = e.target.checked; });
  els.gridToggle.addEventListener('change', e => { state.grid = e.target.checked; renderEditor(); });

  els.editorCanvas.addEventListener('pointerdown', onEditorPointerDown);
  els.editorCanvas.addEventListener('pointermove', onEditorPointerMove);
  els.editorCanvas.addEventListener('pointerup', onEditorPointerUp);
  els.editorCanvas.addEventListener('pointercancel', onEditorPointerUp);
  els.editorCanvas.addEventListener('pointerleave', () => { if (!state.drawing) { state.cursorCell = null; renderEditor(); } });

  els.undoBtn.addEventListener('click', undo);
  els.redoBtn.addEventListener('click', redo);
  els.clearFaceBtn.addEventListener('click', clearCurrentFace);
  els.clearPartLayerBtn.addEventListener('click', clearCurrentPartLayer);
  els.copyOppositeBtn.addEventListener('click', copyToOpposite);
  els.templateBtn.addEventListener('click', () => makeTemplate(true));
  els.importBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', e => importFile(e.target.files?.[0]));
  els.exportBtn.addEventListener('click', exportSkin);
  els.skinName.addEventListener('input', () => scheduleSave());
  els.challengeBtn.addEventListener('click', nextChallenge);
  els.uvCanvas.addEventListener('pointerdown', handleUVTap);
  els.outerVisibilityBtn.addEventListener('click', () => { state.showOuter = !state.showOuter; renderPreview(); updateSelectors(); });

  els.previewCanvas.addEventListener('pointerdown', e => { state.previewStartX = e.clientX; });
  els.previewCanvas.addEventListener('pointerup', e => {
    if (state.previewStartX == null) return;
    const dx = e.clientX - state.previewStartX;
    if (Math.abs(dx) > 34) selectView(state.previewView === 'front' ? 'back' : 'front');
    state.previewStartX = null;
  });

  document.addEventListener('keydown', e => {
    const cmd = e.metaKey || e.ctrlKey;
    if (cmd && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    if (cmd && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  });

  window.addEventListener('pagehide', saveLocal);
}

async function init() {
  buildPalette();
  bindEvents();
  const restored = await loadLocal();
  if (!restored) makeTemplate(false);
  else { renderAll(); showToast('Proyecto anterior recuperado'); }
  updateHistoryButtons();
}

init();
