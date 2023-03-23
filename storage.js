const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'docs', 'carrierMC'));
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    const filename = 'document' + extname;
    cb(null, filename);
  }
});

module.exports = storage;
