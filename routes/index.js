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
  res.render('index', { title: 'Express' });
});

module.exports = router;
