# Deploy

## El problema

Vite resuelve `import.meta.env.VITE_*` en **build time**: el valor queda incrustado en el JS compilado. Eso significa que si la URL del backend cambia de un entorno a otro, hay que reconstruir la imagen — no sirve para una sola imagen Docker reutilizable en dev/staging/prod.

## La solución: Nginx + entrypoint.sh + envsubst

No se usó un servidor Express intermedio ni nada en Node en runtime. La imagen final es solo **nginx sirviendo archivos estáticos**, con un único paso dinámico al arrancar el contenedor: sustituir un placeholder con `envsubst`.

1. **`public/config.js`** es una plantilla con un placeholder de shell, que Vite copia tal cual a `dist/` en el build:
   ```js
   window.APP_CONFIG = {
     API_URL: "${VITE_API_URL}"
   };
   ```
2. **`index.html`** carga ese script antes que la app React, así `window.APP_CONFIG` ya existe cuando arranca `main.jsx`.
3. **`src/api.js`** lee `window.APP_CONFIG.API_URL` (no `import.meta.env`) para armar las URLs del backend.
4. El **`Dockerfile`** compila la app (`pnpm run build`) una sola vez — el placeholder `${VITE_API_URL}` queda literal en `dist/config.js`, sin resolver.
5. **`entrypoint.sh`** corre en cada arranque del contenedor (no en el build):
   ```sh
   envsubst '${VITE_API_URL}' < /usr/share/nginx/html/config.js > /tmp/config.js
   mv /tmp/config.js /usr/share/nginx/html/config.js
   exec nginx -g 'daemon off;'
   ```
   Reemplaza el placeholder por el valor real de la variable de entorno del contenedor, y recién ahí lanza nginx.

Resultado: la misma imagen sirve para cualquier entorno, cambiando solo una variable de entorno al arrancar el contenedor.

## Uso

```bash
docker build -t mi-frontend .
docker run --rm -p 3000:8080 -e VITE_API_URL=http://localhost:8080 mi-frontend
curl http://localhost:3000/config.js   # debe mostrar el valor real, no el placeholder
```

Si `VITE_API_URL` no se pasa, `envsubst` la reemplaza por string vacío y los `fetch` de la app apuntan a una URL rota.
