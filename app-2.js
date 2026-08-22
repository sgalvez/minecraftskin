function renderEditor() {
  const reg = currentRegion();
  els.editorCanvas.width = reg.w * CELL;
  els.editorCanvas.height = reg.h * CELL;
  editorCtx.imageSmoothingEnabled = false;
  const pixels = skinCtx.getImageData(reg.x, reg.y, reg.w, reg.h).data;

  for (let y = 0; y < reg.h; y++) {
    for (let x = 0; x < reg.w; x++) {
      const dx = x * CELL;
      const dy = y * CELL;
      const light = (x + y) % 2 === 0;
      editorCtx.fillStyle = light ? '#cfd6df' : '#9da8b6';
      editorCtx.fillRect(dx, dy, CELL, CELL);
      const i = (y * reg.w + x) * 4;
      if (pixels[i + 3] > 0) {
        editorCtx.fillStyle = `rgba(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${pixels[i + 3] / 255})`;
        editorCtx.fillRect(dx, dy, CELL, CELL);
      }
    }
  }

  if (state.grid) {
    editorCtx.strokeStyle = 'rgba(11, 18, 28, .48)';
    editorCtx.lineWidth = 1;
    editorCtx.beginPath();
    for (let x = 0; x <= reg.w; x++) {
      editorCtx.moveTo(x * CELL + .5, 0);
      editorCtx.lineTo(x * CELL + .5, reg.h * CELL);
    }
    for (let y = 0; y <= reg.h; y++) {
      editorCtx.moveTo(0, y * CELL + .5);
      editorCtx.lineTo(reg.w * CELL, y * CELL + .5);
    }
    editorCtx.stroke();
  }

  if (state.cursorCell) {
    const { x, y } = state.cursorCell;
    if (x >= 0 && x < reg.w && y >= 0 && y < reg.h) {
      editorCtx.strokeStyle = '#fef08a';
      editorCtx.lineWidth = 3;
      editorCtx.strokeRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
    }
  }

  els.selectionLabel.innerHTML = `<strong>${PART_LABELS[state.part]} · ${LAYER_LABELS[state.layer]} · ${FACE_LABELS[state.face]}</strong>`;
  els.regionSize.textContent = `${reg.w} × ${reg.h} píxeles`;
}

function drawRegion(part, layer, face, dx, dy, dw, dh) {
  const reg = REGIONS[part][layer][face];
  previewCtx.drawImage(skinCanvas, reg.x, reg.y, reg.w, reg.h, dx, dy, dw, dh);
}

function renderPreview() {
  const ctx = previewCtx;
  const w = els.previewCanvas.width;
  const h = els.previewCanvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;

  const s = 12;
  const x0 = 0;
  const face = state.previewView;

  const rear = face === 'back';
  const pieces = [
    ['head', x0 + 4 * s, 0, 8 * s, 8 * s],
    ['torso', x0 + 4 * s, 8 * s, 8 * s, 12 * s],
    ['rightArm', x0 + (rear ? 12 : 0) * s, 8 * s, 4 * s, 12 * s],
    ['leftArm', x0 + (rear ? 0 : 12) * s, 8 * s, 4 * s, 12 * s],
    ['rightLeg', x0 + (rear ? 8 : 4) * s, 20 * s, 4 * s, 12 * s],
    ['leftLeg', x0 + (rear ? 4 : 8) * s, 20 * s, 4 * s, 12 * s]
  ];

  for (const [part, x, y, pw, ph] of pieces) drawRegion(part, 'base', face, x, y, pw, ph);
  if (state.showOuter) {
    for (const [part, x, y, pw, ph] of pieces) drawRegion(part, 'outer', face, x, y, pw, ph);
  }
}

function renderUV() {
  const scale = 6;
  els.uvCanvas.width = 64 * scale;
  els.uvCanvas.height = 64 * scale;
  checker(uvCtx, 0, 0, 64 * scale, 64 * scale, scale * 2);
  uvCtx.imageSmoothingEnabled = false;
  uvCtx.drawImage(skinCanvas, 0, 0, 64 * scale, 64 * scale);

  uvCtx.strokeStyle = 'rgba(25, 37, 53, .25)';
  uvCtx.lineWidth = 1;
  uvCtx.beginPath();
  for (let i = 0; i <= 64; i += 4) {
    uvCtx.moveTo(i * scale + .5, 0);
    uvCtx.lineTo(i * scale + .5, 64 * scale);
    uvCtx.moveTo(0, i * scale + .5);
    uvCtx.lineTo(64 * scale, i * scale + .5);
  }
  uvCtx.stroke();

  const reg = currentRegion();
  uvCtx.strokeStyle = '#4ade80';
  uvCtx.lineWidth = 3;
  uvCtx.strokeRect(reg.x * scale + 1.5, reg.y * scale + 1.5, reg.w * scale - 3, reg.h * scale - 3);
}

function renderStats() {
  const data = skinCtx.getImageData(0, 0, 64, 64).data;
  let visible = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 0) visible++;
  els.pixelCount.textContent = visible.toLocaleString('es-CL');
}

function renderAll() {
  renderEditor();
  renderPreview();
  renderUV();
  renderStats();
  updateSelectors();
}

function afterChange() {
  renderAll();
  scheduleSave();
}

function updateSelectors() {
  document.querySelectorAll('[data-part]').forEach(btn => btn.classList.toggle('active', btn.dataset.part === state.part));
  document.querySelectorAll('[data-layer]').forEach(btn => btn.classList.toggle('active', btn.dataset.layer === state.layer));
  document.querySelectorAll('[data-face]').forEach(btn => btn.classList.toggle('active', btn.dataset.face === state.face));
  document.querySelectorAll('[data-tool]').forEach(btn => {
    const active = btn.dataset.tool === state.tool;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === state.previewView));
  els.copyOppositeBtn.disabled = !OPPOSITES[state.part];
  els.outerVisibilityBtn.textContent = state.showOuter ? '◉' : '○';
  els.outerVisibilityBtn.title = state.showOuter ? 'Ocultar capa externa' : 'Mostrar capa externa';
  els.outerVisibilityBtn.setAttribute('aria-label', els.outerVisibilityBtn.title);
}

function cellFromPointer(event, canvas, reg = currentRegion()) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(reg.w - 1, Math.floor((event.clientX - rect.left) / rect.width * reg.w))),
    y: Math.max(0, Math.min(reg.h - 1, Math.floor((event.clientY - rect.top) / rect.height * reg.h)))
  };
}

function applyBrushAt(localX, localY) {
  const reg = currentRegion();
  const size = state.brush;
  const offset = Math.floor((size - 1) / 2);
  const targets = new Set();

  for (let yy = 0; yy < size; yy++) {
    for (let xx = 0; xx < size; xx++) {
      const lx = localX + xx - offset;
      const ly = localY + yy - offset;
      if (lx < 0 || lx >= reg.w || ly < 0 || ly >= reg.h) continue;
      targets.add(`${lx},${ly}`);
      if (state.mirror) targets.add(`${reg.w - 1 - lx},${ly}`);
    }
  }

  const rgba = colorWithOpacity();
  for (const target of targets) {
    const [lx, ly] = target.split(',').map(Number);
    const x = reg.x + lx;
    const y = reg.y + ly;
    if (state.tool === 'eraser') clearPixel(x, y);
    else setPixel(x, y, rgba);
  }
}

function drawLine(from, to) {
  let x0 = from.x, y0 = from.y;
  const x1 = to.x, y1 = to.y;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    applyBrushAt(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

function floodFill(localX, localY) {
  const reg = currentRegion();
  const image = skinCtx.getImageData(reg.x, reg.y, reg.w, reg.h);
  const data = image.data;
  const idx = (localY * reg.w + localX) * 4;
  const target = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  const c = colorWithOpacity();
  const replacement = [c.r, c.g, c.b, c.a];
  if (target.every((v, i) => v === replacement[i])) return false;

  const matches = (x, y) => {
    const i = (y * reg.w + x) * 4;
    return data[i] === target[0] && data[i + 1] === target[1] && data[i + 2] === target[2] && data[i + 3] === target[3];
  };
  const paint = (x, y) => {
    const i = (y * reg.w + x) * 4;
    data[i] = replacement[0]; data[i + 1] = replacement[1]; data[i + 2] = replacement[2]; data[i + 3] = replacement[3];
  };

  const stack = [[localX, localY]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= reg.w || y < 0 || y >= reg.h || !matches(x, y)) continue;
    paint(x, y);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  skinCtx.putImageData(image, reg.x, reg.y);
  return true;
}
