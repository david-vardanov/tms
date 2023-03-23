const multer = require('multer');

// Create a storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const carrierMcDir = path.join(__dirname, '..', 'docs', 'carrierMc', req.body.mcNumber);
    // Create a directory for the specific carrier if it does not exist
    if (!fs.existsSync(carrierMcDir)) {
      fs.mkdirSync(carrierMcDir, { recursive: true });
    }
    cb(null, carrierMcDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'document' + path.extname(file.originalname));
  },
});