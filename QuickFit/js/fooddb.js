function renderDB(query) {
  const list = document.getElementById('dbList');
  const q = query.toLowerCase().trim();
  const filtered = S.foods.filter(f => f.name.toLowerCase().includes(q));

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="db-empty">
        <span class="db-empty-icon">🥗</span>
        <span class="db-empty-text">${
          q ? `No hay resultados para "${query}"` : 'Aún no tienes alimentos.\nPulsa ＋ para añadir el primero.'
        }</span>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(f => {
    const idx = S.foods.indexOf(f);
    const unitInfo = f.gramsPerUnit ? `· ${f.gramsPerUnit}g/ud` : '';
    return `
      <div class="db-item">
        <div class="db-item-left">
          <span class="db-item-name">${f.name}</span>
          <span class="db-item-meta">${f.kcal100} kcal · ${f.protein100 || 0}g prot por 100g ${unitInfo}</span>
        </div>
        <div class="db-item-right">
          <button class="db-edit" onclick="openEditFoodModal(${idx})">✏️</button>
          <button class="db-delete" onclick="deleteDBFood(${idx})">✕</button>
        </div>
      </div>`;
  }).join('');
}

function openNewFoodModal() {
  document.getElementById('nfName').value       = '';
  document.getElementById('nfKcal').value       = '';
  document.getElementById('nfProtein').value    = '';
  document.getElementById('nfGramsPerUnit').value = '';
  document.getElementById('newFoodOverlay').classList.add('open');
  setTimeout(() => document.getElementById('nfName').focus(), 100);
}

function saveNewFood() {
  const name         = document.getElementById('nfName').value.trim();
  const kcal100      = parseInt(document.getElementById('nfKcal').value);
  const protein100   = parseFloat(document.getElementById('nfProtein').value) || 0;
  const gramsPerUnit = parseFloat(document.getElementById('nfGramsPerUnit').value) || null;
  if (!name || !kcal100 || kcal100 <= 0) return;

  S.foods.push({ name, kcal100, protein100, gramsPerUnit });
  S.foods.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  saveState();
  renderDB('');
  updateSettingsMeta();
  closeModal('newFoodOverlay');
}

// ── EDITAR ALIMENTO ────────────────────────────────
let _editFoodIdx = null;

function openEditFoodModal(idx) {
  _editFoodIdx = idx;
  const f = S.foods[idx];
  document.getElementById('efName').value        = f.name;
  document.getElementById('efKcal').value        = f.kcal100;
  document.getElementById('efProtein').value     = f.protein100 || '';
  document.getElementById('efGramsPerUnit').value = f.gramsPerUnit || '';
  document.getElementById('editFoodOverlay').classList.add('open');
  setTimeout(() => document.getElementById('efName').focus(), 100);
}

function saveEditFood() {
  if (_editFoodIdx === null) return;
  const name         = document.getElementById('efName').value.trim();
  const kcal100      = parseInt(document.getElementById('efKcal').value);
  const protein100   = parseFloat(document.getElementById('efProtein').value) || 0;
  const gramsPerUnit = parseFloat(document.getElementById('efGramsPerUnit').value) || null;
  if (!name || !kcal100 || kcal100 <= 0) return;

  S.foods[_editFoodIdx] = { ...S.foods[_editFoodIdx], name, kcal100, protein100, gramsPerUnit };
  S.foods.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  saveState();
  renderDB(document.getElementById('dbSearchInput').value);
  closeModal('editFoodOverlay');
  _editFoodIdx = null;
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