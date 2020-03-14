const { Pool } = require('pg');

const pool = new Pool({
  database: 'board_development',
  user: 'board',
  password: 'boardboard',
  host: 'database-board.cpw29ttz0zzl.ap-northeast-1.rds.amazonaws.com',
  port: 5432,
});

class Postgres {
  async init() {
    this.client = await pool.connect();
  }

  async execute(query, params = []) {
    return await this.client.query(query, params);
  }

  async release() {
    await this.client.release(true);
    console.log('release');
  }

  async begin() {
    await this.client.query('BEGIN');
    console.log('BEGIN');
  }

  async commit() {
    await this.client.query('COMMIT');
    console.log('COMMIT');
  }

  async rollback() {
    await this.client.query('ROLLBACK');
    console.log('ROLLBACK');
  }
}

const getClient = async () => {
  const postgres = new Postgres();
  await postgres.init();
  return postgres;
};

module.exports.getDBClient = getClient;
