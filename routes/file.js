var express = require('express');
var router = express.Router();
var fs = require('fs');
var postFileModel = require('../models/post_file');
const path = require('path');

/* GET home page. */
router.get('/:file_name', async function(req, res, next) {
  const files = await postFileModel.get(req.params.file_name);
  if (files) {
    const file = files[0];
    var raw = fs.createReadStream(path.join(__dirname, 'uploads', file.file_name));

    var resHeader = {
      'Content-Type': file.mimetype,
      'Content-Disposition':
        'attachment; filename="' + encodeURIComponent(file.original_name) + '"',
    };

    res.writeHead(200, resHeader);
    raw.pipe(res);
  }
});

module.exports = router;
