/**
 * widgets/meals/widget.js
 * Widget de secciones de comida: Desayuno, Comida, Cena, Snacks.
 *
 * Para activar/desactivar: Ajustes → Widgets → Comidas
 */

window.MealsWidget = {
  id: 'meals',
  label: 'Comidas',
  icon: '🍽️',
  stateKey: 'widgetMeals',

  _MEALS: [
    { id: 'breakfast', name: 'Desayuno', icon: '☀️' },
    { id: 'lunch',     name: 'Comida',   icon: '🍽️' },
    { id: 'dinner',    name: 'Cena',     icon: '🌙' },
    { id: 'snacks',    name: 'Snacks',   icon: '🍎' },
  ],

  // ── HTML del widget ──────────────────────────────
  render() {
    return `<div class="meals-wrap" id="mealsWidgetWrap">${this._renderMeals()}</div>`;
  },

  onMount() {
    // ya renderizado
  },

  // ── Re-renderiza solo las secciones de comida ────
  update() {
    const wrap = document.getElementById('mealsWidgetWrap');
    if (!wrap) return;
    wrap.innerHTML = this._renderMeals();
  },

  _renderMeals() {
    return this._MEALS.map(m => {
      const foods    = S.meals[m.id];
      const mealKcal = foods.reduce((s, f) => s + f.kcal, 0);
      const hasFood  = foods.length > 0;

      return `
        <div class="meal-section">
          <div class="meal-header" onclick="MealsWidget._toggle('${m.id}')">
            <div class="meal-header-left">
              <span class="meal-icon">${m.icon}</span>
              <span class="meal-name">${m.name}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="meal-kcal${hasFood ? ' has-food' : ''}">${mealKcal} kcal</span>
              <span class="chevron${hasFood ? ' open' : ''}" id="chev-${m.id}">▼</span>
            </div>
          </div>
          <div class="meal-body${hasFood ? ' open' : ''}" id="body-${m.id}">
            ${foods.map((f, i) => `
              <div class="food-item">
                <div class="food-item-left">
                  <span class="food-name">${f.name}</span>
                  <span class="food-qty">${f.grams}g</span>
                </div>
                <div class="food-item-right">
                  <span class="food-kcal">${f.kcal} kcal</span>
                  <button class="food-delete" onclick="MealsWidget._deleteFood('${m.id}', ${i})">✕</button>
                </div>
              </div>`).join('')}
            <div class="add-food-row">
              <button class="add-food-btn" onclick="MealsWidget._openAddFood('${m.id}')">＋ Añadir alimento</button>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  // ── Toggle sección ───────────────────────────────
  _toggle(mealId) {
    document.getElementById('body-' + mealId).classList.toggle('open');
    document.getElementById('chev-' + mealId).classList.toggle('open');
  },

  // ── Eliminar alimento ────────────────────────────
  _deleteFood(mealId, idx) {
    S.meals[mealId].splice(idx, 1);
    saveState();
    this.update();
    if (window.CalorieWidget) CalorieWidget.update();
  },

  // ── Modal añadir alimento ────────────────────────
  _currentMeal: null,
  _selectedFood: null,

  _openAddFood(mealId) {
    this._currentMeal  = mealId;
    this._selectedFood = null;
    const def = this._MEALS.find(m => m.id === mealId);
    document.getElementById('addFoodSub').textContent = `${def.icon} ${def.name}`;
    document.getElementById('foodSearch').value  = '';
    document.getElementById('foodGrams').value   = '';
    document.getElementById('gramsPreview').style.display = 'none';
    document.getElementById('searchResults').innerHTML = '<div class="no-results">Empieza a escribir para buscar</div>';
    document.getElementById('addFoodOverlay').classList.add('open');
    setTimeout(() => document.getElementById('foodSearch').focus(), 100);
  },
};

// ── Funciones globales usadas desde el HTML ────────

function renderFoodSearch(q) {
  const res = document.getElementById('searchResults');
  if (!q.trim()) {
    res.innerHTML = '<div class="no-results">Empieza a escribir para buscar</div>';
    return;
  }
  const filtered = S.foods.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
  if (filtered.length === 0) {
    res.innerHTML = '<div class="no-results">Sin resultados. Añade el alimento en Ajustes → Base de datos.</div>';
    return;
  }
  res.innerHTML = filtered.map(f => `
    <div class="search-result-item${MealsWidget._selectedFood && MealsWidget._selectedFood.name === f.name ? ' selected' : ''}"
         onclick='MealsWidget._selectFood(${JSON.stringify(f)})'>
      <span class="sri-name">${f.name}</span>
      <span class="sri-kcal">${f.kcal100} kcal/100g</span>
    </div>`).join('');
}

MealsWidget._selectFood = function(f) {
  this._selectedFood = f;
  document.querySelectorAll('.search-result-item').forEach(el => {
    el.classList.toggle('selected', el.querySelector('.sri-name').textContent === f.name);
  });
  document.getElementById('foodGrams').focus();
  updatePreview();
};

function updatePreview() {
  const grams   = parseFloat(document.getElementById('foodGrams').value);
  const preview = document.getElementById('gramsPreview');
  const sel     = MealsWidget._selectedFood;
  if (!sel || !grams || grams <= 0) { preview.style.display = 'none'; return; }
  const kcal = Math.round(sel.kcal100 * grams / 100);
  document.getElementById('previewText').textContent = `${grams}g de ${sel.name}`;
  document.getElementById('previewKcal').textContent = `${kcal} kcal`;
  preview.style.display = 'flex';
}

function addFoodToMeal() {
  const sel   = MealsWidget._selectedFood;
  const grams = parseFloat(document.getElementById('foodGrams').value);
  if (!sel || !grams || grams <= 0) return;
  const kcal = Math.round(sel.kcal100 * grams / 100);
  S.meals[MealsWidget._currentMeal].push({ name: sel.name, grams, kcal });
  saveState();
  MealsWidget.update();
  if (window.CalorieWidget) CalorieWidget.update();
  closeModal('addFoodOverlay');

  // Abrir la sección si estaba cerrada
  const body = document.getElementById('body-' + MealsWidget._currentMeal);
  const chev = document.getElementById('chev-' + MealsWidget._currentMeal);
  if (body && !body.classList.contains('open')) {
    body.classList.add('open');
    chev.classList.add('open');
  }
}
