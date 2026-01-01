# Almacén - Inventario

Proyecto simple de inventario con cliente estático y servidor Node.js (Express + Socket.IO).

Estructura:
- `index.html`, `inventario.html`: cliente
- `server.js`: servidor Express con API y subida de imágenes
- `images/`: carpeta de imágenes subidas (no incluida en git)
- `data/`: datos persistentes del servidor (no incluida en git)

Instalación y ejecución (local):

```powershell
cd "c:/Users/falco/OneDrive/Escritorio/almacén"
npm install
npm start
# Abrir http://localhost:3000/index.html
```

Notas:
- Si quieres hostear en GitHub Pages, solo el cliente funciona; para la funcionalidad en tiempo real debes desplegar `server.js` en Render/Railway/u otro host.
Inventario - Instrucciones rápidas

Archivos y carpetas creados:
- imágenes/  -> Coloca aquí las imágenes de productos (nombre debe coincidir con `imageName` en inventario)
- imagenes/  -> Alias sin acento por compatibilidad
- data/usuarios_sample.txt -> Ejemplo de usuarios en Base64
- data/inventario_sample.csv -> Ejemplo de inventario exportado/importable

Cómo probar:
1) Coloca `index.html` e `inventario.html` en la misma carpeta (ya están).
2) Abre `index.html` en tu navegador (doble clic). Inicia sesión con:
   - Usuario: admin
   - Contraseña: admin123
3) Al iniciar serás redirigido a `inventario.html`.
4) Para agregar imágenes: guarda los archivos en `imágenes/` (o `imagenes/`) y en el producto usa el campo "Imagen" para subirlas.
5) Puedes importar el CSV de ejemplo desde la interfaz de Inventario -> Importar CSV.

Notas:
- Las contraseñas en `data/usuarios_sample.txt` y en la app están codificadas en Base64 (solo demo).
- Para usar hashing seguro (SHA-256) es necesario servir los archivos por HTTPS o localhost y cambiar la implementación de `hash()`.
- Para servir localmente (opcional), abre una terminal en esta carpeta y ejecuta:

  python -m http.server 8000

  Luego abre http://localhost:8000 en el navegador.

Si quieres que prepare un ZIP con las imágenes o un formato CSV con columnas separadas, dímelo y lo genero.