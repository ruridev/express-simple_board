var express = require('express');
var router = express.Router();
var commentModel = require('../models/comment');
const { validationResult } = require('express-validator/check');
var md5 = require('blueimp-md5');

/* GET post */
router.get('/:id/edit', async function(req, res, next) {
  const result = await commentModel.get(req.params.id);
  res.status(200).render('comments/edit', {
    comment: result,
  });
});

/* GET post */
router.post('/:id', commentModel.updateValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.render('422');
  }

  const comment = await commentModel.get(req.params.id);
  if (comment.encrypted_password != md5(req.body.password)) {
    return res.render('400');
  }

  const commentParam = {
    body: req.body.body,
    id: req.params.id,
    password: md5(req.body.password),
  };
  const result = await commentModel.update(commentParam);
  res.status(302).redirect('/posts/' + result[0].post_id);
});

/* GET post */
router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('comments/delete', {
    comment_id: req.params.id,
  });
});

/* GET post */
router.post('/:id/delete', async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.render('422');
  }

  const comment = await commentModel.get(req.params.id);
  if (comment.encrypted_password != md5(req.body.password)) {
    return res.render('400');
  }

  const result = await commentModel.delete(req.params.id);
  res.status(302).redirect('/posts/' + result[0].post_id);
});

module.exports = router;
