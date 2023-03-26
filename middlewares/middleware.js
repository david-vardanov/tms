const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Define the storage object
const storage = function(mcNumber, token) {
    
    // Verify the token here
    // You can use jwt.verify() to validate the token and throw an error if it's not valid
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token.');
    }
  
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

// Define the upload middleware
const upload = function(mcNumber, token) {
    console.log('agarka')
    return multer({
      limits: {
        fileSize: 1024 * 1024 * 10 // 10 MB
      },
      fileFilter: function(req, file, cb) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new Error('File type not allowed.'));
        }
        cb(null, true);
      },
      storage: storage(mcNumber, token)
    });
  };




module.exports = upload;