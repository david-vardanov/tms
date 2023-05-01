const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const moment = require('moment');
const Carrier = require('../models/carrier');
const Invite = require('../models/invite');
const Business = require('../models/business');
const User = require('../models/user');
const Document = require('../models/document');
const paginate = require('express-paginate');
const { debounce } = require('lodash');

const { sanitizeInput } = require('../middlewares/sanitize');
const { validateCarrierSetup } = require('../middlewares/validation');
const { generateBrokerCarrierAgreement } = require('../helper/pdfGenerator');
const isAuthenticated = require('../middlewares/authMiddleware');

const crypto = require('crypto');
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const ConnectMongoDBSession = require('connect-mongodb-session');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { upload, s3Client } = require('../helper/awsSdk');
const { GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { URL } = require('url');
const fs = require('fs');


//POST REQUEST FOR CARRIER SETUP

// Other routes...

router.get('/carrier-setup', async (req, res) => {
  const token = req.query.token;

  try {
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);

    const mcNumber = invite.mcNumber;
    
    if (invite && moment().isBefore(invite.expiresAt)) {
      // Fetch the carrier using the mcNumber
      const formData = req.query.data ? JSON.parse(req.query.data) : {};
      let files = req.session.files || {};
      // Render the carrierSetup view with the carrier data
      res.render('carrierSetup', { mcNumber,invite, token, title: "Carrier Setup", flash: req.flash(), formData: formData, files });
    } else {
      res.status(400).send('The invite link is expired or invalid.');
    }
  } catch (error) {
    res.status(400).send('The invite link is expired or invalid.');
  }
});

router.get("/search", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    if (query && query.length >= 3) {
      const carriers = await Carrier.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { mcNumber: { $regex: query, $options: "i" } },
        ],
      })
        .limit(10)
        .lean();

      res.status(200).json({ success: true, carriers });
    } else {
      res.status(400).json({ success: false, message: "Invalid query" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


router.get("/remove-file", (req, res) => {
  let fileType = req.query.type;
  
  if (req.session.files && req.session.files[fileType]) {
    delete req.session.files[fileType];
    res.status(200).json({ success: true, message: "File removed successfully" });
  } else {
    res.status(400).json({ success: false, message: "File not found or already removed" });
  }
});


// POST
router.post('/submit-carrier-setup', upload.fields([{ name: 'coi' }, { name: 'liabilityInsuranceCertificate' }, { name: 'noa' }, { name: 'voidCheck' }, {name: 'insurance'}, {name: 'MCAuthority'}, {name: 'w9'}, {name: 'other'}]), validateCarrierSetup, async (req, res) => {
  try {
    const { email, token, name, phone, address, address2, city, state, zip, einNumber, dotNumber, paymentMethod, documentExpirationDate, dispatcherName, dispatcherEmail, dispatcherPhone, ownerName, signature } = sanitizeInput(req.body, req);
    const combinedFiles = {
      ...req.session.files,
      ...req.files
    };
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);

    const invite = await Invite.findById(inviteId);

    const newCarrier = new Carrier({
      name, mcNumber: invite.mcNumber, email, phone, address, address2, city, state, zip, einNumber, dotNumber, payment: { paymentMethod }, dispatcherEmail, dispatcherName, dispatcherPhone, ownerName, signature,
      createdBy: invite.createdBy, 
      status: 'inModeration'
    });

const documentTypes = ['coi', 'liabilityInsuranceCertificate', 'noa', 'voidCheck', 'insurance', 'MCAuthority', 'w9', 'other'  ];

documentTypes.forEach((type) => {
  if (combinedFiles[type]) {
    let file = combinedFiles[type][0],
      newDocument = {
        type,
        url: file.key,
        name: name + "-" + invite.mcNumber + "-" + type,
      };
    newCarrier.documents.push(newDocument);
  }
});


    await newCarrier.save();
    invite.isExpired = true;
    await invite.save();
    req.session.files = {}; // Clear the session files
    res.render('setupComplete', { title: "Setup Complete", user: invite.createdBy });
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred while submitting the carrier setup.');
    res.json(err);
  }
});


router.get('/setup-complete', async (req, res) => {
  res.render('setupComplete', { title: "Setup Complete" });
});


  
  router.get('/list',isAuthenticated, paginate.middleware(10, 50), async (req, res) => {
    if (req.isAuthenticated()) {
      const { startDate, endDate, isExpired, inModeration } = req.query;
      
      const filter = {};
  
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
  
      if (isExpired !== undefined) {
        filter.isExpired = isExpired === 'true';
      }
  
      if (inModeration !== undefined) {
        filter.status = inModeration === 'true' ? 'inModeration' : { $ne: 'inModeration' };
      }
  
      const [carriersResults] = await Promise.all([
        Carrier.find(filter).sort({ updatedAt: 'desc' }).limit(req.query.limit).skip(req.skip).lean().exec(),
      ]);
  
      const [carriersCount] = await Promise.all([
        Carrier.countDocuments(filter),
      ]);
  
      const pageCountCarriers = Math.ceil(carriersCount / req.query.limit);
      res.render('carrier/list', {
        user: req.user,
        title: "List of Carriers",
        carriers: carriersResults,
        pageCountCarriers,
        pagesCarriers: paginate.getArrayPages(req)(3, pageCountCarriers, req.query.page),
      });
    } else {
      res.render('dashboard', {
        user: req.user,title: "Dashboard"
      });
    }
  });
  


  

// routes/carriers.js
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id).populate("documents").populate("createdBy");
    const invite = await Invite.find({ mcNumber: carrier.mcNumber }).populate("logs");
    console.log(carrier);
    res.render("carrier/show", {
      invite: invite,
      carrier: carrier,
      logs: invite.logs,
      documents: carrier.documents,
      title: "Carrier Details",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});


router.get("/:id/documents/:docId/view", isAuthenticated, async (req, res) => {
  try {
    let carrier = await Carrier.findById(req.params.id);
    let document = carrier.documents.id(req.params.docId);
    
    if (!document) return res.status(404).send("Document not found");


    let objectKey = document.url;

    
    let getObjectParams = { 
      Bucket: process.env.S3_BUCKET_NAME, 
      Key: objectKey
    };
    let presignedUrl;
    
    try {

      presignedUrl = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 300 });

    } catch (err) {

      return res.status(500).send("Internal server error");
    }

    res.json({ preSignedUrl: presignedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});



  //update carrier route
  router.put('/:id', isAuthenticated, async (req, res) => {
    try {
      const carrierId = req.params.id;
      const updates = sanitizeInput(req.body, req);
  
      // Include payment method in updates
      if (req.body.paymentOption) {
        updates.payment = { paymentMethod: req.body.paymentOption };
      }
  
      // Find the carrier by its ID and update it
      const updatedCarrier = await Carrier.findByIdAndUpdate(carrierId, updates, { new: true });
  
      // Check if the carrier was found and updated
      if (updatedCarrier) {
        res.redirect("/carriers/" + carrierId + "/edit");
      } else {
        res.status(404).json({ success: false, message: 'Carrier not found.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });
  
  
  // Edit carrier
router.get('/:id/edit',isAuthenticated, async (req, res) => {
  
  try {
    const carrierId = req.params.id;

    const carrier = await Carrier.findById(carrierId).populate('payment');;
    
    if (carrier) {

      res.render('carrier/edit', { carrier: carrier, title: "Edit Carrier" });
    } else {
      res.status(404).json({ success: false, message: 'Carrier not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});



router.post('/:id/moderate', async (req, res) => {
  try {
    const carrierId = req.params.id;
    const carrier = await Carrier.findById(carrierId);

    if (carrier) {
      carrier.status = 'Active';

      // Generate and save the PDF document
      const pdfBuffer = await generateBrokerCarrierAgreement(carrier);

      // Upload the PDF document to DO Space
      const pdfFileName = `carrierMc/${carrier.mcNumber}/broker-carrier-agreement-${carrier.mcNumber}.pdf`;
      await s3Client.putObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: pdfFileName,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      });

      // Save the Carrier Broker Agreement document as a regular document
      const newDocument = {
        type: 'agreement',
        name: `agreement-${carrier.mcNumber}`,
        url: pdfFileName,
      };
      carrier.documents.push(newDocument);

      await carrier.save();

      res.redirect('/');

    } else {
      res.status(404).json({ success: false, message: 'Carrier not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});






router.delete('/:id', async (req, res) => {
  try {
    const carrierId = req.params.id;
    
    // Find the carrier by its ID
    const carrier = await Carrier.findById(carrierId);

    if (carrier) {
      const mcNumber = carrier.mcNumber;
      const dirPath = `carrierMc/${mcNumber}`;

      // List all objects in the folder
      const listObjectsParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: dirPath
      };

      const listObjectsResponse = await s3Client.send(new ListObjectsV2Command(listObjectsParams));

      // Delete each object in the folder
      for (const obj of listObjectsResponse.Contents) {
        const deleteObjectParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: obj.Key
        };

        await s3Client.send(new DeleteObjectCommand(deleteObjectParams));
      }

      // Remove the carrier from the database
      await Carrier.findByIdAndRemove(carrierId);
      res.status(200).json({ success: true, message: 'Carrier deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Carrier not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

  

router.post('/:id/decline', async (req, res) => {
  try {
    const carrierId = req.params.id;

    const updatedCarrier = await Carrier.findByIdAndUpdate(carrierId, { status: "Declined" }, { new: true });
    await updatedCarrier.save();

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});


module.exports = router;
