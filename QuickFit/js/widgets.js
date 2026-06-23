/**
 * widgets.js
 * Registro central de widgets.
 * Para añadir un widget nuevo:
 *   1. Crea la carpeta widgets/nombre/widget.js
 *   2. Registra aquí el objeto con { id, label, icon, render, toggle }
 */

const WIDGET_REGISTRY = [
  window.CalorieWidget,
  window.MealsWidget,
  window.HistoryWidget,
  // Añade aquí futuros widgets:
  // window.MacrosWidget,
  // window.WaterWidget,
  // window.StepsWidget,
];

// ── RENDER TODOS LOS WIDGETS ───────────────────────
function renderWidgets() {
  const container = document.getElementById('widgetsContainer');
  container.innerHTML = '';

  WIDGET_REGISTRY.forEach(widget => {
    if (!widget) return;
    const enabled = S[widget.stateKey] !== false;
    if (enabled) {
      const el = document.createElement('div');
      el.id = `widget-${widget.id}`;
      el.innerHTML = widget.render();
      container.appendChild(el);
      if (widget.onMount) widget.onMount();
    }
  });
}

// ── RENDER TOGGLES EN AJUSTES ──────────────────────
function renderWidgetToggles() {
  const wrap = document.getElementById('widgetToggles');
  wrap.innerHTML = '';

  WIDGET_REGISTRY.forEach(widget => {
    if (!widget) return;
    const enabled = S[widget.stateKey] !== false;
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.innerHTML = `
      <div class="row-left">
        <div class="row-icon">${widget.icon}</div>
        <span>${widget.label}</span>
      </div>
      <button class="toggle ${enabled ? 'on' : ''}" id="toggle-${widget.id}" onclick="toggleWidget('${widget.id}')"></button>`;
    wrap.appendChild(row);
  });
}

// ── TOGGLE WIDGET ──────────────────────────────────
function toggleWidget(widgetId) {
  const widget = WIDGET_REGISTRY.find(w => w && w.id === widgetId);
  if (!widget) return;
  S[widget.stateKey] = !S[widget.stateKey];
  saveState();
  renderWidgets();
  renderWidgetToggles();
}
