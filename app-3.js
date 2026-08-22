function pickColor(localX, localY) {
  const reg = currentRegion();
  const d = skinCtx.getImageData(reg.x + localX, reg.y + localY, 1, 1).data;
  if (d[3] === 0) {
    showToast('Ese píxel es transparente');
    return;
  }
  state.color = rgbaToHex(d[0], d[1], d[2]);
  state.opacity = Math.max(.05, d[3] / 255);
  els.colorPicker.value = state.color;
  els.opacityRange.value = String(Math.round(state.opacity * 100 / 5) * 5);
  els.opacityValue.textContent = `${Math.round(state.opacity * 100)}%`;
  state.tool = 'pencil';
  refreshPaletteActive();
  updateSelectors();
  showToast('Color capturado');
}

function onEditorPointerDown(event) {
  event.preventDefault();
  const cell = cellFromPointer(event, els.editorCanvas);
  state.cursorCell = cell;

  if (state.tool === 'eyedropper') {
    pickColor(cell.x, cell.y);
    renderEditor();
    return;
  }
  if (state.tool === 'fill') {
    pushHistory();
    if (!floodFill(cell.x, cell.y)) undoStack.pop();
    updateHistoryButtons();
    afterChange();
    return;
  }

  pushHistory();
  state.drawing = true;
  state.lastCell = cell;
  els.editorCanvas.setPointerCapture?.(event.pointerId);
  applyBrushAt(cell.x, cell.y);
  afterChange();
}

function onEditorPointerMove(event) {
  const reg = currentRegion();
  const rect = els.editorCanvas.getBoundingClientRect();
  const rawX = Math.floor((event.clientX - rect.left) / rect.width * reg.w);
  const rawY = Math.floor((event.clientY - rect.top) / rect.height * reg.h);
  if (rawX >= 0 && rawX < reg.w && rawY >= 0 && rawY < reg.h) state.cursorCell = { x: rawX, y: rawY };
  if (!state.drawing) { renderEditor(); return; }
  event.preventDefault();
  const cell = cellFromPointer(event, els.editorCanvas);
  if (!state.lastCell || cell.x !== state.lastCell.x || cell.y !== state.lastCell.y) {
    drawLine(state.lastCell || cell, cell);
    state.lastCell = cell;
    afterChange();
  }
}

function onEditorPointerUp(event) {
  if (!state.drawing) return;
  state.drawing = false;
  state.lastCell = null;
  try { els.editorCanvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
  scheduleSave(true);
}

function clearCurrentFace() {
  if (!confirm('¿Limpiar todos los píxeles de esta cara?')) return;
  pushHistory();
  const reg = currentRegion();
  skinCtx.clearRect(reg.x, reg.y, reg.w, reg.h);
  afterChange();
  showToast('Cara limpiada');
}

function clearCurrentPartLayer() {
  if (!confirm(`¿Limpiar ${LAYER_LABELS[state.layer].toLowerCase()} de ${PART_LABELS[state.part].toLowerCase()}?`)) return;
  pushHistory();
  for (const face of FACE_ORDER) {
    const reg = REGIONS[state.part][state.layer][face];
    skinCtx.clearRect(reg.x, reg.y, reg.w, reg.h);
  }
  afterChange();
  showToast('Capa de la pieza limpiada');
}

function mirroredImageData(image) {
  const out = skinCtx.createImageData(image.width, image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const src = (y * image.width + x) * 4;
      const dst = (y * image.width + (image.width - 1 - x)) * 4;
      out.data[dst] = image.data[src];
      out.data[dst + 1] = image.data[src + 1];
      out.data[dst + 2] = image.data[src + 2];
      out.data[dst + 3] = image.data[src + 3];
    }
  }
  return out;
}

function copyToOpposite() {
  const targetPart = OPPOSITES[state.part];
  if (!targetPart) return;
  if (!confirm(`¿Reemplazar ${LAYER_LABELS[state.layer].toLowerCase()} de ${PART_LABELS[targetPart].toLowerCase()} con una copia espejo?`)) return;
  pushHistory();
  const sourceSnapshots = {};
  for (const face of FACE_ORDER) {
    const src = REGIONS[state.part][state.layer][face];
    sourceSnapshots[face] = skinCtx.getImageData(src.x, src.y, src.w, src.h);
  }
  for (const face of FACE_ORDER) {
    const sourceFace = face === 'left' ? 'right' : face === 'right' ? 'left' : face;
    const dst = REGIONS[targetPart][state.layer][face];
    skinCtx.putImageData(mirroredImageData(sourceSnapshots[sourceFace]), dst.x, dst.y);
  }
  afterChange();
  showToast('Miembro opuesto actualizado');
}

function fillRegion(reg, color) {
  const c = hexToRgb(color);
  skinCtx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
  skinCtx.fillRect(reg.x, reg.y, reg.w, reg.h);
}

function fillPart(part, layer, color) {
  for (const face of FACE_ORDER) fillRegion(REGIONS[part][layer][face], color);
}

function localPixel(part, layer, face, x, y, color, alpha = 255) {
  const reg = REGIONS[part][layer][face];
  const c = hexToRgb(color);
  setPixel(reg.x + x, reg.y + y, { ...c, a: alpha });
}

function clearPart(part, layer) {
  for (const face of FACE_ORDER) {
    const reg = REGIONS[part][layer][face];
    skinCtx.clearRect(reg.x, reg.y, reg.w, reg.h);
  }
}

function makeTemplate(recordHistory = true) {
  if (recordHistory && !confirm('¿Generar una skin random? La skin actual se reemplazará y podrás deshacer el cambio.')) return;
  if (recordHistory) pushHistory();
  skinCtx.clearRect(0, 0, 64, 64);

  const schemes = [
    { skin: '#c98f65', skinDark: '#a96f4d', hair: '#3b241d', shirt: '#2563eb', shirtDark: '#1d4ed8', pants: '#263449', boots: '#171c26', eye: '#3b82f6' },
    { skin: '#8f5d43', skinDark: '#70422f', hair: '#15110f', shirt: '#059669', shirtDark: '#047857', pants: '#334155', boots: '#171717', eye: '#2dd4bf' },
    { skin: '#f2c6a0', skinDark: '#d9a77f', hair: '#7c4a2d', shirt: '#dc2626', shirtDark: '#991b1b', pants: '#24324a', boots: '#312e2b', eye: '#16a34a' },
    { skin: '#b87957', skinDark: '#965a40', hair: '#241710', shirt: '#7c3aed', shirtDark: '#5b21b6', pants: '#1f2937', boots: '#111827', eye: '#f59e0b' }
  ];
  let schemeIndex = Math.floor(Math.random() * schemes.length);
  if (schemes.length > 1 && schemeIndex === state.lastScheme) {
    schemeIndex = (schemeIndex + 1 + Math.floor(Math.random() * (schemes.length - 1))) % schemes.length;
  }
  state.lastScheme = schemeIndex;
  const sc = schemes[schemeIndex];

  fillPart('head', 'base', sc.skin);
  fillPart('torso', 'base', sc.shirt);
  fillPart('rightArm', 'base', sc.skin);
  fillPart('leftArm', 'base', sc.skin);
  fillPart('rightLeg', 'base', sc.pants);
  fillPart('leftLeg', 'base', sc.pants);

  for (const part of Object.keys(REGIONS)) clearPart(part, 'outer');

  fillRegion(REGIONS.head.outer.top, sc.hair);
  fillRegion(REGIONS.head.outer.back, sc.hair);
  fillRegion(REGIONS.head.outer.left, sc.hair);
  fillRegion(REGIONS.head.outer.right, sc.hair);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 8; x++) localPixel('head', 'outer', 'front', x, y, sc.hair);
  localPixel('head', 'outer', 'front', 0, 3, sc.hair);
  localPixel('head', 'outer', 'front', 7, 3, sc.hair);

  localPixel('head', 'base', 'front', 1, 3, '#ffffff');
  localPixel('head', 'base', 'front', 2, 3, sc.eye);
  localPixel('head', 'base', 'front', 5, 3, sc.eye);
  localPixel('head', 'base', 'front', 6, 3, '#ffffff');
  localPixel('head', 'base', 'front', 3, 6, sc.skinDark);
  localPixel('head', 'base', 'front', 4, 6, sc.skinDark);

  const torsoFaces = ['front', 'back', 'left', 'right'];
  for (const face of torsoFaces) {
    const reg = REGIONS.torso.base[face];
    for (let y = Math.max(0, reg.h - 2); y < reg.h; y++) for (let x = 0; x < reg.w; x++) localPixel('torso', 'base', face, x, y, sc.shirtDark);
  }
  localPixel('torso', 'base', 'front', 3, 4, '#f8fafc');
  localPixel('torso', 'base', 'front', 4, 4, '#f8fafc');
  localPixel('torso', 'base', 'front', 2, 5, '#f8fafc');
  localPixel('torso', 'base', 'front', 5, 5, '#f8fafc');
  localPixel('torso', 'base', 'front', 3, 6, '#f8fafc');
  localPixel('torso', 'base', 'front', 4, 6, '#f8fafc');

  for (const part of ['rightArm', 'leftArm']) {
    fillRegion(REGIONS[part].base.top, sc.shirt);
    for (const face of ['front', 'back', 'left', 'right']) {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) localPixel(part, 'base', face, x, y, sc.shirt);
      for (let x = 0; x < 4; x++) localPixel(part, 'base', face, x, 3, sc.shirtDark);
    }
  }

  for (const part of ['rightLeg', 'leftLeg']) {
    for (const face of ['front', 'back', 'left', 'right']) {
      for (let y = 9; y < 12; y++) for (let x = 0; x < 4; x++) localPixel(part, 'base', face, x, y, sc.boots);
    }
    fillRegion(REGIONS[part].base.bottom, sc.boots);
  }

  afterChange();
  showToast(recordHistory ? 'Skin random generada' : 'Plantilla lista para pintar');
}

function selectPart(part) { state.part = part; state.cursorCell = null; renderAll(); }
function selectLayer(layer) { state.layer = layer; state.cursorCell = null; renderAll(); }
