var { getDBClient } = require('./database');
const { check } = require('express-validator/check');

const SELECT_QUERY =
  '\
WITH RECURSIVE r_posts AS ( \
  SELECT \
    posts.*, \
    1 AS depth \
  FROM posts \
  UNION ALL \
  SELECT \
    posts.*, \
    r_posts.depth + 1 \
  FROM posts \
  INNER JOIN r_posts \
    ON posts.parent_id = r.id \
) \
SELECT * FROM r_posts';

const select = async () => {
  const db = await getDBClient();
  try {
    const selectQuery = "SELECT id, title, body, writer, hit_count, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at, parent_id, sort_key, status FROM posts order by sort_key, sort_key || id";
    const result = await db.execute(selectQuery);
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
    const selectQuery = "SELECT id, title, body, writer, hit_count, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at, parent_id, sort_key, status FROM posts WHERE id = $1 ";
    const result = await db.execute(selectQuery, [id]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
}

const insertRecord = async (post) => {
  const db = await getDBClient();
  try {
    const insertQuery = "Insert INTO posts(writer, title, body, encrypted_password, sort_key, parent_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING * ";
    const params = [post.writer, post.title, post.body, post.password, post.sort_key, post.parent_id, new Date(), new Date()];
    const result = await db.execute(insertQuery, params);
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
}

const updateRecord = async (post) => {
  const db = await getDBClient();
  try {
    const updateQuery = "update posts set title = $1, body = $2, updated_at = $3 where id = $4 and encrypted_password = $5 RETURNING *";
    const params = [post.title, post.body, new Date(), post.id, post.password];
    const result = await db.execute(updateQuery, params);
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await db.release();
  }
}

const deleteRecord = async(id) => {
  const db = await getDBClient();
  try {
    const updateQuery = "update posts set status = 1, updated_at = $2 where id = $1 RETURNING *";
    const params = [id, new Date()];
    const result = await db.execute(updateQuery, params);
    return result.rows;
  } catch (e) {
    console.log(e);Record
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
  check('title')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
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
  check('parent_id')
  .isNumeric()
  .optional(),
];

const updateValidation = [
  check('title')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
  .exists(),
  check('body')
  .trim()
  .isLength({
    min: 1
  })
  .isString()
  .exists(),
];

module.exports.list = select;
module.exports.get = selectById;
module.exports.insert = insertRecord;
module.exports.update = updateRecord;
module.exports.delete = deleteRecord;
module.exports.insertValidation = insertValidation;
module.exports.updateValidation = updateValidation;

