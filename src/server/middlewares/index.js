const compression = require('compression');
const koaConnect = require('koa-connect');
const helmet = require('koa-helmet');
const morgan = require('koa-morgan');
const log = require('../helpers/log');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = (app) => {
  // error handling
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.body = isDev ? `Error: ${err.message}` : '';
      ctx.status = err.statusCode || err.status || 500;
      log.error(err);
    }
  });

  // middlewares
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(koaConnect(compression()));
};
