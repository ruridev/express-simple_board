var express = require('express');
var router = express.Router();
var db = require('../models/database');
const { check, validationResult } = require('express-validator/check');

/* GET posts listing. */
router.get('/', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        client.query(
          "SELECT id, title, body, writer, hit_count, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at , parent_id, sort_key, status FROM posts order by sort_key, sort_key||id",
          function(err, result) {
            if (err) console.log(err);
            res.status(200).render('posts/list', {
              posts: result.rows,
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
router.get('/new', function(req, res, next) {
  res.status(200).render('posts/form', {
    post: null,
    parent_post: null,
  });
});

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

/* GET post */
router.get('/:id', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        client.query(
          "SELECT id, title, body, writer, hit_count, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at , parent_id, sort_key, status FROM posts WHERE id = $1",
          [req.params.id],
          function(err, result) {
            if (err) console.log(err);
            if (result == undefined) {
              return res.render('404');
            }
            if (result.rows.length == 0) {
              return res.render('404');
            }
            client.query(
              "SELECT id, post_id, body, writer, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at , status FROM post_comments WHERE post_id = $1 order by created_at",
              [req.params.id],
              function(err2, result2) {
                if (err2) console.log(err2);
                res.status(200).render('posts/view', {
                  post: result.rows[0],
                  comments: result2.rows,
                });
              },
            );
          },
        );
      }
    } finally {
      console.log('커넥션 풀 반환');
      client.release();
    }
  });
});

/* GET posts listing. */
router.post(
  '/',
  [
    check('writer')
      .trim()
      .isLength({ min: 1, max: 100 })
      .exists(),
    check('title')
      .trim()
      .isLength({ min: 1 })
      .isString()
      .exists(),
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
    check('parent_id')
      .isNumeric()
      .optional(),
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
          const parent_id = req.body.parent_id != undefined ? req.body.parent_id : 0;
          client.query(
            "SELECT sort_key||LPAD(to_hex(id), 10, '0') as sort_key from posts where id = $1",
            [parent_id],
            function(err, result0) {
              client.query(
                'Insert INTO posts(writer, title, body, encrypted_password, sort_key, parent_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [
                  req.body.writer,
                  req.body.title,
                  req.body.body,
                  req.body.password,
                  result0.rows.length > 0
                    ? result0.rows[0].sort_key
                    : parent_id.toString(16).padStart(10, '0'),
                  parent_id,
                  new Date(),
                  new Date(),
                ],
                function(err, result) {
                  if (err) console.log(err);
                  res.status(302).redirect('posts/' + result.rows[0].id);
                },
              );
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

/* GET posts listing. */
router.post(
  '/:id',
  [
    check('title')
      .trim()
      .isLength({ min: 1 })
      .isString()
      .exists(),
    check('body')
      .trim()
      .isLength({ min: 1 })
      .isString()
      .exists(),
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
            'update posts set title = $1, body = $2, updated_at = $3 where id = $4 RETURNING *',
            [req.body.title, req.body.body, new Date(), req.params.id],
            function(err, result) {
              console.log(result);
              if (err) console.log(err);
              res.status(302).redirect('/posts/' + result.rows[0].id);
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

/* GET posts listing. */
router.post('/:id/delete', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        if (err) console.log(err);
        client.query(
          'update posts set status = 1, updated_at = $2 where id = $1',
          [req.params.id, new Date()],
          function(err, result) {
            if (err) console.log(err);
            res.status(302).redirect('/posts');
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
router.get('/:id/edit', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        client.query(
          'SELECT id, title, body, writer, hit_count, parent_id, sort_key, status FROM posts WHERE id = $1',
          [req.params.id],
          function(err, result) {
            if (err) console.log(err);
            res.status(200).render('posts/form', {
              post: result.rows[0],
              parent_post: null,
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
router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('posts/delete', {
    post_id: req.params.id,
  });
});

/* GET post */
router.get('/:id/reply', function(req, res, next) {
  db.connect(function(err, client) {
    try {
      if (err) {
        console.log(err);
      } else {
        client.query(
          "SELECT id, title, body, writer, hit_count, to_char(created_at, 'yyyy/mm/dd hh24:mm:ss') as created_at, to_char(updated_at, 'yyyy/mm/dd hh24:mm:ss') as updated_at,  parent_id, sort_key, status FROM posts WHERE id = $1",
          [req.params.id],
          function(err, result) {
            if (err) console.log(err);
            res.status(200).render('posts/form', {
              post: null,
              parent_post: result.rows[0],
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
  '/:post_id/comments',
  [
    check('writer')
      .trim()
      .isLength({ min: 1, max: 100 })
      .exists(),
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
            'Insert INTO post_comments(post_id, writer, body, encrypted_password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)',
            [
              req.params.post_id,
              req.body.writer,
              req.body.body,
              req.body.password,
              new Date(),
              new Date(),
            ],
            function(err, result) {
              if (err) console.log(err);
              res.status(302).redirect('/posts/' + req.params.post_id);
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

module.exports = router;
