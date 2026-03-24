const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Auth service
  app.use(
    ['/auth/google', '/auth/logout'],
    createProxyMiddleware({ target: 'http://localhost:8080', changeOrigin: true })
  );

  // Sounds service
  app.use(
    '/api',
    createProxyMiddleware({ target: 'http://localhost:6666', changeOrigin: true })
  );
};
