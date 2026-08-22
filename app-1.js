'use strict';

const PART_LABELS = {
  head: 'Cabeza', torso: 'Torso', rightArm: 'Brazo derecho', leftArm: 'Brazo izquierdo',
  rightLeg: 'Pierna derecha', leftLeg: 'Pierna izquierda'
};
const LAYER_LABELS = { base: 'Base', outer: 'Capa externa' };
const FACE_LABELS = { front: 'Frente', back: 'Atrás', left: 'Izquierda', right: 'Derecha', top: 'Arriba', bottom: 'Abajo' };

const box = (x, y, w, h) => ({ x, y, w, h });
const REGIONS = {
  head: {
    base: {
      top: box(8, 0, 8, 8), bottom: box(16, 0, 8, 8), left: box(0, 8, 8, 8),
      front: box(8, 8, 8, 8), right: box(16, 8, 8, 8), back: box(24, 8, 8, 8)
    },
    outer: {
      top: box(40, 0, 8, 8), bottom: box(48, 0, 8, 8), left: box(32, 8, 8, 8),
      front: box(40, 8, 8, 8), right: box(48, 8, 8, 8), back: box(56, 8, 8, 8)
    }
  },
  torso: {
    base: {
      top: box(20, 16, 8, 4), bottom: box(28, 16, 8, 4), left: box(16, 20, 4, 12),
      front: box(20, 20, 8, 12), right: box(28, 20, 4, 12), back: box(32, 20, 8, 12)
    },
    outer: {
      top: box(20, 32, 8, 4), bottom: box(28, 32, 8, 4), left: box(16, 36, 4, 12),
      front: box(20, 36, 8, 12), right: box(28, 36, 4, 12), back: box(32, 36, 8, 12)
    }
  },
  rightArm: {
    base: {
      top: box(44, 16, 4, 4), bottom: box(48, 16, 4, 4), left: box(40, 20, 4, 12),
      front: box(44, 20, 4, 12), right: box(48, 20, 4, 12), back: box(52, 20, 4, 12)
    },
    outer: {
      top: box(44, 32, 4, 4), bottom: box(48, 32, 4, 4), left: box(40, 36, 4, 12),
      front: box(44, 36, 4, 12), right: box(48, 36, 4, 12), back: box(52, 36, 4, 12)
    }
  },
  leftArm: {
    base: {
      top: box(36, 48, 4, 4), bottom: box(40, 48, 4, 4), left: box(32, 52, 4, 12),
      front: box(36, 52, 4, 12), right: box(40, 52, 4, 12), back: box(44, 52, 4, 12)
    },
    outer: {
      top: box(52, 48, 4, 4), bottom: box(56, 48, 4, 4), left: box(48, 52, 4, 12),
      front: box(52, 52, 4, 12), right: box(56, 52, 4, 12), back: box(60, 52, 4, 12)
    }
  },
  rightLeg: {
    base: {
      top: box(4, 16, 4, 4), bottom: box(8, 16, 4, 4), left: box(0, 20, 4, 12),
      front: box(4, 20, 4, 12), right: box(8, 20, 4, 12), back: box(12, 20, 4, 12)
    },
    outer: {
      top: box(4, 32, 4, 4), bottom: box(8, 32, 4, 4), left: box(0, 36, 4, 12),
      front: box(4, 36, 4, 12), right: box(8, 36, 4, 12), back: box(12, 36, 4, 12)
    }
  },
  leftLeg: {
    base: {
      top: box(20, 48, 4, 4), bottom: box(24, 48, 4, 4), left: box(16, 52, 4, 12),
      front: box(20, 52, 4, 12), right: box(24, 52, 4, 12), back: box(28, 52, 4, 12)
    },
    outer: {
      top: box(4, 48, 4, 4), bottom: box(8, 48, 4, 4), left: box(0, 52, 4, 12),
      front: box(4, 52, 4, 12), right: box(8, 52, 4, 12), back: box(12, 52, 4, 12)
    }
  }
};

const FACE_ORDER = ['front', 'back', 'left', 'right', 'top', 'bottom'];
const OPPOSITES = { rightArm: 'leftArm', leftArm: 'rightArm', rightLeg: 'leftLeg', leftLeg: 'rightLeg' };
const PALETTE = [
  '#f2c6a0', '#c98f65', '#8f5d43', '#4a2f25', '#1c1917', '#f8fafc', '#94a3b8', '#334155',
  '#ef4444', '#f97316', '#facc15', '#4ade80', '#14b8a6', '#38bdf8', '#3b82f6', '#8b5cf6', '#ec4899'
];
const CHALLENGES = [
  'Diseña un explorador de cuevas bioluminiscentes.',
  'Crea un guardián de hielo con detalles agrietados.',
  'Inventa un alquimista del Nether con armadura oscura.',
  'Haz un aventurero steampunk con cobre y cuero.',
  'Pinta un druida del bosque con capa de hojas.',
  'Crea un astronauta perdido en el End.',
  'Diseña un caballero de redstone con luces de energía.',
  'Haz una criatura marina con escamas y ojos luminosos.'
];

const els = {
  editorCanvas: document.getElementById('editorCanvas'),
  previewCanvas: document.getElementById('previewCanvas'),
  uvCanvas: document.getElementById('uvCanvas'),
  colorPicker: document.getElementById('colorPicker'),
  opacityRange: document.getElementById('opacityRange'),
  opacityValue: document.getElementById('opacityValue'),
  brushSize: document.getElementById('brushSize'),
  mirrorToggle: document.getElementById('mirrorToggle'),
  gridToggle: document.getElementById('gridToggle'),
  selectionLabel: document.getElementById('selectionLabel'),
  regionSize: document.getElementById('regionSize'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  clearFaceBtn: document.getElementById('clearFaceBtn'),
  clearPartLayerBtn: document.getElementById('clearPartLayerBtn'),
  copyOppositeBtn: document.getElementById('copyOppositeBtn'),
  templateBtn: document.getElementById('templateBtn'),
  importBtn: document.getElementById('importBtn'),
  exportBtn: document.getElementById('exportBtn'),
  fileInput: document.getElementById('fileInput'),
  outerVisibilityBtn: document.getElementById('outerVisibilityBtn'),
  pixelCount: document.getElementById('pixelCount'),
  saveStatus: document.getElementById('saveStatus'),
  skinName: document.getElementById('skinName'),
  palette: document.getElementById('palette'),
  toast: document.getElementById('toast'),
  challengeBtn: document.getElementById('challengeBtn'),
  challengeText: document.getElementById('challengeText')
};

const skinCanvas = document.createElement('canvas');
skinCanvas.width = 64;
skinCanvas.height = 64;
const skinCtx = skinCanvas.getContext('2d', { willReadFrequently: true });
skinCtx.imageSmoothingEnabled = false;

const editorCtx = els.editorCanvas.getContext('2d');
const previewCtx = els.previewCanvas.getContext('2d');
const uvCtx = els.uvCanvas.getContext('2d');
editorCtx.imageSmoothingEnabled = false;
previewCtx.imageSmoothingEnabled = false;
uvCtx.imageSmoothingEnabled = false;

const state = {
  part: 'head', layer: 'base', face: 'front', tool: 'pencil', color: '#43d879', opacity: 1,
  brush: 1, mirror: false, grid: true, previewView: 'front', showOuter: true,
  drawing: false, lastCell: null, cursorCell: null, previewStartX: null, saveTimer: null, lastScheme: -1
};

const undoStack = [];
const redoStack = [];
const STORAGE_KEY = 'skinforge-pocket-v1';
const CELL = 36;
let toastTimer = null;

function currentRegion() { return REGIONS[state.part][state.layer][state.face]; }

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbaToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function setPixel(x, y, rgba) {
  if (x < 0 || x >= 64 || y < 0 || y >= 64) return;
  const pixel = skinCtx.createImageData(1, 1);
  pixel.data[0] = rgba.r;
  pixel.data[1] = rgba.g;
  pixel.data[2] = rgba.b;
  pixel.data[3] = rgba.a;
  skinCtx.putImageData(pixel, x, y);
}

function clearPixel(x, y) { skinCtx.clearRect(x, y, 1, 1); }

function colorWithOpacity() {
  const rgb = hexToRgb(state.color);
  return { ...rgb, a: Math.round(state.opacity * 255) };
}

function snapshot() { return skinCtx.getImageData(0, 0, 64, 64); }

function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
  updateHistoryButtons();
}

function restore(imageData) {
  skinCtx.clearRect(0, 0, 64, 64);
  skinCtx.putImageData(imageData, 0, 0);
  afterChange();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
  updateHistoryButtons();
  showToast('Cambio deshecho');
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
  updateHistoryButtons();
  showToast('Cambio rehecho');
}

function updateHistoryButtons() {
  els.undoBtn.disabled = undoStack.length === 0;
  els.redoBtn.disabled = redoStack.length === 0;
}

function checker(ctx, x, y, w, h, size = 8) {
  ctx.fillStyle = '#d7dde7';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#aab4c2';
  for (let yy = 0; yy < h; yy += size) {
    for (let xx = 0; xx < w; xx += size) {
      if (((xx / size) + (yy / size)) % 2 === 0) ctx.fillRect(x + xx, y + yy, Math.min(size, w - xx), Math.min(size, h - yy));
    }
  }
}
