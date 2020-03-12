var express = require('express');
var router = express.Router();
var db = require('../models/database');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/* GET posts listing. */
router.get('/', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
console.log(err);
return err;
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts order by sort_key, sort_key||id',
        function (err, result) {
          if (err) console.log(err);
          res.status(200).render('posts/list', {
            posts: result.rows,
          });
        },
      );
    }
  });
});

/* GET post */
router.get('/new', function (req, res, next) {
  res.status(200).render('posts/new', {
    parent_id: -1,
    parent_post: null,
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
          if (err) console.log(err)

          client.query(
            'SELECT id, post_id, body, writer, created_at, status FROM post_comments WHERE post_id = $1 order by created_at',
            [req.params.id],
            function (err2, result2) {
              if (err2) console.log(err2)
              res.status(200).render('posts/view', {
                post: result.rows[0],
                comments: result2.rows
              });
            },
          );
        },
      );
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
      const parent_id = req.body.parent_id != undefined ? req.body.parent_id : 0;
      client.query(
        "SELECT sort_key||LPAD(to_hex(id), 10, '0') as sort_key from posts where id = $1",
        [parent_id],
        function (err, result0) {
          client.query(
            "Insert INTO posts(writer, title, body, encrypted_password, sort_key, parent_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [req.body.writer, req.body.title, req.body.body, req.body.password, result0.rows.length > 0 ? result0.rows[0].sort_key : parent_id.toString(16).padStart(10, '0'), parent_id, new Date(), new Date()],
            function (err, result) {
              if (err) console.log(err);
              res.status(302).redirect('posts/' + result.rows[0].id);
            },
          );
        },
      );
    }
  });
});

/* GET posts listing. */
router.post('/:id', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
console.log(err);
return err;
    } else {
      client.query(
        'update posts set writer = $1, title = $2, body = $3, updated_at = $4 where id = $5 RETURNING *',
        [req.body.writer, req.breq.body.body, new Date(), req.params.id],
        function (err, result) {
          if (err) console.log(err);
          res.status(302).redirect('/posts/' + result[0].id);
        },
      );
    }
  });
});

/* GET posts listing. */
router.post('/:id/delete', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
console.log(err);
return err;
    } else {
      if (err) console.log(err)
      client.query(
        'update posts set status = 1 where id = $1',
        [req.params.id],
        function (err, result) {
          if (err) console.log(err);
          res.status(302).redirect('/posts');
        },
      );
    }
  });
});


/* GET post */
router.get('/:id/edit', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      res.status(302).redirect('/');
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts WHERE id = $1',
        [req.params.id],
        function (err, result) {
          if (err) console.log(err);
          res.status(200).render('posts/edit', {
            post: result.rows[0],
            parent_post: null
          });
        },
      );
    }
  });
});

/* GET post */
router.get('/:id/delete', function (req, res, next) {
  res.status(200).render('posts/delete', {
    post_id: req.params.id
  });
});

/* GET post */
router.get('/:id/reply', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      res.status(302).redirect('/');
    } else {
      client.query(
        'SELECT id, title, body, writer, hit_count, created_at, updated_at, parent_id, sort_key, status FROM posts WHERE id = $1',
        [req.params.id],
        function (err, result) {
          if (err) console.log(err)
          res.status(200).render('posts/new', {
            parent_post: result.rows[0],
          });
        },
      );
    }
  });
});


/* GET post */
router.post('/:post_id/comments', function (req, res, next) {
  db.connect(function (err, client) {
    if (err) {
      console.log(err);
      res.status(302).redirect('/');
    } else {
      client.query(
        'Insert INTO post_comments(post_id, writer, body, encrypted_password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)',
        [req.params.post_id, req.body.writer, req.body.body, req.body.password, new Date(), new Date()],
        function (err, result) {
          if (err) console.log(err)
          res.status(302).redirect('/posts/' + req.params.post_id);
        },
      );
    }
  });
});



module.exports = router;
