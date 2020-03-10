var express = require('express');
var router = express.Router();
var pg = require('pg');

var pool = pg.Pool({
  database: 'board_development',
  user: 'board',
  password: 'boardboard',
  host: 'database-board.cpw29ttz0zzl.ap-northeast-1.rds.amazonaws.com',
  port: 5432,
});

/* GET home page. */
router.get('/', function(req, res, next) {
  pool.connect(function(err, client) {
    if (err) {
      console.log(err);
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key FROM posts',
        function(err, result) {
          res.render('index', { posts: result.rows });
        },
      );
    }
  });
});


module.exports = router;
