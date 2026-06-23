/**
 * widgets/history/widget.js
 */

window.HistoryWidget = {
  id: 'history',
  label: 'Historial',
  icon: '📅',
  stateKey: 'widgetHistory',

  _MEALS: [
    { id: 'breakfast', name: 'Desayuno', icon: '☀️' },
    { id: 'lunch',     name: 'Comida',   icon: '🍽️' },
    { id: 'dinner',    name: 'Cena',     icon: '🌙' },
    { id: 'snacks',    name: 'Snacks',   icon: '🍎' },
  ],

  render() {
    if (!S.history || S.history.length === 0) {
      return `
        <div class="widget-card" id="historyWidgetCard">
          <div class="widget-header">
            <span class="widget-title">Historial</span>
          </div>
          <div class="history-empty">
            <span class="history-empty-icon">📅</span>
            <span class="history-empty-text">Aquí aparecerán los días anteriores.\nEl historial se guarda automáticamente al cambiar de día.</span>
          </div>
        </div>`;
    }

    return `
      <div class="widget-card" id="historyWidgetCard">
        <div class="widget-header">
          <span class="widget-title">Historial</span>
          <span style="font-size:12px;color:#555">${S.history.length} día${S.history.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="history-list" id="historyList">
          ${S.history.map((entry, i) => this._renderEntry(entry, i)).join('')}
        </div>
      </div>`;
  },

  onMount() {},

  update() {
    const wrap = document.getElementById(`widget-${this.id}`);
    if (wrap) wrap.innerHTML = this.render();
  },

  _renderEntry(entry, idx) {
    const total    = this._entryTotal(entry);
    const pct      = Math.min(total / entry.goal, 1);
    const color    = pct >= 1 ? '#f87171' : pct >= 0.85 ? '#facc15' : '#4ade80';
    const label    = this._formatDate(entry.date);
    const barWidth = Math.round(pct * 100);

    const mealRows = this._MEALS.map(m => {
      const foods    = entry.meals[m.id] || [];
      const mealKcal = foods.reduce((s, f) => s + f.kcal, 0);
      if (foods.length === 0) return '';
      return `
        <div class="hday-meal">
          <div class="hday-meal-header">
            <span class="hday-meal-icon">${m.icon}</span>
            <span class="hday-meal-name">${m.name}</span>
            <span class="hday-meal-kcal">${mealKcal} kcal</span>
          </div>
          ${foods.map(f => `
            <div class="hday-food-row">
              <span class="hday-food-name">${f.name}</span>
              <span class="hday-food-detail">${f.grams}g · ${f.kcal} kcal</span>
            </div>`).join('')}
        </div>`;
    }).join('');

    return `
      <div class="hday-card" id="hday-${idx}">
        <div class="hday-header" onclick="HistoryWidget._toggleDay(${idx})">
          <div class="hday-header-left">
            <span class="hday-date">${label}</span>
            <div class="hday-bar-wrap">
              <div class="hday-bar" style="width:${barWidth}%;background:${color}"></div>
            </div>
          </div>
          <div class="hday-header-right">
            <span class="hday-total" style="color:${color}">${total}</span>
            <span class="hday-goal">/ ${entry.goal} kcal</span>
            <span class="chevron" id="hday-chev-${idx}">▼</span>
          </div>
        </div>
        <div class="hday-body" id="hday-body-${idx}">
          ${mealRows || '<div style="padding:12px 16px;color:#555;font-size:13px">Sin registros</div>'}
        </div>
      </div>`;
  },

  _toggleDay(idx) {
    document.getElementById(`hday-body-${idx}`).classList.toggle('open');
    document.getElementById(`hday-chev-${idx}`).classList.toggle('open');
  },

  _entryTotal(entry) {
    return ['breakfast','lunch','dinner','snacks']
      .reduce((t, id) => t + (entry.meals[id] || []).reduce((s, f) => s + f.kcal, 0), 0);
  },

  _formatDate(dateStr) {
    const d    = new Date(dateStr + 'T12:00:00');
    const hoy  = new Date();
    const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);

    if (dateStr === hoy.toISOString().slice(0,10))  return 'Hoy';
    if (dateStr === ayer.toISOString().slice(0,10)) return 'Ayer';

    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  }
};