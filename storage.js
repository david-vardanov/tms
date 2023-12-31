const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage object
const storage = function(mcNumber) {
  return multer.diskStorage({
    destination: function(req, file, cb) {
      const carrierMcDir = path.join(__dirname, '..', 'docs', 'carrierMc', mcNumber);
      // Create a directory for the specific carrier if it does not exist
      if (!fs.existsSync(carrierMcDir)) {
        fs.mkdirSync(carrierMcDir, { recursive: true });
      }
      cb(null, carrierMcDir);
    },
    filename: function(req, file, cb) {
      cb(null, 'document' + path.extname(file.originalname));
    },
  });
};

module.exports = storage;
