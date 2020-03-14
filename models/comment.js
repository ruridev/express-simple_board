var { execute } = require('./database');
const { check } = require('express-validator/check');

const select = async (params, transaction) => {
  const proc = async (connection, { post_id }) => {
    const query =
      "SELECT id, post_id, body, writer, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at, status FROM post_comments WHERE post_id = $1 order by id";
    const result = await connection.run_query(query, [post_id]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const selectById = async (params, transaction) => {
  const proc = async (connection, { id }) => {
    const query =
      "SELECT id, body, encrypted_password, writer, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at , updated_at, post_id, status FROM post_comments WHERE id = $1";
    const result = await connection.run_query(query, [id]);
    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const insertRecord = async (params, transaction) => {
  const proc = async (connection, { comment }) => {
    const query =
      'Insert INTO post_comments(post_id, writer, body, encrypted_password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)';

    const result = await connection.run_query(query, [
      comment.post_id,
      comment.writer,
      comment.body,
      comment.password,
      comment.created_at,
      comment.updated_at,
    ]);
    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const updateRecord = async (params, transaction) => {
  const proc = async (connection, { comment }) => {
    const query = 'UPDATE post_comments set body = $1, updated_at = $2 where id = $3 RETURNING *';
    const result = await connection.run_query(query, [
      comment.body,
      comment.updated_at,
      comment.id,
    ]);
    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const deleteRecord = async (params, transaction) => {
  const proc = async (connection, { id, updated_at }) => {
    const query = 'UPDATE post_comments set status = 1, updated_at = $2 where id = $1 RETURNING *';
    const result = await connection.run_query(query, [id, updated_at]);
    return result.rows[0];
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
  check('id').isNumeric(),
];

const updateValidation = [
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
];

module.exports.list = select;
module.exports.get = selectById;
module.exports.insert = insertRecord;
module.exports.delete = deleteRecord;
module.exports.update = updateRecord;
module.exports.insertValidation = insertValidation;
module.exports.updateValidation = updateValidation;
