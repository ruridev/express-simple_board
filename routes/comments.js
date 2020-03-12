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
          if (err) console.log(err);
          res.status(200).render('comments/edit', {
            comment: result.rows[0]
          });
        },
      );
    }
  });
});

/* GET post */
router.post('/:id', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
console.log(err);
return err;
    } else {
      client.query(
        'update post_comments set body = $1, updated_at = $2 where id = $3 RETURNING *',
        [req.body.body, new Date(), req.params.id],
        function (err, result) {
          if (err) console.log(err);
          res.status(302).redirect('/posts/' + result.rows[0].post_id);
        },
      );
    }
  });
});

/* GET post */
router.get('/:id/delete', function (req, res, next) {
  res.status(200).render('comments/delete', {
    comment_id: req.params.id
  });
});

/* GET post */
router.post('/:id/delete', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
console.log(err);
return err;
    } else {
      client.query(
        'UPDATE post_comments set status=1 where id = $1 RETURNING *',
        [req.params.id],
        function (err, result) {
          if (err) console.log(err);
          res.status(302).redirect('/posts/' + result.rows[0].post_id);
        },
      );
    }
  });
});

module.exports = router;
