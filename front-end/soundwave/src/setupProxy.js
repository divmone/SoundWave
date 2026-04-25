const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Auth service (порт 8080)
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/auth': '/auth', // сохраняем путь как есть
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /auth:', err);
        res.status(500).send('Proxy error');
      },
    })
  );

  // Sounds service (порт 8082)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8082',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api/v1.0', // если бэкенд ожидает /api/v1.0
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /api:', err);
        res.status(500).send('Proxy error');
      },
    })
  );

  // Payment service (порт 8080)
  app.use(
    '/api/payment',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api/payment': '/api/payment',
      },
      onError: (err, req, res) => {
        console.error('Proxy error for /api/payment:', err);
        res.status(500).send('Proxy error');
      },
    })
  );
};