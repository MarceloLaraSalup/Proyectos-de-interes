/**
 * app.js
 * Punto de entrada. Inicializa la app cuando el DOM está listo.
 */

document.addEventListener('DOMContentLoaded', () => {
  checkDayRollover();
  renderWidgets();
  renderWidgetToggles();
  updateSettingsMeta();
});