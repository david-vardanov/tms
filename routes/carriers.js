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
const PDFDocument = require('pdfkit');
const { sanitizeInput } = require('../middlewares/sanitize');
const { validateCarrierSetup } = require('../middlewares/validation');
const { generateBrokerCarrierAgreement } = require('../helper/pdfGenerator');
const isAuthenticated = require('../middlewares/authMiddleware');
const { uploadFileToSpaces } = require("../helper/awsSdk");
const crypto = require('crypto');
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const ConnectMongoDBSession = require('connect-mongodb-session');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { upload, s3Client } = require('../helper/awsSdk');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { URL } = require('url');


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
      
      // Render the carrierSetup view with the carrier data
      res.render('carrierSetup', { mcNumber,invite, token, title: "Carrier Setup" });
    } else {
      res.status(400).send('The invite link is expired or invalid.');
    }
  } catch (error) {
    res.status(400).send('The invite link is expired or invalid.');
  }
});



// POST
router.post('/submit-carrier-setup', upload.fields([{ name: 'coi' }, { name: 'liabilityInsuranceCertificate' }, { name: 'noa' }, { name: 'voidCheck' }, {name: 'insurance'}, {name: 'MCAuthority'}, {name: 'w9'}, {name: 'other'}]), validateCarrierSetup, async (req, res) => {
  try {
    const { email, token, name, phone, address, address2, city, state, zip, einNumber, dotNumber, paymentMethod, documentExpirationDate } = sanitizeInput(req.body, req);
    const files = req.files;
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);
    console.log(req.user);
    const newCarrier = new Carrier({
      name, mcNumber: invite.mcNumber, email, phone, address, address2, city, state, zip, einNumber, dotNumber, paymentMethod,
      createdBy: invite.createdBy, 
      status: 'inModeration'
    });

//this 
const documentTypes = ['coi', 'liabilityInsuranceCertificate', 'noa', 'voidCheck', 'insurance', 'MCAuthority', 'w9', 'other'  ];

documentTypes.forEach((type) => {
  if (files[type]) {
    let file = files[type][0],
      newDocument = {
        type,
        url: file.location,
        name: name + "-" + invite.mcNumber + "-" + type,
      };
    newCarrier.documents.push(newDocument);
  }
});

//this
    await newCarrier.save();
    invite.isExpired = true;
    await invite.save();
    req.flash('success', 'Carrier setup submitted successfully. Please wait for approval.');
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
  
  
  //carrier show

// routes/carriers.js
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id).populate("documents");
    const invite = await Invite.find({ mcNumber: carrier.mcNumber }).populate("logs");

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
    console.log(document);
    if (!document) return res.status(404).send("Document not found");

    let getObjectParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.url,
    };

    // Get the object from the S3 client
    s3Client.getObject(getObjectParams, (error, data) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal server error");
      } else {
        // Set the proper content type and send the data as a response
        res.set("Content-Type", data.ContentType);
        res.send(data.Body);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});




  //update carrier route
router.put('/:id',isAuthenticated, async (req, res) => {
  try {
    const carrierId = req.params.id;
    const updates = sanitizeInput(req.body, req);

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
    console.log(carrierId);
    const carrier = await Carrier.findById(carrierId);
    
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
      const fileName = `./docs/carrierMc/${carrier.mcNumber}/broker-carrier-agreement.pdf`;
      generateBrokerCarrierAgreement(carrier, fileName);

      // Save the URL of the Carrier Broker Agreement document
      const carrierAgreementUrl = `/docs/carrierMc/${carrier.mcNumber}/broker-carrier-agreement.pdf`;
      carrier.carrierAgreementUrl = carrierAgreementUrl;

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
        // Remove the associated directory
        const mcNumber = carrier.mcNumber;
        const dirPath = `./docs/carrierMc/${mcNumber}`;
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
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
    console.log(updatedCarrier);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});


module.exports = router;
