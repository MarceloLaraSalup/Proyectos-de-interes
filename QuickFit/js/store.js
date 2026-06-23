/**
 * store.js
 * Gestión de estado y persistencia en localStorage.
 */

const STORAGE_KEY = 'calApp_v1';

const DEFAULT_STATE = {
  goal: 2000,
  widgetCalorie: true,
  widgetMeals: true,
  widgetHistory: true,
  currentDate: null,
  meals: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  },
  foods: [],
  history: []
};

let S = null;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    S = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_STATE));
    if (!S.foods)       S.foods   = [];
    if (!S.meals)       S.meals   = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    if (!S.history)     S.history = [];
    if (!S.currentDate) S.currentDate = todayStr();
    if (S.widgetCalorie === undefined) S.widgetCalorie = true;
    if (S.widgetMeals   === undefined) S.widgetMeals   = true;
    if (S.widgetHistory === undefined) S.widgetHistory = true;
  } catch (e) {
    console.warn('Error cargando estado.', e);
    S = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (e) {
    console.error('Error guardando estado.', e);
  }
}

function resetState() {
  const history = S.history || [];
  const foods   = S.foods   || [];
  localStorage.removeItem(STORAGE_KEY);
  S = JSON.parse(JSON.stringify(DEFAULT_STATE));
  S.history = history;
  S.foods   = foods;
  S.currentDate = todayStr();
  saveState();
}

function resetTodayMeals() {
  S.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  saveState();
}

function checkDayRollover() {
  const today = todayStr();
  if (S.currentDate && S.currentDate !== today) {
    archiveDay(S.currentDate);
  }
  S.currentDate = today;
  saveState();
}

function archiveDay(dateStr) {
  const exists = S.history.some(h => h.date === dateStr);
  if (exists) return;

  const total = ['breakfast','lunch','dinner','snacks']
    .reduce((t, id) => t + S.meals[id].reduce((s, f) => s + f.kcal, 0), 0);

  if (total === 0) return;

  S.history.unshift({
    date:  dateStr,
    goal:  S.goal,
    meals: JSON.parse(JSON.stringify(S.meals))
  });

  if (S.history.length > 90) S.history = S.history.slice(0, 90);

  S.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
}

// Inicializar
loadState();