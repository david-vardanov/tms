// helper/awsSdk.js
const { S3 } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const jwt = require('jsonwebtoken');
const path = require('path');
const Invite = require('../models/invite');
// const https = require('https');

const s3 = new S3({
  endpoint: process.env.ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  //requestHandler: new https.Agent({ rejectUnauthorized: false }).request,
  forcePathStyle: true // Add this line

});


const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: "https://sfo3.digitaloceanspaces.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: async function (req, file, cb) {
      const { token } = req.body;
      const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
      const invite = await Invite.findById(inviteId);
      const mcNumber = invite.mcNumber || 'unknown';
      const folderPath = `carrierMc/${mcNumber}`;
      const fileName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, `${folderPath}/${fileName}`);
    },
  }),
});

module.exports = { s3Client, upload };
