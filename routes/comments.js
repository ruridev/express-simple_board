var express = require('express');
var router = express.Router();
var db = require('../models/database');
const { check, validationResult } = require('express-validator/check');

/* GET post */
router.get('/:id/edit', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        client.query(
          "SELECT id, body, writer, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at , updated_at, post_id, status FROM post_comments WHERE id = $1",
          [req.params.id],
          function(err, result) {
            if (err) console.log(err);
            res.status(200).render('comments/edit', {
              comment: result.rows[0],
            });
          },
        );
      }
    } finally {
      console.log('커넥션 풀 반환');
      client.release();
    }
  });
});

/* GET post */
router.post(
  '/:id',
  [
    check('body')
      .trim()
      .isLength({ min: 1 })
      .isString()
      .exists(),
    check('password')
      .trim()
      .isLength({ min: 1 })
      .isString()
      .exists(),
    check('post_id').isNumeric(),
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.render('422');
    }
    db.connect(function(err, client) {
      try {
        if (err) {
          console.log(err);
        } else {
          client.query(
            'update post_comments set body = $1, updated_at = $2 where id = $3 RETURNING *',
            [req.body.body, new Date(), req.params.id],
            function(err, result) {
              if (err) console.log(err);
              res.status(302).redirect('/posts/' + result.rows[0].post_id);
            },
          );
        }
      } finally {
        console.log('커넥션 풀 반환');
        client.release();
      }
    });
  },
);

/* GET post */
router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('comments/delete', {
    comment_id: req.params.id,
  });
});

/* GET post */
router.post('/:id/delete', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        client.query(
          'UPDATE post_comments set status=1, updated_at = $2 where id = $1 RETURNING *',
          [req.params.id, new Date()],
          function(err, result) {
            if (err) console.log(err);
            res.status(302).redirect('/posts/' + result.rows[0].post_id);
          },
        );
      }
    } finally {
      console.log('커넥션 풀 반환');
      client.release();
    }
  });
});

module.exports = router;
