# Deploy y configuración por entorno

Este proyecto (`src/api.js`) obtiene la URL del backend desde `window.APP_CONFIG.API_URL`, **no** desde `import.meta.env`. Esto permite compilar la imagen Docker **una sola vez** y reutilizarla en cualquier entorno (dev, staging, prod) cambiando solo una variable de entorno al arrancar el contenedor, sin recompilar.

## Cómo funciona

1. **`public/config.js`** es una plantilla con un placeholder de shell:
   ```js
   window.APP_CONFIG = {
     API_URL: "${VITE_API_URL}"
   };
   ```
   Se copia tal cual a `dist/` durante el build (todo `public/` pasa directo a la raíz de salida de Vite).

2. **`index.html`** carga ese script antes que la app React, así `window.APP_CONFIG` ya existe cuando arranca `main.jsx`.

3. **`Dockerfile`** compila la app (`pnpm run build`) sin resolver el placeholder — queda literal `${VITE_API_URL}` dentro de `dist/config.js`. La imagen final es `nginx:alpine` sirviendo esos estáticos.

4. **`entrypoint.sh`** corre cada vez que arranca el contenedor (no en el build):
   ```sh
   envsubst '${VITE_API_URL}' < /usr/share/nginx/html/config.js > /tmp/config.js
   mv /tmp/config.js /usr/share/nginx/html/config.js
   exec nginx -g 'daemon off;'
   ```
   `envsubst` reemplaza el placeholder por el valor real de la variable de entorno del contenedor y luego lanza nginx.

`.env` / `.env.example` solo aplican a desarrollo local con `vite dev` (Vite los lee y expone `import.meta.env.VITE_API_URL`), pero `App.jsx` no usa esa vía — por eso el mecanismo de `config.js` es necesario en producción.

## Probar localmente con Docker

### 1. Construir la imagen
```bash
docker build -t mi-frontend .
```

### 2. Levantar el contenedor con una variable de entorno
```bash
docker run --rm -p 3000:80 -e VITE_API_URL=http://localhost:8080 mi-frontend
```
La app queda disponible en `http://localhost:3000` (el backend Quarkus sigue en el 8080, sin conflicto).

### 3. Verificar que la sustitución ocurrió
```bash
curl http://localhost:3000/config.js
```
Debe mostrar el valor real, no el placeholder:
```js
window.APP_CONFIG = {
  API_URL: "http://localhost:8080"
};
```
Si ves literalmente `${VITE_API_URL}`, el `entrypoint.sh` no corrió (revisa permisos de ejecución y que sea el `ENTRYPOINT` del contenedor).

### 4. Confirmar que la misma imagen sirve para otro entorno
```bash
docker run --rm -p 3001:80 -e VITE_API_URL=http://otra-api:9000 mi-frontend
curl http://localhost:3001/config.js
```
Debe reflejar `http://otra-api:9000` sin haber reconstruido la imagen.

### 5. Revisar la app en el navegador
Abre `http://localhost:3000`. `src/api.js` hace los `fetch` a `${API_URL}/api/sucursales`, `${API_URL}/api/sipap` y `${API_URL}/favoritos`; si el backend indicado en `VITE_API_URL` no está corriendo localmente, verás el error en la consola del navegador — eso confirma que la URL inyectada es la correcta, aunque el backend no responda.

## Deploy real (ej. Docker run / orquestador)

Pasar la variable en el comando de arranque o en la configuración del servicio:

```bash
docker run -d -p 80:80 -e VITE_API_URL=https://api.miempresa.com mi-frontend
```

Con `docker-compose`, equivalente vía `environment:` en el servicio.

## Gotchas

- Si no se pasa `VITE_API_URL` al arrancar el contenedor, `envsubst` la sustituye por **string vacío**, y el `fetch` de `App.jsx` apuntará a una URL rota (`/api/sucursales` sin host).
- Si se agrega una nueva variable de entorno runtime, hay que mantener sincronizados tres lugares:
  1. `public/config.js` (agregar el placeholder `${NUEVA_VAR}`)
  2. `entrypoint.sh` (agregarla a la lista que recibe `envsubst`, ej. `envsubst '${VITE_API_URL} ${NUEVA_VAR}'`)
  3. El comando/orquestador que lanza el contenedor (`-e NUEVA_VAR=...`)
