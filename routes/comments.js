var express = require('express');
var router = express.Router();
var commentModel = require('../models/comment');
const { validationResult } = require('express-validator/check');
var md5 = require('blueimp-md5');

router.get('/:id/edit', async function(req, res, next) {
  const comment = await commentModel.get({ id: req.params.id });
  res.status(200).render('comments/edit', { comment });
});

router.post('/:id', commentModel.updateValidation, async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('422');

  const requested_at = new Date();

  const comment = await commentModel.get({ id: req.params.id });
  if (comment.encrypted_password != md5(req.body.password)) return res.render('400');

  const commentParam = {
    body: req.body.body,
    id: req.params.id,
    password: md5(req.body.password),
    updated_at: requested_at,
  };
  await commentModel.update({ comment: commentParam });
  res.status(302).redirect('/posts/' + comment.post_id);
});

router.get('/:id/delete', function(req, res, next) {
  res.status(200).render('comments/delete', { comment_id: req.params.id });
});

router.post('/:id/delete', async function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('422');

  const requested_at = new Date();

  const comment = await commentModel.get({ id: req.params.id });
  if (comment.encrypted_password != md5(req.body.password)) return res.render('400');

  await commentModel.delete({ id: req.params.id, updated_at: requested_at });
  res.status(302).redirect('/posts/' + comment.post_id);
});

module.exports = router;
