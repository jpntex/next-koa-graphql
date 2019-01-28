const Koa = require('koa');
const http = require('http');
const Router = require('koa-router');
const jwt = require('jsonwebtoken');

// middlewares
// const jwt = require('koa-jwt');
const middlewares = require('./middlewares');

// helpers
const { nextjs, nextHandler } = require('./helpers/next');
const log = require('./helpers/log');

// apollo server
const apolloServer = require('./api');

// variables
const port = parseInt(process.env.HTTP_PORT, 10) || 3000;

log.info('Starting server...');

const app = new Koa();
const server = http.createServer(app.callback());

let resolveReady;
const ready = new Promise((resolve) => {
  resolveReady = resolve;
});

// apply middlewares
middlewares(app);

const { db } = require('./db/models');

// console.log(db);
db.sequelize.sync().then(() => {
  nextjs.prepare()
    .then(() => {
      // app.use(jwt({
      //   secret: process.env.JWT_SECRET,
      //   credentialsRequired: false
      // }));

      // Set apollo server at /api path
      apolloServer.applyMiddleware({
        app,
        path: '/api'
      });

      // Set server router paths
      const router = new Router();

      // Healthcheck
      router.get('/healthcheck', (ctx) => {
        // check here if api and dbs are up
        ctx.body = 'OK';
      });

      // Signout
      router.get('/signout', (ctx) => {
        ctx.cookies.set('token', '');
        ctx.redirect('/');
      });

      // NextJS Render
      router.get('*', async (ctx) => {
        try {
          const token = ctx.cookies.get('token');
          if (token) {
            const { id, email } = jwt.verify(token, process.env.JWT_SECRET);
            if (id && email) {
              ctx.res.state = {
                user: {
                  id, email
                }
              };
            }
          }
        } catch (err) {
          log.error(err);
        }

        ctx.respond = false;
        await nextHandler(ctx.req, ctx.res);
      });

      app.use(router.routes());
      app.use(router.allowedMethods());

      server.listen(port, () => {
        log.info(`🚀  Listening at http://localhost:${port}`);
        log.info(`🚀  [API] Ready at http://localhost:${port}${apolloServer.graphqlPath}`);
        resolveReady();
      });
    });
});

module.exports = {
  ready,
  close() {
    server.close();
  }
};
