/**
 * widgets/calories/widget.js
 * Widget del velocímetro de calorías totales.
 *
 * Para activar/desactivar: Ajustes → Widgets → Calorías
 */

window.CalorieWidget = {
  id: 'calories',
  label: 'Calorías',
  icon: '🔥',
  stateKey: 'widgetCalorie',

  // ── HTML del widget ──────────────────────────────
  render() {
    return `
      <div class="widget-card" id="calorieWidgetCard">
        <div class="widget-header">
          <span class="widget-title">Calorías</span>
          <div style="position:relative">
            <button class="dots-btn" onclick="toggleDotsMenu(event)">• • •</button>
            <div class="dots-menu">
              <div class="menu-header">Opciones del widget</div>
              <div class="dots-menu-item" onclick="openGoalModal()">
                <div class="menu-icon" style="background:#1e1e2e">🎯</div>
                <div class="menu-text">
                  <span class="menu-label">Editar objetivo</span>
                  <span class="menu-sub" id="currentGoalSub">Ahora: ${S.goal} kcal</span>
                </div>
              </div>
              <div class="dots-menu-item danger" onclick="CalorieWidget._resetToday()">
                <div class="menu-icon" style="background:#2e1a1a">🗑</div>
                <div class="menu-text">
                  <span class="menu-label">Reiniciar hoy</span>
                  <span class="menu-sub">Poner consumo a 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="gauge-wrap">
          <svg width="260" height="150" viewBox="0 0 260 150" overflow="visible">
            <path id="gaugeTrack" stroke="#252528" stroke-width="18" fill="none" stroke-linecap="round"/>
            <path id="gaugeFill"  stroke="#4ade80" stroke-width="18" fill="none" stroke-linecap="round"/>
            <circle id="needleDot" cx="130" cy="130" r="6" fill="transparent"/>
            <text x="130" y="108" text-anchor="middle" font-size="32" font-weight="700" fill="#f0f0f0" id="consumedText">0</text>
            <text x="130" y="125" text-anchor="middle" font-size="13" fill="#666">kcal</text>
            <text x="130" y="142" text-anchor="middle" font-size="12" fill="#555" id="percentText">de ${S.goal}</text>
            <text x="18"  y="148" font-size="11" fill="#444" text-anchor="middle">0</text>
            <text x="242" y="148" font-size="11" fill="#444" text-anchor="middle" id="maxLabel">${S.goal}</text>
          </svg>

          <div class="gauge-stats">
            <div class="stat-pill">
              <span class="val consumed-val" id="consumedStat">0</span>
              <span class="lbl">Consumidas</span>
            </div>
            <div class="stat-pill">
              <span class="val remaining-val" id="remainingStat">${S.goal}</span>
              <span class="lbl">Restantes</span>
            </div>
          </div>
        </div>
      </div>`;
  },

  // ── Se llama tras insertar el HTML en el DOM ─────
  onMount() {
    this.update();
  },

  // ── Actualiza la aguja y los números ────────────
  update() {
    const consumed = this._totalConsumed();
    const goal     = S.goal;
    const pct      = Math.min(consumed / goal, 1);
    const fillEnd  = 210 + pct * 300;
    const color    = pct >= 1 ? '#f87171' : pct >= 0.85 ? '#facc15' : '#4ade80';

    const track = document.getElementById('gaugeTrack');
    const fill  = document.getElementById('gaugeFill');
    const dot   = document.getElementById('needleDot');
    if (!track) return; // widget no montado

    track.setAttribute('d', this._arc(210, 510));
    fill.setAttribute('d', pct > 0 ? this._arc(210, fillEnd) : '');
    fill.setAttribute('stroke', color);

    if (pct > 0) {
      const p = this._polar(fillEnd);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('fill', color);
    } else {
      dot.setAttribute('fill', 'transparent');
    }

    document.getElementById('consumedText').textContent = consumed;
    document.getElementById('percentText').textContent  = `de ${goal}`;
    document.getElementById('maxLabel').textContent     = goal;
    document.getElementById('consumedStat').textContent = consumed;

    const subEl = document.getElementById('currentGoalSub');
    if (subEl) subEl.textContent = `Ahora: ${goal} kcal`;

    const rem   = goal - consumed;
    const remEl = document.getElementById('remainingStat');
    remEl.textContent = Math.max(rem, 0);
    remEl.className   = 'val remaining-val' + (pct >= 1 ? ' over' : pct >= 0.85 ? ' warn' : '');
  },

  // ── Privados ─────────────────────────────────────
  _totalConsumed() {
    return ['breakfast','lunch','dinner','snacks']
      .reduce((t, id) => t + S.meals[id].reduce((s, f) => s + f.kcal, 0), 0);
  },

  _polar(deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: 130 + 108 * Math.cos(rad), y: 130 + 108 * Math.sin(rad) };
  },

  _arc(startDeg, endDeg) {
    const a = this._polar(startDeg), b = this._polar(endDeg);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${a.x} ${a.y} A 108 108 0 ${large} 1 ${b.x} ${b.y}`;
  },

  _resetToday() {
    document.querySelectorAll('.dots-menu.open').forEach(m => m.classList.remove('open'));
    if (confirm('¿Reiniciar todas las comidas de hoy?')) {
      resetTodayMeals();
      renderWidgets();
    }
  }
};
