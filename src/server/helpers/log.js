const pack = require('../../../package');

const label = `[${pack.name}/${pack.version}]`;

function log(type, ...args) {
  console[type](`${label} ${type} >`, ...args);
}

module.exports = {
  info: (...args) => log('info', ...args),
  error: (...args) => log('error', ...args)
};
