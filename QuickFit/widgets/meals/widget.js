/**
 * widgets/meals/widget.js
 * Widget de secciones de comida: Desayuno, Comida, Cena, Snacks.
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

  render() {
    return `<div class="meals-wrap" id="mealsWidgetWrap">${this._renderMeals()}</div>`;
  },

  onMount() {},

  update() {
    const wrap = document.getElementById('mealsWidgetWrap');
    if (!wrap) return;
    wrap.innerHTML = this._renderMeals();
  },

  _editFoodAmount(mealId, idx, value, isUnits) {
  const f    = S.meals[mealId][idx];
  const food = S.foods.find(fd => fd.name === f.name);
  if (!food) return;

  const amount = parseFloat(value);
  if (!amount || amount <= 0) return;

  const grams   = isUnits ? Math.round(amount * food.gramsPerUnit) : amount;
  const kcal    = Math.round(food.kcal100 * grams / 100);
  const protein = Math.round((food.protein100 || 0) * grams / 100 * 10) / 10;

  S.meals[mealId][idx] = { ...f, grams, units: isUnits ? amount : null, kcal, protein };
  saveState();
  this.update();
  if (window.CalorieWidget) CalorieWidget.update();
  if (window.ProteinWidget) ProteinWidget._update();
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
      <input class="food-qty-input"
             type="number"
             value="${f.units || f.grams}"
             inputmode="decimal"
             step="${f.units ? '0.5' : '1'}"
             onchange="MealsWidget._editFoodAmount('${m.id}', ${i}, this.value, ${!!f.units})"
      />
      <span class="food-qty-unit">${f.units ? `ud · ${f.grams}g` : 'g'}</span>
    </div>
    <div class="food-item-right">
      <span class="food-kcal" id="food-kcal-${m.id}-${i}">${f.kcal} kcal</span>
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

  _toggle(mealId) {
    document.getElementById('body-' + mealId).classList.toggle('open');
    document.getElementById('chev-' + mealId).classList.toggle('open');
  },

  _deleteFood(mealId, idx) {
    S.meals[mealId].splice(idx, 1);
    saveState();
    this.update();
    if (window.CalorieWidget) CalorieWidget.update();
    if (window.ProteinWidget) ProteinWidget._update();
  },

  _currentMeal: null,
  _selectedFood: null,

  _openAddFood(mealId) {
    this._currentMeal  = mealId;
    this._selectedFood = null;
    const def = this._MEALS.find(m => m.id === mealId);
    document.getElementById('addFoodSub').textContent = `${def.icon} ${def.name}`;
    document.getElementById('foodSearch').value  = '';
    document.getElementById('foodGrams').value   = '';
    document.getElementById('foodUnits').value   = '';
    document.getElementById('gramsPreview').style.display  = 'none';
    document.getElementById('unitSwitch').style.display    = 'none';
    document.getElementById('foodGramsWrap').style.display = 'block';
    document.getElementById('foodUnitsWrap').style.display = 'none';
    document.getElementById('unitBtnG').classList.add('active');
    document.getElementById('unitBtnU').classList.remove('active');
    document.getElementById('searchResults').innerHTML = '<div class="no-results">Empieza a escribir para buscar</div>';
    document.getElementById('addFoodOverlay').classList.add('open');
    setTimeout(() => document.getElementById('foodSearch').focus(), 100);
  },

  _switchUnit(unit) {
    document.getElementById('unitBtnG').classList.toggle('active', unit === 'g');
    document.getElementById('unitBtnU').classList.toggle('active', unit === 'u');
    document.getElementById('foodGramsWrap').style.display = unit === 'g' ? 'block' : 'none';
    document.getElementById('foodUnitsWrap').style.display = unit === 'u' ? 'block' : 'none';
    document.getElementById('foodGrams').value = '';
    document.getElementById('foodUnits').value = '';
    document.getElementById('gramsPreview').style.display = 'none';
    setTimeout(() => {
      if (unit === 'g') document.getElementById('foodGrams').focus();
      else document.getElementById('foodUnits').focus();
    }, 50);
  },

  _selectFood(f) {
    this._selectedFood = f;
    document.querySelectorAll('.search-result-item').forEach(el => {
      el.classList.toggle('selected', el.querySelector('.sri-name').textContent === f.name);
    });

    const switchEl = document.getElementById('unitSwitch');
    if (f.gramsPerUnit) {
      switchEl.style.display = 'flex';
      document.getElementById('unitBtnG').classList.add('active');
      document.getElementById('unitBtnU').classList.remove('active');
      document.getElementById('foodGramsWrap').style.display = 'block';
      document.getElementById('foodUnitsWrap').style.display = 'none';
    } else {
      switchEl.style.display = 'none';
      document.getElementById('foodGramsWrap').style.display = 'block';
      document.getElementById('foodUnitsWrap').style.display = 'none';
    }

    document.getElementById('foodGrams').value = '';
    document.getElementById('foodUnits').value = '';
    document.getElementById('gramsPreview').style.display = 'none';
    document.getElementById('foodGrams').focus();
  },
};

// ── Funciones globales ─────────────────────────────

function renderFoodSearch(q) {
  const res = document.getElementById('searchResults');
  MealsWidget._selectedFood = null;
  document.getElementById('unitSwitch').style.display    = 'none';
  document.getElementById('gramsPreview').style.display  = 'none';

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
    <div class="search-result-item" onclick='MealsWidget._selectFood(${JSON.stringify(f)})'>
      <span class="sri-name">${f.name}</span>
      <span class="sri-kcal">${f.kcal100} kcal/100g</span>
    </div>`).join('');
}

function updatePreview() {
  const sel     = MealsWidget._selectedFood;
  const preview = document.getElementById('gramsPreview');
  if (!sel) { preview.style.display = 'none'; return; }

  const usingUnits = document.getElementById('unitBtnU').classList.contains('active');
  let grams = 0, label = '';

  if (usingUnits) {
    const units = parseFloat(document.getElementById('foodUnits').value);
    if (!units || units <= 0) { preview.style.display = 'none'; return; }
    grams = units * sel.gramsPerUnit;
    label = `${units} ud${units !== 1 ? 's' : ''} de ${sel.name} (${Math.round(grams)}g)`;
  } else {
    grams = parseFloat(document.getElementById('foodGrams').value);
    if (!grams || grams <= 0) { preview.style.display = 'none'; return; }
    label = `${grams}g de ${sel.name}`;
  }

  const kcal    = Math.round(sel.kcal100 * grams / 100);
  const protein = Math.round((sel.protein100 || 0) * grams / 100 * 10) / 10;
  document.getElementById('previewText').textContent = label;
  document.getElementById('previewKcal').textContent = `${kcal} kcal · ${protein}g prot`;
  preview.style.display = 'flex';
}



function addFoodToMeal() {
  const sel = MealsWidget._selectedFood;
  if (!sel) return;

  const usingUnits = document.getElementById('unitBtnU').classList.contains('active');
  let grams = 0, units = null;

  if (usingUnits) {
    units = parseFloat(document.getElementById('foodUnits').value);
    if (!units || units <= 0) return;
    grams = units * sel.gramsPerUnit;
  } else {
    grams = parseFloat(document.getElementById('foodGrams').value);
    if (!grams || grams <= 0) return;
  }

  const kcal    = Math.round(sel.kcal100 * grams / 100);
  const protein = Math.round((sel.protein100 || 0) * grams / 100 * 10) / 10;

  S.meals[MealsWidget._currentMeal].push({ name: sel.name, grams: Math.round(grams), units, kcal, protein });
  saveState();
  MealsWidget.update();
  if (window.CalorieWidget) CalorieWidget.update();
  if (window.ProteinWidget) ProteinWidget._update();
  closeModal('addFoodOverlay');

  const body = document.getElementById('body-' + MealsWidget._currentMeal);
  const chev = document.getElementById('chev-' + MealsWidget._currentMeal);
  if (body && !body.classList.contains('open')) {
    body.classList.add('open');
    chev.classList.add('open');
  }
}