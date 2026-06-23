# 🔥 Calorie Tracker

App personal de seguimiento de calorías. Funciona como PWA — se puede instalar directamente en Android desde Chrome, sin Play Store.

## ✨ Funcionalidades

- **Velocímetro de calorías** — muestra el consumo diario con colores (verde → amarillo → rojo)
- **Secciones de comida** — Desayuno, Comida, Cena y Snacks
- **Base de datos local** — añade tus alimentos con kcal/100g y búscalos al registrar
- **Cálculo automático** — introduce los gramos y calcula solo
- **Widgets modulares** — activa/desactiva cada sección desde Ajustes
- **100% offline** — todo se guarda en localStorage, sin servidor ni login

---

## 🚀 Instalación en Android (Google Pixel / Chrome)

1. Sube el proyecto a GitHub Pages, Netlify o cualquier hosting HTTPS
2. Abre Chrome en tu Android y navega a la URL
3. Pulsa el menú (⋮) → **"Añadir a pantalla de inicio"**
4. La app se instala como cualquier app nativa

> ⚠️ El Service Worker requiere HTTPS. En local usa `localhost` que también funciona.

### Probar en local

```bash
# Opción A: Python (sin instalar nada)
cd calorie-tracker
python3 -m http.server 8080
# Abre http://localhost:8080

# Opción B: Node
npx serve .
```

---

## 📁 Estructura del proyecto

```
calorie-tracker/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline)
├── css/
│   ├── base.css            # Reset, layout, nav
│   └── components.css      # Tarjetas, modales, settings
├── js/
│   ├── store.js            # Estado global + localStorage
│   ├── ui.js               # Navegación, modales, helpers
│   ├── fooddb.js           # Base de datos de alimentos
│   ├── widgets.js          # Registro y render de widgets
│   └── app.js              # Inicialización
├── widgets/
│   ├── calories/
│   │   └── widget.js       # Widget velocímetro
│   └── meals/
│       └── widget.js       # Widget secciones de comida
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## ➕ Añadir un nuevo widget

1. Crea la carpeta `widgets/mi-widget/widget.js`
2. Define el objeto siguiendo esta estructura:

```js
window.MiWidget = {
  id: 'mi-widget',
  label: 'Mi Widget',       // nombre en Ajustes
  icon: '💧',               // emoji en Ajustes
  stateKey: 'widgetMiWidget', // clave en el estado

  render() {
    return `<div class="widget-card">...</div>`;
  },

  onMount() {
    // lógica post-render
  },

  update() {
    // actualizar valores sin re-renderizar todo
  }
};
```

3. Añade el script en `index.html`:
```html
<script src="widgets/mi-widget/widget.js"></script>
```

4. Regístralo en `js/widgets.js`:
```js
const WIDGET_REGISTRY = [
  window.CalorieWidget,
  window.MealsWidget,
  window.MiWidget,  // ← aquí
];
```

---

## 🗺️ Roadmap

- [ ] Macros (proteínas, carbohidratos, grasas)
- [ ] Historial por días
- [ ] Widget de agua
- [ ] Exportar datos como JSON

---

## 📄 Licencia

MIT — úsalo y modifícalo libremente.
