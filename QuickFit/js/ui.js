/**
 * ui.js
 * Funciones de UI compartidas: navegación entre vistas, modales, overlays.
 */

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('open'));
  document.getElementById(id).classList.add('open');

  if (id === 'viewFoodDB') {
    renderDB('');
    document.getElementById('dbSearchInput').value = '';
  }
  if (id === 'viewSettings') {
    updateSettingsMeta();
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function overlayClose(e, id) {
  if (e.target.id === id) closeModal(id);
}

// Cerrar dots menu al tocar fuera
document.addEventListener('click', () => {
  document.querySelectorAll('.dots-menu.open').forEach(m => m.classList.remove('open'));
});

function toggleDotsMenu(e) {
  e.stopPropagation();
  const menu = e.currentTarget.nextElementSibling;
  const wasOpen = menu.classList.contains('open');
  document.querySelectorAll('.dots-menu.open').forEach(m => m.classList.remove('open'));
  if (!wasOpen) menu.classList.add('open');
}

function updateSettingsMeta() {
  document.getElementById('goalDisplay').textContent = `${S.goal} kcal`;
  const count = S.foods.length;
  document.getElementById('dbCount').textContent = `${count} alimento${count !== 1 ? 's' : ''}`;
}

function confirmReset() {
  if (confirm('¿Borrar todos los datos? Esto incluye tu base de datos de alimentos.')) {
    resetState();
    renderWidgets();
    updateSettingsMeta();
    showView('viewMain');
  }
}

function saveGoal() {
  const val = parseInt(document.getElementById('goalInput').value);
  if (!val || val <= 0) return;
  S.goal = val;
  saveState();
  renderWidgets();
  updateSettingsMeta();
  closeModal('goalOverlay');
}

function openGoalModal() {
  document.querySelectorAll('.dots-menu.open').forEach(m => m.classList.remove('open'));
  document.getElementById('goalInput').value = S.goal;
  document.getElementById('goalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('goalInput').focus(), 100);
}

document.getElementById('goalInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveGoal();
});
