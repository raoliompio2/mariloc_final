import express from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import compression from 'compression';
import { securityHeaders, apiLimiter, csrfProtection } from '../services/security';
import { sitemapGenerator } from '../services/sitemap-generator';
import { imageOptimizer } from '../services/image-optimizer';
import { handleError } from '../utils/error-handler';
import App from '../App';
import analyticsRoutes from './routes/analytics';

const app = express();

// Middlewares de Segurança
app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

app.use('/api', apiLimiter);
app.use(csrfProtection);
app.use(compression());

// Servir arquivos estáticos com cache
app.use(express.static('dist/client', {
  maxAge: '1y',
  etag: true,
}));

// Otimização de imagens on-the-fly
app.get('/images/:size/:format/:path*', async (req, res) => {
  try {
    const { size, format, path } = req.params;
    const imagePath = `uploads/${path}`;

    const options = {
      format: format as 'webp' | 'jpeg' | 'png' | 'avif',
      width: size === 'thumb' ? 200 : 800,
      quality: size === 'thumb' ? 60 : 80,
    };

    const optimized = await imageOptimizer.optimize(imagePath, options);

    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Type', `image/${format}`);
    res.send(optimized);
  } catch (error) {
    handleError(error);
    res.status(404).send('Imagem não encontrada');
  }
});

// Sitemap e Robots.txt
app.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await sitemapGenerator.generate();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    handleError(error);
    res.status(500).send('Erro ao gerar sitemap');
  }
});

app.get('/robots.txt', async (req, res) => {
  try {
    const robots = await sitemapGenerator.generateRobotsTxt();
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    handleError(error);
    res.status(500).send('Erro ao gerar robots.txt');
  }
});

// Registra a rota de analytics
app.use('/api/analytics', analyticsRoutes);

// Server-Side Rendering
app.get('*', (req, res) => {
  const helmetContext = {};

  const stream = renderToPipeableStream(
    <StaticRouter location={req.url}>
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    </StaticRouter>,
    {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        const { helmet } = helmetContext;
        
        res.setHeader('content-type', 'text/html');
        res.write(`
          <!DOCTYPE html>
          <html ${helmet.htmlAttributes.toString()}>
            <head>
              ${helmet.title.toString()}
              ${helmet.meta.toString()}
              ${helmet.link.toString()}
              ${helmet.script.toString()}
            </head>
            <body ${helmet.bodyAttributes.toString()}>
              <div id="root">`);
        
        stream.pipe(res);
      },
      onShellError(error) {
        handleError(error);
        res.status(500).send('<h1>Algo deu errado</h1>');
      },
      onError(error) {
        handleError(error);
        console.error(error);
      },
    }
  );
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
