devServer: {
  proxy: {
    '/windborne': {
      target: 'https://a.windbornesystems.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/windborne': '' }
    }
  }
}
