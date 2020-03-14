var { getDBClient } = require('./database');
const { check } = require('express-validator/check');

const select = async post_id => {
  const db = await getDBClient();
  try {
    const selectQuery =
      'SELECT id, post_id, original_name, path, size from post_files where post_id = $1';
    const params = [post_id];
    const result = await db.execute(selectQuery, params);

    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
};

const insertRecord = async (post_id, post_file, transaction) => {
  const db = transaction || (await getDBClient());
  try {
    const insertQuery =
      'Insert INTO post_files(post_id, original_name, path, size, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING * ';
    const params = [
      post_id,
      post_file.original_name,
      post_file.path,
      post_file.size,
      new Date(),
      new Date(),
    ];
    const result = await db.execute(insertQuery, params);
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    transaction || (await db.release());
  }
};

const deleteRecord = async (id, post_id, transaction) => {
  const db = transaction || (await getDBClient());
  try {
    const deleteQuery = 'delete from post_files where id =$1 and post_id = $2';
    const params = [id, post_id];
    await db.execute(deleteQuery, params);
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    transaction || (await db.release());
  }
};

module.exports.list = select;
module.exports.insert = insertRecord;
module.exports.delete = deleteRecord;
