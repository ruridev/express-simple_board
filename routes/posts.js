var express = require('express');
var router = express.Router();
var postModel = require('../models/post');
var commentModel = require('../models/comment');
const { check, validationResult } = require('express-validator/check');
var md5 = require('blueimp-md5');
const multer = require('multer')
const upload = multer({
  dest: 'uploads/'
});

/* GET posts listing. */
router.get('/', async function(req, res, next) {
  const posts = await postModel.list();

  res.status(200).render('posts/list', { posts });
});

/* GET post */
router.get('/new', function(req, res, next) {
  res.status(200).render('posts/form', {
    post: null,
    parent_post: null,
  });
});



/* GET post */
router.get('/:id', async function(req, res, next) {
  const post = await postModel.get(req.params.id);
  const comments = await commentModel.list(req.params.id);

  res.status(200).render('posts/view', { post, comments });
});

/* GET posts listing. */
router.post('/', upload.any(), postModel.insertValidation,
  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.render('422');
    }

    const post = {
      writer: req.body.writer,
      title: req.body.title,
      body: req.body.body,
      password: md5(req.body.password),
      sort_key: 'sort_key',
      parent_id: req.body.parent_id ? req.body.parent_id : 0,
    };
    const result = await postModel.insert(post);
    res.status(302).redirect('posts/' + result[0].id);
  }
);

/* GET posts listing. */
router.post('/:id', postModel.updateValidation,
  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.render('422');
    }

    const post = {
      title: req.body.title,
      body: req.body.body,
      password: md5(req.body.password),
      id: req.params.id
    };
    const result = await postModel.update(post);
    res.status(302).redirect('/posts/' + result[0].id);
  }
);

/* GET posts listing. */
router.post('/:id/delete',
  async function(req, res, next) {
    const result = await postModel.delete(req.params.id);

    if (result.length > 0) {
      res.status(302).redirect('/posts');
    } else {
      res.render('400');
    }
  }
);

/* GET post */
router.get('/:id/edit',
  async function(req, res, next) {
    const post = await postModel.get(req.params.id);

    res.status(200).render('posts/form', {
      post,
      parent_post: null,
    });
  }
);

/* GET post */
router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('posts/delete', {
    post_id: req.params.id,
  });
});

/* GET post */
router.get('/:id/reply', async function (req, res, next) {
  const parent_post = await postModel.get(req.params.id);

  res.status(200).render('posts/form', {
    post: null,
    parent_post,
  });
});

/* GET post */
router.post('/:post_id/comments', commentModel.insertValidation,
  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.render('422');
    }

    const comment = {
      post_id: req.params.post_id,
      writer: req.body.writer,
      body: req.body.body,
      password: md5(req.body.password)
    };
    const result = await commentModel.insert(comment);
    res.status(302).redirect('/posts/' + req.params.post_id);
  }
);

module.exports = router;
