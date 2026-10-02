# BodegaVault 3D

Juego 3D en el navegador (Three.js, sin compilación): compras bodegas y contenedores, encuentras objetos de colección y construyes tu propio bazar y negocios en el barrio. Todo funciona por probabilidad.

## Cómo jugar

```bash
python3 tools/serve.py
```

Abre http://localhost:5173

- **WASD** moverse · **doble W** correr · **F** interactuar · **E** teléfono
- Clic en la escena para mirar con el mouse

## Contenido

- `index.html` — juego (economía, bazar tycoon, negocios, contenedores, agencia de autos, teléfono)
- `galeria.html` — galería de todos los modelos (`?id=`, `?cat=`)
- `js/catalog.js` — objetos, rarezas, niveles de bodega y compradores
- `js/models*.js` — modelos 3D procedurales de los objetos
- `js/store.js` — tu bazar; `js/town.js`, `js/town-buildings.js` — barrio y negocios
- `js/terminal.js` — central de contenedores, camiones y agencia
- `js/cars.js`, `js/car-models.js` — autos de marcas reales
- `js/house.js`, `js/props.js`, `js/vegetation.js` — casa, utilería y vegetación
