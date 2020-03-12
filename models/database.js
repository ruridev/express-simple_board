var pg = require('pg');

module.exports = pg.Pool({
  database: 'xxx',
  user: 'xxx',
  password: 'xxx',
  host: 'xxx',
  port: 5432,
});
