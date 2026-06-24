/**
 * widgets/history/widget.js
 */

window.HistoryWidget = {
  id: 'history',
  label: 'Historial',
  icon: '📅',
  stateKey: 'widgetHistory',

  _tab: 'calendar',
  _calDate: null,
  _weekOffset: 0,

  _MEALS: [
    { id: 'breakfast', name: 'Desayuno', icon: '☀️' },
    { id: 'lunch',     name: 'Comida',   icon: '🍽️' },
    { id: 'dinner',    name: 'Cena',     icon: '🌙' },
    { id: 'snacks',    name: 'Snacks',   icon: '🍎' },
  ],

  _init() {
    if (!this._calDate) this._calDate = new Date();
  },

  render() {
    this._init();
    return `
      <div class="widget-card" id="historyWidgetCard">
        <div class="widget-header">
          <span class="widget-title">Historial</span>
        </div>
        <div class="htab-bar">
          <button class="htab-btn ${this._tab === 'calendar' ? 'active' : ''}"
                  onclick="HistoryWidget._switchTab('calendar')">📅 Calendario</button>
          <button class="htab-btn ${this._tab === 'calories' ? 'active' : ''}"
                  onclick="HistoryWidget._switchTab('calories')">🔥 Calorías</button>
          <button class="htab-btn ${this._tab === 'protein' ? 'active' : ''}"
                  onclick="HistoryWidget._switchTab('protein')">💪 Proteínas</button>
        </div>
        <div id="historyTabContent">
          ${this._renderTab()}
        </div>
      </div>`;
  },

  onMount() {},

  update() {
    const wrap = document.getElementById(`widget-${this.id}`);
    if (wrap) wrap.innerHTML = this.render();
  },

  _switchTab(tab) {
    this._tab = tab;
    this.update();
  },

  _renderTab() {
    if (this._tab === 'calendar') return this._renderCalendar();
    return this._renderChart(this._tab);
  },

  // ══════════════════════════════════════════════
  // CALENDARIO
  // ══════════════════════════════════════════════
  _renderCalendar() {
    const d         = this._calDate;
    const dateStr   = this._toStr(d);
    const isToday   = dateStr === this._toStr(new Date());
    const entry     = this._getEntry(dateStr);
    const meals     = isToday ? S.meals : (entry ? entry.meals : null);
    const goalKcal  = entry ? entry.goal : S.goal;
    const goalProt  = S.proteinGoal || 150;
    const monthName = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    const totalKcal = meals
      ? this._MEALS.reduce((t,m) => t + (meals[m.id]||[]).reduce((s,f) => s+(f.kcal||0),0), 0)
      : 0;
    const totalProt = meals
      ? this._MEALS.reduce((t,m) => t + (meals[m.id]||[]).reduce((s,f) => s+(f.protein||0),0), 0)
      : 0;

    const pctK  = Math.min(totalKcal / goalKcal, 1);
    const pctP  = Math.min(totalProt / goalProt, 1);
    const colorK = pctK >= 1 ? '#f87171' : pctK >= 0.85 ? '#facc15' : '#4ade80';

    return `
      <div class="hcal-nav">
        <button class="hcal-arrow" onclick="HistoryWidget._prevDay()">‹</button>
        <span class="hcal-date-label">${isToday ? 'Hoy · ' : ''}${monthName}</span>
        <button class="hcal-arrow" onclick="HistoryWidget._nextDay()" ${isToday ? 'disabled' : ''}>›</button>
      </div>

      <!-- Resumen calorías -->
      <div class="hcal-summary">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Calorías</span>
          <span style="font-size:12px;color:#555">${Math.round(totalKcal)} / ${goalKcal} kcal</span>
        </div>
        <div class="hcal-bar-wrap">
          <div class="hcal-bar" style="width:${Math.round(pctK*100)}%;background:${colorK}"></div>
        </div>
      </div>

      <!-- Resumen proteínas -->
      <div class="hcal-summary">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Proteínas</span>
          <span style="font-size:12px;color:#555">${Math.round(totalProt*10)/10} / ${goalProt} g</span>
        </div>
        <div class="hcal-bar-wrap">
          <div class="hcal-bar" style="width:${Math.round(pctP*100)}%;background:#facc15"></div>
        </div>
      </div>

      <!-- Desglose comidas -->
      ${meals ? this._renderMealBreakdown(meals) : '<div class="hcal-empty">Sin datos para este día</div>'}`;
  },

  _renderMealBreakdown(meals) {
    const rows = this._MEALS.map(m => {
      const foods    = meals[m.id] || [];
      const mealKcal = foods.reduce((s,f) => s+(f.kcal||0), 0);
      const mealProt = foods.reduce((s,f) => s+(f.protein||0), 0);
      if (foods.length === 0) return '';
      return `
        <div class="hday-meal">
          <div class="hday-meal-header">
            <span class="hday-meal-icon">${m.icon}</span>
            <span class="hday-meal-name">${m.name}</span>
            <span class="hday-meal-kcal">${Math.round(mealKcal)} kcal · ${Math.round(mealProt*10)/10}g prot</span>
          </div>
          ${foods.map(f => `
            <div class="hday-food-row">
              <span class="hday-food-name">${f.name}</span>
              <span class="hday-food-detail">${f.grams}g · ${f.kcal||0} kcal · ${Math.round((f.protein||0)*10)/10}g prot</span>
            </div>`).join('')}
        </div>`;
    }).join('');
    return rows || '<div class="hcal-empty">Sin alimentos registrados</div>';
  },

  _prevDay() {
    const d = new Date(this._calDate);
    d.setDate(d.getDate() - 1);
    this._calDate = d;
    this._updateContent();
  },

  _nextDay() {
    const d     = new Date(this._calDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    if (d < today) {
      d.setDate(d.getDate() + 1);
      this._calDate = d;
      this._updateContent();
    }
  },

  // ══════════════════════════════════════════════
  // GRÁFICA (calorías o proteínas)
  // ══════════════════════════════════════════════
  _renderChart(type) {
    const isKcal = type === 'calories';
    const color  = isKcal ? '#4ade80' : '#facc15';
    const unit   = isKcal ? 'kcal' : 'g';
    const goal   = isKcal ? S.goal : (S.proteinGoal || 150);
    const { days, labels } = this._getWeekData(type);

    const allVals = days.map(d => d.total).filter(v => v > 0);
    const maxVal  = Math.max(goal * 1.2, ...allVals, 100);
    const W=280, H=140, PL=38, PR=20, PT=10, PB=28;
    const chartW  = W-PL-PR, chartH = H-PT-PB;
    const toX = i => PL + (i/(days.length-1))*chartW;
    const toY = v => PT + chartH - (v/maxVal)*chartH;
    const goalY = toY(goal);

    let path = '', first = true;
    days.forEach((d,i) => {
      if (d.total > 0) {
        path += first ? `M ${toX(i)} ${toY(d.total)}` : ` L ${toX(i)} ${toY(d.total)}`;
        first = false;
      }
    });

    const yTicks    = [0, Math.round(goal*0.5), goal];
    const weekLabel = this._weekOffset === 0 ? 'Esta semana'
                    : this._weekOffset === -1 ? 'Semana anterior'
                    : `Hace ${Math.abs(this._weekOffset)} semanas`;

    return `
      <div class="hcal-nav">
        <button class="hcal-arrow" onclick="HistoryWidget._prevWeek()">‹</button>
        <span class="hcal-date-label">${weekLabel}</span>
        <button class="hcal-arrow" onclick="HistoryWidget._nextWeek()" ${this._weekOffset===0?'disabled':''}>›</button>
      </div>
      <div class="hprog-chart-wrap">
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
          ${yTicks.map(v => `
            <line x1="${PL}" y1="${toY(v)}" x2="${PL+chartW}" y2="${toY(v)}" stroke="#252528" stroke-width="1"/>
            <text x="${PL-4}" y="${toY(v)+4}" text-anchor="end" font-size="9" fill="#555">${v}</text>
          `).join('')}
          ${labels.map((l,i) => `
            <text x="${toX(i)}" y="${H-4}" text-anchor="middle" font-size="9" fill="#555">${l}</text>
          `).join('')}
          <path d="M ${PL} ${goalY} L ${PL+chartW} ${goalY}" stroke="#555" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
          ${path ? `<path d="${path}" stroke="${color}" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
          ${days.map((d,i) => d.total > 0 ? `
            <circle cx="${toX(i)}" cy="${toY(d.total)}" r="3" fill="${color}"/>` : `
            <circle cx="${toX(i)}" cy="${PT+chartH}" r="2" fill="#2a2a2a"/>`
          ).join('')}
        </svg>
      </div>
      <div class="hprog-legend">
        <span class="hprog-legend-item"><span style="background:${color}"></span>${isKcal ? 'Calorías' : 'Proteínas'}</span>
        <span class="hprog-legend-item"><span style="background:#555"></span>Objetivo</span>
      </div>
      <div class="hprog-week-summary">
        ${days.map((d,i) => `
          <div class="hprog-day-pill">
            <span class="hprog-day-label">${labels[i]}</span>
            <span class="hprog-day-val" style="color:${d.total>0?color:'#333'}">${d.total>0?d.total:'—'}</span>
          </div>`).join('')}
      </div>`;
  },

  _prevWeek() { this._weekOffset--; this._updateContent(); },
  _nextWeek() { if (this._weekOffset < 0) { this._weekOffset++; this._updateContent(); } },

  _getWeekData(type) {
    const isKcal = type === 'calories';
    const today  = new Date();
    const dow    = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dow+6)%7) + this._weekOffset*7);

    const days = [], labels = [];
    for (let i = 0; i < 7; i++) {
      const d       = new Date(monday);
      d.setDate(monday.getDate() + i);
      const str     = this._toStr(d);
      const isToday = str === this._toStr(today);
      const meals   = isToday ? S.meals : (this._getEntry(str)?.meals || null);
      let total     = 0;
      if (meals) {
        total = ['breakfast','lunch','dinner','snacks']
          .reduce((t,id) => t + (meals[id]||[]).reduce((s,f) => s+(isKcal?(f.kcal||0):(f.protein||0)),0), 0);
        total = isKcal ? Math.round(total) : Math.round(total*10)/10;
      }
      days.push({ date: str, total });
      labels.push(['L','M','X','J','V','S','D'][i]);
    }
    return { days, labels };
  },

  _updateContent() {
    const content = document.getElementById('historyTabContent');
    if (content) content.innerHTML = this._renderTab();
  },

  _toStr(date)       { return date.toISOString().slice(0,10); },
  _getEntry(dateStr) { return (S.history||[]).find(h => h.date === dateStr) || null; },
};