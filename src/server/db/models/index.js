const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const Sequelize = require('sequelize');

const db = {};
const schemas = [];

const sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`, {
  dialect: 'postgres',
  logging: true,
  operatorsAliases: false
});

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    let { sqlModel, graphModel } = require(path.join(__dirname, file)); // eslint-disable-line

    const model = sqlModel(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    schemas.push(graphModel);
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = {
  db,
  schemas
};
