var express = require('express');
var router = express.Router();
var db = require('../models/database');

/* GET post */
router.get('/:id/edit', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'SELECT id, body, writer, created_at, updated_at, post_id, status FROM post_comments WHERE id = $1',
        [req.params.id],
        function (err, result) {
          console.log(err);
          res.render('comments/edit', {
            comment: result.rows[0]
          });
        },
      );
      return "error";
    }
  });
});

/* GET post */
router.get('/:id/delete', function (req, res, next) {
  res.render('comments/delete', {
    post_id: req.params.id
  });
});

module.exports = router;
