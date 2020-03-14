var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.status(302).redirect('/posts');
});

module.exports = router;
