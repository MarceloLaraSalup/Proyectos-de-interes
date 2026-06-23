/**
 * fooddb.js
 * Gestión de la base de datos local de alimentos.
 */

// ── RENDER LISTA BD ────────────────────────────────
function renderDB(query) {
  const list = document.getElementById('dbList');
  const q = query.toLowerCase().trim();
  const filtered = S.foods.filter(f => f.name.toLowerCase().includes(q));

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="db-empty">
        <span class="db-empty-icon">🥗</span>
        <span class="db-empty-text">${
          q
            ? `No hay resultados para "${query}"`
            : 'Aún no tienes alimentos.\nPulsa ＋ para añadir el primero.'
        }</span>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(f => {
    const idx = S.foods.indexOf(f);
    return `
      <div class="db-item">
        <div class="db-item-left">
          <span class="db-item-name">${f.name}</span>
          <span class="db-item-meta">por 100g</span>
        </div>
        <div class="db-item-right">
          <div style="text-align:right">
            <span class="db-item-kcal">${f.kcal100}</span>
            <span class="db-item-unit"> kcal</span>
          </div>
          <button class="db-delete" onclick="deleteDBFood(${idx})">✕</button>
        </div>
      </div>`;
  }).join('');
}

// ── NUEVO ALIMENTO ─────────────────────────────────
function openNewFoodModal() {
  document.getElementById('nfName').value = '';
  document.getElementById('nfKcal').value = '';
  document.getElementById('newFoodOverlay').classList.add('open');
  setTimeout(() => document.getElementById('nfName').focus(), 100);
}

function saveNewFood() {
  const name    = document.getElementById('nfName').value.trim();
  const kcal100 = parseInt(document.getElementById('nfKcal').value);
  if (!name || !kcal100 || kcal100 <= 0) return;

  S.foods.push({ name, kcal100 });
  S.foods.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  saveState();
  renderDB('');
  updateSettingsMeta();
  closeModal('newFoodOverlay');
}

function deleteDBFood(idx) {
  if (confirm(`¿Eliminar "${S.foods[idx].name}" de tu base de datos?`)) {
    S.foods.splice(idx, 1);
    saveState();
    renderDB(document.getElementById('dbSearchInput').value);
    updateSettingsMeta();
  }
}

document.getElementById('nfKcal').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveNewFood();
});
