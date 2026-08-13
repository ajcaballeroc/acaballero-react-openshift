import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// public/config.js ships with an unresolved `${VITE_API_URL}` placeholder that
// only gets substituted by entrypoint.sh inside the Docker image (see DEPLOY.md).
// `vite dev` never runs that step, so this plugin resolves it from .env for local dev.
function devConfigJs(env) {
  return {
    name: 'dev-config-js',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/config.js') return next()
        res.setHeader('Content-Type', 'application/javascript')
        res.end(`window.APP_CONFIG = {\n  API_URL: "${env.VITE_API_URL ?? ''}"\n};\n`)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devConfigJs(env)],
  }
})
