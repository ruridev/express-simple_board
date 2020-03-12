var express = require('express');
var router = express.Router();
var db = require('../models/database');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

/* GET posts listing. */
router.get('/', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts',
        function (err, result) {
          console.log(err);
          res.render('posts/list', {
            posts: result.rows,
          });
        },
      );
      return "error";
    }
  });
});

/* GET posts listing. */
router.post('/', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'Insert INTO posts(writer, title, body, encrypted_password, sort_key, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [req.body.writer, req.body.title, req.body.body, req.body.password, 'sort_key', new Date(), new Date()],
        function (err, result) {
          console.log(err);
          res.redirect('/posts/' + result.rows[0].id);
        },
      );
      return "error";
    }
  });
});

/* GET post */
router.get('/new', function (req, res, next) {
  res.render('posts/new', {
    parent_id: -1,
    parent_post: null,
  });
});

/* GET post */
router.get('/:id/edit', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts WHERE id = $1',
        [req.params.id],
        function (err, result) {
          console.log(err);
          res.render('posts/edit', {
            post: result.rows[0]
          });
        },
      );
      return "error";
    }
  });
});

/* GET post */
router.get('/:id/delete', function (req, res, next) {
  res.render('posts/delete', {
    post_id: req.params.id
  });
});

/* GET post */
router.get('/:id/reply', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts WHERE id = $1',
        [req.params.id],
        function (err, result) {
          console.log(err);
          res.render('posts/new', {
            parent_post: result.rows[0],
          });
        },
      );
      return "error";
    }
  });
});

/* GET post */
router.get('/:id', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts WHERE id = $1',
        [req.params.id],
        function (err, result) {
          console.log(err);

          client.query(
            'SELECT id, post_id, body, writer, created_at, status FROM post_comments WHERE post_id = $1 order by created_at',
            [req.params.id],
            function (err2, result2) {
              console.log(err2);
              res.render('posts/view', {
                post: result.rows[0],
                comments: result2.rows
              });
            },
          );
        },
      );
      return "error";
    }
  });
});

/* GET post */
router.post('/:post_id/comments', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      return err;
    } else {
      client.query(
        'Insert INTO post_comments(post_id, writer, body, encrypted_password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)',
        [req.params.post_id, req.body.writer, req.body.body, req.body.password, new Date(), new Date()],
        function (err, result) {
          console.log(err);
          res.redirect('/posts/' + req.params.post_id);
        },
      );
    }
  });
});



module.exports = router;
