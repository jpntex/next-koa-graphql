const next = require('next');

const dev = process.env.NODE_ENV !== 'production';

const nextjs = next({ dev, dir: './src/client' });
const nextHandler = nextjs.getRequestHandler();

module.exports = {
  nextjs,
  nextHandler
};
