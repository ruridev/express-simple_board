var { execute } = require('./database');
const { check } = require('express-validator/check');

const select = async (params, transaction) => {
  const proc = async (connection, { perPage, page }) => {
    const query =
      "SELECT id, title, body, writer, hit_count, depth, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at, parent_id, sort_key, status, (select count(1) from post_files where post_id = posts.id) as file_count FROM posts order by sort_key desc LIMIT $1 OFFSET ($2 - 1) * $1";
    const result = await connection.run_query(query, [perPage, page]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const count = async (params, transaction) => {
  const proc = async (connection, _) => {
    const query = 'SELECT count(1) as cnt from posts';
    const result = await connection.run_query(query);
    return result.rows[0].cnt;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const selectById = async (params, transaction) => {
  const proc = async (connection, { id }) => {
    const query =
      "SELECT id, title, body, writer, hit_count, encrypted_password, depth, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at, parent_id, sort_key, status FROM posts WHERE id = $1";
    const result = await connection.run_query(query, [id]);

    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const insertRecord = async (params, transaction) => {
  const proc = async (connection, { post }) => {
    const query =
      'Insert INTO posts(writer, title, body, encrypted_password, sort_key, parent_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const result = await connection.run_query(query, [
      post.writer,
      post.title,
      post.body,
      post.password,
      post.sort_key,
      post.parent_id,
      post.created_at,
      post.updated_at,
    ]);
    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const updateRecord = async (params, transaction) => {
  const proc = async (connection, { post }) => {
    const query =
      'update posts set title = $1, body = $2, updated_at = $3 where id = $4 RETURNING *';
    const result = await connection.run_query(query, [
      post.title,
      post.body,
      post.updated_at,
      post.id,
    ]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const deleteRecord = async (params, transaction) => {
  const proc = async (connection, { id, updated_at }) => {
    const query = 'update posts set status = 1, updated_at = $2 where id = $1 RETURNING *';
    const result = await connection.run_query(query, [id, updated_at]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const sortRecord = async (params, transaction) => {
  const proc = async (connection, { post, parent_post }) => {
    const query =
      "update posts set sort_key = concat(sort_key, lpad(to_hex(id), 6, '0')), depth = $2 where id = $1 RETURNING *";
    const result = await connection.run_query(query, [
      post.id,
      parent_post ? parent_post.depth + 1 : 0,
    ]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const insertValidation = [
  check('writer')
    .trim()
    .isLength({
      min: 1,
      max: 100,
    })
    .exists(),
  check('title')
    .trim()
    .isLength({
      min: 1,
    })
    .isString()
    .exists(),
  check('body')
    .trim()
    .isLength({
      min: 1,
    })
    .isString()
    .exists(),
  check('password')
    .trim()
    .isLength({
      min: 1,
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
      min: 1,
    })
    .isString()
    .exists(),
  check('body')
    .trim()
    .isLength({
      min: 1,
    })
    .isString()
    .exists(),
];

module.exports.list = select;
module.exports.count = count;
module.exports.get = selectById;
module.exports.insert = insertRecord;
module.exports.update = updateRecord;
module.exports.delete = deleteRecord;
module.exports.sort = sortRecord;
module.exports.insertValidation = insertValidation;
module.exports.updateValidation = updateValidation;
