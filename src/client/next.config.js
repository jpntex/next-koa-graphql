const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  dev: !isProd,
  distDir: '../../dist'
};
