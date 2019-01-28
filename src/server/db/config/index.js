const fs = require('fs');
const dotenv = require('dotenv');

const prod = dotenv.parse(fs.readFileSync('.env'));
const dev = dotenv.parse(fs.readFileSync('.env.dev'));

module.exports = {
  development: {
    username: dev.DB_USER,
    password: dev.DB_PASS,
    database: dev.DB_NAME,
    host: dev.DB_HOST,
    dialect: 'postgres'
  },
  test: {
    username: dev.DB_USER,
    password: dev.DB_PASS,
    database: dev.DB_NAME,
    host: dev.DB_HOST,
    dialect: 'postgres'
  },
  production: {
    username: prod.DB_USER,
    password: prod.DB_PASS,
    database: prod.DB_NAME,
    host: prod.DB_HOST,
    dialect: 'postgres'
  }
};
