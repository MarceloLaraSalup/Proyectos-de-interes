'''
  ___               _                   ___ 
 / _ \ _   _  ___  | |__   __ _  ___ __|__ \
| | | | | | |/ _ \ | '_ \ / _` |/ __/ _ \/ /
| |_| | |_| |  __/ | | | | (_| | (_|  __/_| 
 \__\_\\__,_|\___| |_| |_|\__,_|\___\___(_) 
'''
App personal de seguimiento de calorías. Funciona como PWA — se puede instalar directamente en Android desde Chrome, sin Play Store.

------------------------------------------------------------------------------------------------------------------------------------------
'''
 _____                 _                       
|  ___|   _ _ __   ___(_) ___  _ __   ___  ___ 
| |_ | | | | '_ \ / __| |/ _ \| '_ \ / _ \/ __|
|  _|| |_| | | | | (__| | (_) | | | |  __/\__ \
|_|   \__,_|_| |_|\___|_|\___/|_| |_|\___||___/
'''
- **Medidor de calorías** — muestra el consumo diario con colores (verde → amarillo → rojo)
- **Secciones de comida** — Desayuno, Comida, Cena y Snacks
- **Base de datos local** — añade tus alimentos con kcal/100g y búscalos al registrar
- **Cálculo automático** — introduce los gramos y calcula solo
- **Widgets modulares** — activa/desactiva cada sección desde Ajustes y crea los widgets que se ajusten a ti
- **100% offline** — todo se guarda en localStorage, sin servidor ni login

------------------------------------------------------------------------------------------------------------------------------------------
'''
 _           _        _            _             
(_)_ __  ___| |_ __ _| | __ _  ___(_) ___  _ __  
| | '_ \/ __| __/ _` | |/ _` |/ __| |/ _ \| '_ \ 
| | | | \__ \ || (_| | | (_| | (__| | (_) | | | |
|_|_| |_|___/\__\__,_|_|\__,_|\___|_|\___/|_| |_|
'''
1. Abre Chrome en tu Android y navega a la URL
2. Pulsa el menú (⋮) → **"Añadir a pantalla de inicio"**
3. La app se instala como cualquier app nativa

------------------------------------------------------------------------------------------------------------------------------------------
'''           _                   _                   
  ___  ___| |_ _ __ _   _  ___| |_ _   _ _ __ __ _ 
 / _ \/ __| __| '__| | | |/ __| __| | | | '__/ _` |
|  __/\__ \ |_| |  | |_| | (__| |_| |_| | | | (_| |
 \___||___/\__|_|   \__,_|\___|\__|\__,_|_|  \__,_|
'''
!!! Esta estuctura puede cambiar porque está en fase de prueba y los widjets se añaden y borran constantemente !!!

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
------------------------------------------------------------------------------------------------------------------------------------------
'''
                          _                   _      
  ___ _ __ ___  __ _  ___(_) ___  _ __     __| | ___ 
 / __| '__/ _ \/ _` |/ __| |/ _ \| '_ \   / _` |/ _ \
| (__| | |  __/ (_| | (__| | (_) | | | | | (_| |  __/
 \___|_|  \___|\__,_|\___|_|\___/|_| |_|  \__,_|\___|
                                                     
          _     _            _       
__      _(_) __| | __ _  ___| |_ ___ 
\ \ /\ / / |/ _` |/ _` |/ _ \ __/ __|
 \ V  V /| | (_| | (_| |  __/ |_\__ \
  \_/\_/ |_|\__,_|\__, |\___|\__|___/
                  |___/              
'''
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
------------------------------------------------------------------------------------------------------------------------------------------