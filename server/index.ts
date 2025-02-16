import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

import authRoute from './routes/auth'
import scrapeRoute from './routes/scrape'
import saveRoute from './routes/save'
import pushToFacebookRoute from './routes/pushToFacebook'
import openaiRoute from './routes/openai'

const app = express()

app.use(
  cors({
    origin: '*',
  }),
)

// Parse JSON bodies for API endpoints
app.use(bodyParser.json({ limit: '2mb' }))
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }))

/* ---------------------------
   Mount API routes
--------------------------- */
app.use('/auth', authRoute)
app.use('/scrape', scrapeRoute)
app.use('/save', saveRoute)
app.use('/push-to-facebook', pushToFacebookRoute)
app.use('/openai', openaiRoute)

const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
  // In development mode, use Vite as middleware.
  // This enables hot module reloading and serves your client files from memory.
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.use(vite.middlewares)

  // Catch-all fallback for client-side routes.
  // This ensures that routes like /login return the transformed index.html.
  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl
      // Read the index.html file from the project root.
      const indexHtmlPath = path.join(process.cwd(), 'index.html')
      let template = fs.readFileSync(indexHtmlPath, 'utf-8')
      // Transform the HTML with Vite (injects HMR, etc.)
      template = await vite.transformIndexHtml(url, template)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } catch (e: any) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })
} else {
  // In production mode, serve the built client assets.
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  app.use(express.static(path.join(__dirname, '../frontend')))

  // For SPA: Any unhandled route returns the client index.html.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
  })
}

const PORT = process.env.PORT || 6942
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${isDev ? 'development' : 'production'} mode`)
})
