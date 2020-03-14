var { execute } = require('./database');

const select = async (params, transaction) => {
  const proc = async (connection, { post_id }) => {
    const query =
      'SELECT id, post_id, original_name, mimetype, file_name, size from post_files where post_id = $1';
    const result = await connection.run_query(query, [post_id]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const selectByFileName = async (params, transaction) => {
  const proc = async (connection, { file_name }) => {
    const query =
      'SELECT id, post_id, original_name, mimetype, file_name, size from post_files where file_name = $1';
    const result = await connection.run_query(query, [file_name]);
    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const insertRecord = async (params, transaction) => {
  const proc = async (connection, { post_id, post_file }) => {
    const query =
      'Insert INTO post_files(post_id, original_name,  file_name, size, mimetype, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const result = await connection.run_query(query, [
      params.post_id,
      post_file.original_name,
      post_file.file_name,
      post_file.size,
      post_file.mimetype,
      new Date(),
      new Date(),
    ]);
    return result.rows[0];
  };
  const result = await execute(proc, params, transaction);
  return result;
};

const deleteRecord = async (params, transaction) => {
  const proc = async (connection, { id, post_id }) => {
    const query = 'delete from post_files where id =$1 and post_id = $2';
    const result = await connection.run_query(query, [id, post_id]);
    return result.rows;
  };
  const result = await execute(proc, params, transaction);
  return result;
};

module.exports.list = select;
module.exports.get = selectByFileName;
module.exports.insert = insertRecord;
module.exports.delete = deleteRecord;
