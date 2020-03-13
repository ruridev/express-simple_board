var { getDBClient } = require('./database');
const { check } = require('express-validator/check');

const select = async (postId) => {
  const db = await getDBClient();
  try {
    const selectQuery = "SELECT id, post_id, body, writer, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at, status FROM post_comments WHERE post_id = $1 order by id ";
    const result = await db.execute(selectQuery, [postId]);
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
}

const selectById = async (id) => {
  const db = await getDBClient();
  try {
    const selectQuery = "SELECT id, body, writer, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at , updated_at, post_id, status FROM post_comments WHERE id = $1";
    const result = await db.execute(selectQuery, [id]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
}

const insertRecord = async (comment) => {
  const db = await getDBClient();
  try {
    const insertQuery = "Insert INTO post_comments(post_id, writer, body, encrypted_password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)";
    const params = [comment.post_id, comment.writer, comment.body, comment.password, new Date(), new Date()];
    const result = await db.execute(insertQuery, params);
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
}

const deleteRecord = async (id) => {
  const db = await getDBClient();
  try {
    const updateQuery = "UPDATE post_comments set status=1, updated_at = $2 where id = $1 RETURNING *";
    const params = [id, new Date()];
    const result = await db.execute(updateQuery, params);
    return result.rows;
  } catch (e) {
    console.log(e);
    Record
    throw e;
  } finally {
    await db.release();
  }
}

const insertValidation = [
  check('writer')
  .trim()
  .isLength({
    min: 1,
    max: 100
  })
  .exists(),
  check('body')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
  .exists(),
  check('password')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
  .exists(),
  check('post_id').isNumeric(),
];

const updateValidation = [
  check('body')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
  .exists(),
  check('password')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
  .exists(),
];

module.exports.list = select;
module.exports.listById = selectById;
module.exports.insert = insertRecord;
module.exports.delete = deleteRecord;
module.exports.insertValidation = insertValidation;
module.exports.updateValidation = updateValidation;

