var express = require('express');
var router = express.Router();
var fs = require('fs');
var postFileModel = require('../models/post_file');
const path = require('path');

router.get('/:file_name', async function(req, res, next) {
  const file = await postFileModel.get({ file_name: req.params.file_name });
  if (file == undefined) return res.render('404');
  var raw = fs.createReadStream(path.join(__dirname, 'uploads', file.file_name));

  var resHeader = {
    'Content-Type': file.mimetype,
    'Content-Disposition': 'attachment; filename="' + encodeURIComponent(file.original_name) + '"',
  };

  res.writeHead(200, resHeader);
  raw.pipe(res);
});

module.exports = router;
