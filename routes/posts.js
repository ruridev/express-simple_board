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

/* GET posts listing. */
router.get('/', async function(req, res, next) {
  const perPage = 10;
  var { page } = req.query;
  page = page ? parseInt(page) : 1;
  const count = await postModel.count();
  const posts = await postModel.list(perPage, page);

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

/* GET post */
router.get('/new', function(req, res, next) {
  res.status(200).render('posts/form', {
    post: null,
    parent_post: null,
    postFiles: [],
  });
});

/* GET post */
router.get('/:id', async function(req, res, next) {
  const post = await postModel.get(req.params.id);
  const comments = await commentModel.list(req.params.id);
  const postFiles = await postFileModel.list(req.params.id);
  res.status(200).render('posts/view', { post, comments, postFiles });
});

/* GET posts listing. */
router.post('/', upload.any(), postModel.insertValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.render('422');
  }

  const parent_post = await postModel.get(req.body.parent_id);

  const post = {
    writer: req.body.writer,
    title: req.body.title,
    body: req.body.body,
    password: md5(req.body.password),
    sort_key: parent_post ? parent_post.sort_key : '',
    parent_id: parent_post ? parent_post.id : 0,
  };

  var result = null;
  const transaction = await getDBClient();
  try {
    await transaction.begin();

    result = await postModel.insert(post, transaction);
    await postModel.sort(result[0], parent_post, transaction);

    req.files.forEach(async file => {
      await postFileModel.insert(
        result[0].id,
        {
          original_name: file.originalname,
          file_name: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
        transaction,
      );
    });
    await transaction.commit();
  } catch (e) {
    console.log(e);
    await transaction.rollback();
    res.status(302).redirect('/posts');
  } finally {
    await transaction.release();
  }

  res.status(302).redirect('/posts/' + result[0].id);
});

/* GET posts listing. */
router.post('/:id', upload.any(), postModel.updateValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.render('422');
  }

  var result = null;
  const transaction = await getDBClient();
  try {
    await transaction.begin();

    if (req.body.delete_files) {
      const arry =
        typeof req.body.delete_files == 'string' ? [req.body.delete_files] : req.body.delete_files;
      arry.forEach(async id => {
        await postFileModel.delete(id, req.params.id, transaction);
      });
    }
    const post = await postModel.get(req.params.id);
    if (post.encrypted_password != md5(req.body.password)) {
      return res.render('400');
    }

    const postParam = {
      title: req.body.title,
      body: req.body.body,
      password: md5(req.body.password),
      id: req.params.id,
    };
    result = await postModel.update(postParam, transaction);

    req.files.forEach(async file => {
      await postFileModel.insert(post.id, {
        original_name: file.originalname,
        file_name: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      });
    }, transaction);
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    console.log(e);
    res.status(302).redirect('/posts');
  } finally {
    await transaction.release();
  }

  res.status(302).redirect('/posts/' + result[0].id);
});

/* GET posts listing. */
router.post('/:id/delete', async function(req, res, next) {
  const post = await postModel.get(req.params.id);
  if (post.encrypted_password != md5(req.body.password)) {
    return res.render('400');
  }

  const transaction = await getDBClient();
  try {
    await transaction.begin();
    const result = await postModel.delete(req.params.id, transaction);
    await transaction.commit();
    if (result.length > 0) {
      res.status(302).redirect('/posts');
    } else {
      res.render('400');
    }
  } catch (e) {
    console.log(e);
    await transaction.rollback();
    res.status(302).redirect('/posts');
  } finally {
    await transaction.release();
  }
});

/* GET post */
router.get('/:id/edit', async function(req, res, next) {
  const post = await postModel.get(req.params.id);
  const postFiles = await postFileModel.list(req.params.id);

  res.status(200).render('posts/form', {
    post,
    parent_post: null,
    postFiles,
  });
});

/* GET post */
router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('posts/delete', {
    post_id: req.params.id,
  });
});

/* GET post */
router.get('/:id/reply', async function(req, res, next) {
  const parent_post = await postModel.get(req.params.id);

  res.status(200).render('posts/form', {
    post: null,
    parent_post,
    postFiles: [],
  });
});

/* GET post */
router.post('/:post_id/comments', commentModel.insertValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.render('422');
  }

  const comment = {
    post_id: req.params.post_id,
    writer: req.body.writer,
    body: req.body.body,
    password: md5(req.body.password),
  };

  await commentModel.insert(comment);
  res.status(302).redirect('/posts/' + req.params.post_id);
});

module.exports = router;
