var express = require('express');
var router = express.Router();
var postModel = require('../models/post');
var commentModel = require('../models/comment');
var postFileModel = require('../models/post_file');
const { validationResult } = require('express-validator/check');
var md5 = require('blueimp-md5');
const multer = require('multer');
const upload = multer({ dest: './routes/uploads/' });
var { getDBClient } = require('../models/database');

router.get('/', async function(req, res, next) {
  const perPage = 10;
  var { page } = req.query;
  page = page ? parseInt(page) : 1;

  const count = await postModel.count();
  const posts = await postModel.list({ perPage, page });

  const firstPage = page == 1 ? null : 1;
  const lastPage = count / perPage > page ? parseInt(count / perPage) + 1 : null;
  const nextPage = page < lastPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  res.status(200).render('posts/list', {
    posts,
    pagination: {
      nextPage,
      prevPage,
      firstPage,
      lastPage,
      page,
    },
  });
});

router.get('/new', function(req, res, next) {
  res.status(200).render('posts/form', {
    post: null,
    parent_post: null,
    postFiles: [],
  });
});

router.get('/:id', async function(req, res, next) {
  const post = await postModel.get({ id: req.params.id });
  if (post === undefined) return res.render('404');

  if (post.parent_id) {
    const parent_post = await postModel.get({ id: post.parent_id });
    if (parent_post) post.parent_post = parent_post;
  }

  const comments = await commentModel.list({ post_id: post.id });
  const postFiles = await postFileModel.list({ post_id: post.id });

  res.status(200).render('posts/view', { post, comments, postFiles });
});

router.post('/', upload.any(), postModel.insertValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('422');

  const requested_at = new Date();
  const parent_post = await postModel.get({ id: req.body.parent_id });

  const postParam = {
    writer: req.body.writer,
    title: req.body.title,
    body: req.body.body,
    password: md5(req.body.password),
    sort_key: parent_post ? parent_post.sort_key : '',
    parent_id: parent_post ? parent_post.id : 0,
    created_at: requested_at,
    updated_at: requested_at,
  };

  var post = null;
  const transaction = await getDBClient();
  try {
    await transaction.begin();
    post = await postModel.insert({ post: postParam }, transaction);
    await postModel.sort({ post, parent_post }, transaction);
    req.files.forEach(async file => {
      const postFileParam = {
        id: post.id,
        post_file: {
          original_name: file.originalname,
          file_name: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
      };

      await postFileModel.insert(postFileParam, transaction);
    });
    await transaction.commit();
    res.status(302).redirect('/posts/' + post.id);
  } catch (e) {
    await transaction.rollback();
    throw e;
  } finally {
    await transaction.release();
  }
});

router.post('/:id', upload.any(), postModel.updateValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('422');

  const post = await postModel.get({ id: req.params.id });
  if (post === undefined) return res.render('404');
  if (post.encrypted_password != md5(req.body.password)) return res.render('400');

  const requested_at = new Date();

  const transaction = await getDBClient();
  try {
    await transaction.begin();

    if (req.body.delete_files) {
      const arry =
        typeof req.body.delete_files == 'string' ? [req.body.delete_files] : req.body.delete_files;
      arry.forEach(async id => {
        await postFileModel.delete({ id: id, post_id: req.params.id }, transaction);
      });
    }

    const postParam = {
      title: req.body.title,
      body: req.body.body,
      password: md5(req.body.password),
      id: req.params.id,
      updated_at: requested_at,
    };
    await postModel.update({ post: postParam }, transaction);

    req.files.forEach(async file => {
      const postFileParam = {
        post_id: post.id,
        post_file: {
          original_name: file.originalname,
          file_name: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
      await postFileModel.insert(postFileParam, transaction);
    });
    await transaction.commit();

    res.status(302).redirect('/posts/' + post.id);
  } catch (e) {
    await transaction.rollback();
    throw e;
  } finally {
    await transaction.release();
  }
});

router.post('/:id/delete', async function(req, res, next) {
  const post = await postModel.get({ id: req.params.id });
  if (post === undefined) return res.render('404');
  if (post.encrypted_password != md5(req.body.password)) return res.render('400');

  const requestd_at = new Date();
  const transaction = await getDBClient();
  try {
    await transaction.begin();
    await postModel.delete({ id: req.params.id, updated_at: requestd_at }, transaction);
    await postFileModel.delete({ post_id: req.params.id }, transaction);
    await transaction.commit();

    res.status(302).redirect('/posts');
  } catch (e) {
    await transaction.rollback();
    throw e;
  } finally {
    await transaction.release();
  }
});

router.get('/:id/edit', async function(req, res, next) {
  const post = await postModel.get({ id: req.params.id });
  if (post === undefined) return res.render('404');

  const postFiles = await postFileModel.list({ post_id: req.params.id });

  res.status(200).render('posts/form', {
    post,
    parent_post: null,
    postFiles,
  });
});

router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('posts/delete', {
    post_id: req.params.id,
  });
});

router.get('/:id/reply', async function(req, res, next) {
  const parent_post = await postModel.get({ id: req.params.id });
  if (parent_post === undefined) res.render('404');

  res.status(200).render('posts/form', {
    post: null,
    parent_post,
    postFiles: [],
  });
});

router.post('/:id/comments', commentModel.insertValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('422');
  const requested_at = new Date();

  const post = await postModel.get({ id: req.params.id });
  if (post === undefined) return res.render('404');

  const comment = {
    post_id: req.params.id,
    writer: req.body.writer,
    body: req.body.body,
    password: md5(req.body.password),
    created_at: requested_at,
    updated_at: requested_at,
  };

  await commentModel.insert({ comment });
  res.redirect('/posts/' + post.id);
});

module.exports = router;
