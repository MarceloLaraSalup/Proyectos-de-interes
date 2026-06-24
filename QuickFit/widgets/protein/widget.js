window.ProteinWidget = {
  id: 'protein',
  label: 'Proteínas',
  icon: '💪',
  stateKey: 'widgetProtein',

  render() {
    const consumed = this._totalConsumed();
    const goal     = S.proteinGoal || 150;

    return `
      <div class="widget-card" id="proteinWidgetCard">
        <div class="widget-header">
          <span class="widget-title">Proteínas</span>
          <div style="position:relative">
            <button class="dots-btn" onclick="toggleDotsMenu(event)">• • •</button>
            <div class="dots-menu">
              <div class="menu-header">Opciones del widget</div>
              <div class="dots-menu-item" onclick="ProteinWidget._openGoalModal()">
                <div class="menu-icon" style="background:#2e2a1a">🎯</div>
                <div class="menu-text">
                  <span class="menu-label">Editar objetivo</span>
                  <span class="menu-sub" id="proteinGoalSub">Ahora: ${goal}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="gauge-wrap">
          <svg width="260" height="150" viewBox="0 0 260 150" overflow="visible">
            <path id="proteinTrack" stroke="#252528" stroke-width="18" fill="none" stroke-linecap="round"/>
            <path id="proteinFill"  stroke="#facc15" stroke-width="18" fill="none" stroke-linecap="round"/>
            <circle id="proteinDot" cx="130" cy="130" r="6" fill="transparent"/>
            <text x="130" y="108" text-anchor="middle" font-size="32" font-weight="700" fill="#f0f0f0" id="proteinText">${consumed}</text>
            <text x="130" y="125" text-anchor="middle" font-size="13" fill="#666">g proteína</text>
            <text x="130" y="142" text-anchor="middle" font-size="12" fill="#555" id="proteinPercent">de ${goal}g</text>
            <text x="18"  y="148" font-size="11" fill="#444" text-anchor="middle">0</text>
            <text x="242" y="148" font-size="11" fill="#444" text-anchor="middle" id="proteinMax">${goal}</text>
          </svg>

          <div class="gauge-stats">
            <div class="stat-pill">
              <span class="val" style="color:#f0f0f0" id="proteinConsumedStat">${consumed}</span>
              <span class="lbl">Consumidas</span>
            </div>
            <div class="stat-pill">
              <span class="val" style="color:#facc15" id="proteinRemainingStat">${Math.max(goal - consumed, 0)}</span>
              <span class="lbl">Restantes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal objetivo proteínas -->
      <div class="overlay" id="proteinGoalOverlay" onclick="overlayClose(event,'proteinGoalOverlay')">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-title">Objetivo de proteínas</div>
          <div class="sheet-sub">Gramos diarios de proteína</div>
          <div class="sheet-field">
            <label>Objetivo (g)</label>
            <input type="number" id="proteinGoalInput" placeholder="ej. 150" inputmode="numeric" min="1"/>
          </div>
          <div class="sheet-actions">
            <button class="btn-cancel" onclick="closeModal('proteinGoalOverlay')">Cancelar</button>
            <button class="btn-save" onclick="ProteinWidget._saveGoal()">Guardar</button>
          </div>
        </div>
      </div>`;
  },

  onMount() {
    this._update();
    document.getElementById('proteinGoalInput')
      .addEventListener('keydown', e => { if (e.key === 'Enter') this._saveGoal(); });
  },

  update() {
    const wrap = document.getElementById(`widget-${this.id}`);
    if (wrap) { wrap.innerHTML = this.render(); this.onMount(); }
  },

  _update() {
    const consumed = this._totalConsumed();
    const goal     = S.proteinGoal || 150;
    const pct      = Math.min(consumed / goal, 1);
    const fillEnd  = 210 + pct * 300;

    const track = document.getElementById('proteinTrack');
    const fill  = document.getElementById('proteinFill');
    const dot   = document.getElementById('proteinDot');
    if (!track) return;

    track.setAttribute('d', this._arc(210, 510));
    fill.setAttribute('d',  pct > 0 ? this._arc(210, fillEnd) : '');

    if (pct > 0) {
      const p = this._polar(fillEnd);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('fill', '#facc15');
    } else {
      dot.setAttribute('fill', 'transparent');
    }

    document.getElementById('proteinText').textContent          = consumed;
    document.getElementById('proteinPercent').textContent       = `de ${goal}g`;
    document.getElementById('proteinMax').textContent           = goal;
    document.getElementById('proteinConsumedStat').textContent  = consumed;
    document.getElementById('proteinRemainingStat').textContent = Math.max(goal - consumed, 0);
    const sub = document.getElementById('proteinGoalSub');
    if (sub) sub.textContent = `Ahora: ${goal}g`;
  },

  _totalConsumed() {
    return Math.round(
      ['breakfast','lunch','dinner','snacks']
        .reduce((t, id) => t + S.meals[id].reduce((s, f) => s + (f.protein || 0), 0), 0) * 10
    ) / 10;
  },

  _polar(deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: 130 + 108 * Math.cos(rad), y: 130 + 108 * Math.sin(rad) };
  },

  _arc(s, e) {
    const a = this._polar(s), b = this._polar(e);
    return `M ${a.x} ${a.y} A 108 108 0 ${(e-s)>180?1:0} 1 ${b.x} ${b.y}`;
  },

  _openGoalModal() {
    document.querySelectorAll('.dots-menu.open').forEach(m => m.classList.remove('open'));
    document.getElementById('proteinGoalInput').value = S.proteinGoal || 150;
    document.getElementById('proteinGoalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('proteinGoalInput').focus(), 100);
  },

  _saveGoal() {
    const val = parseInt(document.getElementById('proteinGoalInput').value);
    if (!val || val <= 0) return;
    S.proteinGoal = val;
    saveState();
    this.update();
    closeModal('proteinGoalOverlay');
  },
};