const WIDGET_REGISTRY = [
  window.CalorieWidget,
  window.MealsWidget,
  window.ProteinWidget,
  window.HistoryWidget,
  window.WeightWidget,
];

let _editMode = false;
let _dragSrc  = null;
let _holdTimer = null;

function _getOrderedWidgets() {
  const order = S.widgetOrder || WIDGET_REGISTRY.map(w => w && w.id).filter(Boolean);
  return order
    .map(id => WIDGET_REGISTRY.find(w => w && w.id === id))
    .filter(Boolean)
    .concat(WIDGET_REGISTRY.filter(w => w && !order.includes(w.id)));
}

function renderWidgets() {
  const container = document.getElementById('widgetsContainer');
  container.innerHTML = '';

  _getOrderedWidgets().forEach(widget => {
    if (!widget) return;
    const enabled = S[widget.stateKey] !== false;
    if (!enabled) return;

    const el = document.createElement('div');
    el.id = `widget-${widget.id}`;
    el.dataset.widgetId = widget.id;
    el.style.marginBottom = '8px';
    el.style.transition = 'transform 0.2s, opacity 0.2s';
    el.innerHTML = widget.render();
    container.appendChild(el);
    if (widget.onMount) widget.onMount();

    // Long press — 2 segundos
    el.addEventListener('touchstart', e => {
      _holdTimer = setTimeout(() => _enterEditMode(el), 2000);
    }, { passive: true });
    el.addEventListener('touchend',   () => clearTimeout(_holdTimer));
    el.addEventListener('touchmove',  () => clearTimeout(_holdTimer));
  });

  if (_editMode) _applyEditMode();
}

function renderWidgetToggles() {
  const wrap = document.getElementById('widgetToggles');
  wrap.innerHTML = '';
  _getOrderedWidgets().forEach(widget => {
    if (!widget) return;
    const enabled = S[widget.stateKey] !== false;
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.innerHTML = `
      <div class="row-left">
        <div class="row-icon">${widget.icon}</div>
        <span>${widget.label}</span>
      </div>
      <button class="toggle ${enabled ? 'on' : ''}" onclick="toggleWidget('${widget.id}')"></button>`;
    wrap.appendChild(row);
  });
}

function toggleWidget(widgetId) {
  const widget = WIDGET_REGISTRY.find(w => w && w.id === widgetId);
  if (!widget) return;
  S[widget.stateKey] = !S[widget.stateKey];
  saveState();
  renderWidgets();
  renderWidgetToggles();
}

// ── EDIT MODE ─────────────────────────────────────
function _enterEditMode(triggerEl) {
  _editMode = true;
  // Vibración si el dispositivo la soporta
  if (navigator.vibrate) navigator.vibrate(40);
  _applyEditMode();
}

function _exitEditMode() {
  _editMode = false;
  document.querySelectorAll('.widget-draggable').forEach(el => {
    el.classList.remove('widget-draggable', 'widget-shake');
    el.style.transform = '';
    el.style.opacity   = '';
    el.removeEventListener('touchstart', _onDragStart);
    el.removeEventListener('touchmove',  _onDragMove);
    el.removeEventListener('touchend',   _onDragEnd);
  });
  // Quita el overlay de salida
  const overlay = document.getElementById('editModeOverlay');
  if (overlay) overlay.remove();
}

function _applyEditMode() {
  // Botón para salir
  if (!document.getElementById('editModeOverlay')) {
    const btn = document.createElement('div');
    btn.id = 'editModeOverlay';
    btn.innerHTML = `<button onclick="_exitEditMode()" class="edit-mode-done">Listo</button>`;
    document.getElementById('widgetsContainer').prepend(btn);
  }

  document.querySelectorAll('[data-widget-id]').forEach(el => {
    el.classList.add('widget-draggable', 'widget-shake');
    el.addEventListener('touchstart', _onDragStart, { passive: false });
    el.addEventListener('touchmove',  _onDragMove,  { passive: false });
    el.addEventListener('touchend',   _onDragEnd);
  });
}

// ── DRAG & DROP ───────────────────────────────────
let _dragClone    = null;
let _dragOffsetY  = 0;
let _dragOrigRect = null;

function _onDragStart(e) {
  if (!_editMode) return;
  clearTimeout(_holdTimer);
  e.preventDefault();
  _dragSrc = this;

  const touch = e.touches[0];
  _dragOrigRect = this.getBoundingClientRect();
  _dragOffsetY  = touch.clientY - _dragOrigRect.top;

  // Clon visual que sigue el dedo
  _dragClone = this.cloneNode(true);
  _dragClone.style.cssText = `
    position: fixed;
    left: ${_dragOrigRect.left}px;
    top:  ${_dragOrigRect.top}px;
    width: ${_dragOrigRect.width}px;
    z-index: 999;
    opacity: 0.85;
    transform: scale(0.95);
    pointer-events: none;
    transition: none;
    border-radius: 20px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  `;
  document.body.appendChild(_dragClone);
  this.style.opacity = '0.3';
}

function _onDragMove(e) {
  if (!_dragSrc || !_dragClone) return;
  e.preventDefault();
  const touch = e.touches[0];
  _dragClone.style.top = `${touch.clientY - _dragOffsetY}px`;

  // Detecta sobre qué widget está el dedo
  _dragClone.style.display = 'none';
  const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  _dragClone.style.display = '';

  const targetEl = elBelow && elBelow.closest('[data-widget-id]');
  if (targetEl && targetEl !== _dragSrc) {
    const container = document.getElementById('widgetsContainer');
    const nodes     = [...container.querySelectorAll('[data-widget-id]')];
    const srcIdx    = nodes.indexOf(_dragSrc);
    const tgtIdx    = nodes.indexOf(targetEl);
    if (srcIdx !== -1 && tgtIdx !== -1) {
      if (srcIdx < tgtIdx) container.insertBefore(_dragSrc, targetEl.nextSibling);
      else                 container.insertBefore(_dragSrc, targetEl);
    }
  }
}

function _onDragEnd(e) {
  if (!_dragSrc) return;
  _dragSrc.style.opacity = '1';
  if (_dragClone) { _dragClone.remove(); _dragClone = null; }

  // Guarda el nuevo orden
  const nodes = [...document.querySelectorAll('[data-widget-id]')];
  S.widgetOrder = nodes.map(n => n.dataset.widgetId);
  saveState();

  _dragSrc = null;
}