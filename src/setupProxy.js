// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/windborne',
    createProxyMiddleware({
      target: 'https://a.windbornesystems.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/windborne': '' },
    })
  );
};
