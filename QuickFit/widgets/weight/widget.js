/**
 * widgets/weight/widget.js
 */

window.WeightWidget = {
  id: 'weight',
  label: 'Peso & IMC',
  icon: '⚖️',
  stateKey: 'widgetWeight',

  _tab: 'imc',
  _monthOffset: 0,

  render() {
    return `
      <div class="widget-card" id="weightWidgetCard">
        <div class="widget-header">
          <span class="widget-title">Peso & IMC</span>
        </div>
        <div class="htab-bar">
          <button class="htab-btn ${this._tab === 'imc' ? 'active' : ''}"
                  onclick="WeightWidget._switchTab('imc')">📊 IMC</button>
          <button class="htab-btn ${this._tab === 'chart' ? 'active' : ''}"
                  onclick="WeightWidget._switchTab('chart')">📈 Evolución</button>
        </div>
        <div id="weightTabContent">
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
    return this._tab === 'imc' ? this._renderIMC() : this._renderChart();
  },

  // ══════════════════════════════════════════════
  // PESTAÑA IMC
  // ══════════════════════════════════════════════
  _renderIMC() {
    const height     = S.height || null;
    const weight     = this._currentWeek() ?? S.weight ?? null;
    const imc        = height && weight ? weight / ((height/100) ** 2) : null;
    const imcRounded = imc ? Math.round(imc * 10) / 10 : null;
    const { color, label, pct } = this._imcMeta(imc);

    const W = 260, PL = 0, PR = 0;
    const chartW  = W - PL - PR;
    const needleX = PL + pct * chartW;

    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px">

        <!-- Barra IMC -->
        <div style="width:100%">
          <svg width="100%" viewBox="0 0 260 62" style="overflow:visible;display:block">
            <defs>
              <clipPath id="barClip">
                <rect x="0" y="0" width="260" height="14" rx="7"/>
              </clipPath>
            </defs>
            <!-- Zonas -->
            <rect x="0"              y="0" width="${260*0.283}" height="14" fill="#f87171" clip-path="url(#barClip)"/>
            <rect x="${260*0.283}"   y="0" width="${260*0.217}" height="14" fill="#4ade80" clip-path="url(#barClip)"/>
            <rect x="${260*0.5}"     y="0" width="${260*0.167}" height="14" fill="#facc15" clip-path="url(#barClip)"/>
            <rect x="${260*0.667}"   y="0" width="${260*0.333}" height="14" fill="#f87171" clip-path="url(#barClip)"/>

            <!-- Aguja -->
            ${imc ? `
              <line x1="${needleX}" y1="-4" x2="${needleX}" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              <circle cx="${needleX}" cy="7" r="5" fill="#fff" stroke="${color}" stroke-width="2"/>
            ` : ''}

            <!-- Etiquetas zonas -->
            <text x="${260*0.14}"  y="32" text-anchor="middle" font-size="9" fill="#f87171">Bajo</text>
            <text x="${260*0.39}"  y="32" text-anchor="middle" font-size="9" fill="#4ade80">Normal</text>
            <text x="${260*0.583}" y="32" text-anchor="middle" font-size="9" fill="#facc15">Sobrepeso</text>
            <text x="${260*0.833}" y="32" text-anchor="middle" font-size="9" fill="#f87171">Obesidad</text>

            <!-- Rangos numéricos -->
            <text x="0"            y="48" text-anchor="start"  font-size="8" fill="#555">10</text>
            <text x="${260*0.283}" y="48" text-anchor="middle" font-size="8" fill="#555">18.5</text>
            <text x="${260*0.5}"   y="48" text-anchor="middle" font-size="8" fill="#555">25</text>
            <text x="${260*0.667}" y="48" text-anchor="middle" font-size="8" fill="#555">30</text>
            <text x="260"          y="48" text-anchor="end"    font-size="8" fill="#555">40</text>
          </svg>
        </div>

        <!-- IMC valor y categoría -->
        <div style="text-align:center">
          <div style="font-size:48px;font-weight:700;color:${color};line-height:1">${imcRounded ?? '—'}</div>
          <div style="font-size:13px;color:#666;margin-top:4px">IMC · <span style="color:${color}">${label}</span></div>
        </div>

        <!-- Campos editables -->
        <div class="weight-fields" style="width:100%">
          <div class="weight-field">
            <span class="weight-field-label">Altura</span>
            <div class="weight-field-input-wrap">
              <input class="weight-input" type="number" id="heightInput"
                     value="${height || ''}" placeholder="170" inputmode="decimal"
                     onchange="WeightWidget._saveProfile()"/>
              <span class="weight-field-unit">cm</span>
            </div>
          </div>
          <div class="weight-field">
            <span class="weight-field-label">Peso semana actual</span>
            <div class="weight-field-input-wrap">
              <input class="weight-input" type="number" id="weightInput"
                     value="${weight || ''}" placeholder="70" inputmode="decimal" step="0.1"
                     onchange="WeightWidget._saveWeekWeight()"/>
              <span class="weight-field-unit">kg</span>
            </div>
          </div>
        </div>

      </div>`;
  },

  // ══════════════════════════════════════════════
  // PESTAÑA GRÁFICA
  // ══════════════════════════════════════════════
  _renderChart() {
    const { weeks, labels, monthLabel } = this._getMonthData();
    const weights = weeks.map(w => w.weight);
    const hasData = weights.some(v => v !== null);

    const allVals = weights.filter(v => v !== null);
    const minVal  = allVals.length ? Math.min(...allVals) - 2 : 50;
    const maxVal  = allVals.length ? Math.max(...allVals) + 2 : 100;
    const range   = maxVal - minVal || 10;

    const W=280, H=140, PL=38, PR=20, PT=10, PB=28;
    const chartW = W-PL-PR, chartH = H-PT-PB;
    const toX = i => PL + (i/3)*chartW;
    const toY = v => PT + chartH - ((v-minVal)/range)*chartH;

    let path = '', first = true;
    weights.forEach((w, i) => {
      if (w !== null) {
        path += first ? `M ${toX(i)} ${toY(w)}` : ` L ${toX(i)} ${toY(w)}`;
        first = false;
      }
    });

    const yTicks = [minVal, Math.round((minVal+maxVal)/2), maxVal].map(v => Math.round(v*10)/10);

    return `
      <div class="hcal-nav">
        <button class="hcal-arrow" onclick="WeightWidget._prevMonth()">‹</button>
        <span class="hcal-date-label">${monthLabel}</span>
        <button class="hcal-arrow" onclick="WeightWidget._nextMonth()" ${this._monthOffset===0?'disabled':''}>›</button>
      </div>

      <div class="hprog-chart-wrap">
        ${!hasData ? `<div class="hcal-empty" style="width:100%">Sin registros este mes</div>` : `
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
          ${yTicks.map(v => `
            <line x1="${PL}" y1="${toY(v)}" x2="${PL+chartW}" y2="${toY(v)}" stroke="#252528" stroke-width="1"/>
            <text x="${PL-4}" y="${toY(v)+4}" text-anchor="end" font-size="9" fill="#555">${v}</text>
          `).join('')}
          ${labels.map((l,i) => `
            <text x="${toX(i)}" y="${H-4}" text-anchor="middle" font-size="9" fill="#555">${l}</text>
          `).join('')}
          ${path ? `<path d="${path}" stroke="#a78bfa" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
          ${weights.map((w,i) => w !== null ? `
            <circle cx="${toX(i)}" cy="${toY(w)}" r="4" fill="#a78bfa"/>
            <text x="${toX(i)}" y="${toY(w)-8}" text-anchor="middle" font-size="9" fill="#a78bfa">${w}kg</text>
          ` : `
            <circle cx="${toX(i)}" cy="${PT+chartH/2}" r="2" fill="#2a2a2a"/>
          `).join('')}
        </svg>`}
      </div>

      <div class="hprog-week-summary">
        ${weeks.map((w,i) => `
          <div class="hprog-day-pill">
            <span class="hprog-day-label">${labels[i]}</span>
            <span class="hprog-day-val" style="color:${w.weight ? '#a78bfa' : '#333'}">${w.weight ? w.weight+'kg' : '—'}</span>
          </div>`).join('')}
      </div>`;
  },

  _prevMonth() { this._monthOffset--; this._updateContent(); },
  _nextMonth() { if (this._monthOffset < 0) { this._monthOffset++; this._updateContent(); } },

  // ══════════════════════════════════════════════
  // LÓGICA DE PESO POR SEMANA
  // ══════════════════════════════════════════════

  // Devuelve la clave de semana actual: 'YYYY-MM-W1' etc
  _weekKey() {
    const now  = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth()+1).padStart(2,'0');
    const week = Math.ceil(now.getDate() / 7);
    return `${year}-${month}-W${week}`;
  },

  // Devuelve el peso registrado para la semana actual o null
  _currentWeek() {
    if (!S.weightLog) return null;
    const entry = S.weightLog.find(e => e.week === this._weekKey());
    return entry ? entry.weight : null;
  },

  _saveWeekWeight() {
    const w = parseFloat(document.getElementById('weightInput').value);
    if (!w || w <= 0) return;
    if (!S.weightLog) S.weightLog = [];
    const key      = this._weekKey();
    const existing = S.weightLog.findIndex(e => e.week === key);
    const entry    = { week: key, weight: w, date: new Date().toISOString().slice(0,10) };
    if (existing >= 0) S.weightLog[existing] = entry;
    else S.weightLog.push(entry);
    S.weight = w;
    saveState();
    this.update();
  },

  _saveProfile() {
    const h = parseFloat(document.getElementById('heightInput').value);
    if (h > 0) S.height = h;
    saveState();
    this.update();
  },

  _getMonthData() {
    const now   = new Date();
    const date  = new Date(now.getFullYear(), now.getMonth() + this._monthOffset, 1);
    const year  = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const monthLabel = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const log   = S.weightLog || [];
    const weeks = [1,2,3,4].map(w => {
      const key   = `${year}-${month}-W${w}`;
      const entry = log.find(e => e.week === key);
      return { weight: entry ? entry.weight : null };
    });

    return { weeks, labels: ['Sem 1','Sem 2','Sem 3','Sem 4'], monthLabel };
  },

  _updateContent() {
    const content = document.getElementById('weightTabContent');
    if (content) content.innerHTML = this._renderTab();
  },

  _imcMeta(imc) {
    if (!imc) return { color: '#555', label: 'Sin datos', pct: 0 };
    const imcMin = 10, imcMax = 40;
    const clamped = Math.min(Math.max(imc, imcMin), imcMax);
    const pct = (clamped - imcMin) / (imcMax - imcMin);
    let color, label;
    if      (imc < 18.5) { color = '#f87171'; label = 'Infrapeso'; }
    else if (imc < 25)   { color = '#4ade80'; label = 'Normal'; }
    else if (imc < 30)   { color = '#facc15'; label = 'Sobrepeso'; }
    else                 { color = '#f87171'; label = 'Obesidad'; }
    return { color, label, pct };
  },

  _polar(deg) {
    const rad = (deg-90)*Math.PI/180;
    return { x: 130+108*Math.cos(rad), y: 130+108*Math.sin(rad) };
  },

  _arc(s, e) {
    const a=this._polar(s), b=this._polar(e);
    return `M ${a.x} ${a.y} A 108 108 0 ${(e-s)>180?1:0} 1 ${b.x} ${b.y}`;
  },
};