const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Carrier = require('../models/carrier');
const Invite = require('../models/invite');
const Business = require('../models/business');
const User = require('../models/user');
const Document = require('../models/document');
const paginate = require('express-paginate');
const PDFDocument = require('pdfkit');
const { generateBrokerCarrierAgreement } = require('../helper/pdfGenerator');


const multer = require('multer');
const ConnectMongoDBSession = require('connect-mongodb-session');

//POST REQUEST FOR CARRIER SETUP
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { token } = req.body;
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);

    const mcNumber = invite.mcNumber || 'unknown'; // Use req.mcNumber instead of req.user.mcNumber

    const dirPath = `./docs/carrierMc/${mcNumber}`;
    fs.mkdirSync(dirPath, { recursive: true });
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });


// Other routes...

router.get('/carrier-setup', async (req, res) => {
  const token = req.query.token;
  console.log(token);
  try {
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);

    if (invite && moment().isBefore(invite.expiresAt)) {
      req.mcNumber = invite.mcNumber; // Add this line
      res.render('carrierSetup', { mcNumber: invite.mcNumber, token, title: "Carrier Setup" });
    } else {
      res.status(400).send('The invite link is expired or invalid.');
    }
  } catch (error) {
    res.status(400).send('The invite link is expired or invalid.');
  }
});





//POST
router.post('/submit-carrier-setup', upload.single('document'), async (req, res) => {
  try {

    const { email, token, name, phone, address, address2, city, state, zip, einNumber, dotNumber, documentType, documentExpirationDate } = req.body;
    const document = req.file;

    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);


    const newCarrier = new Carrier({
      name, mcNumber: invite.mcNumber, email, phone, address, address2, city, state, zip, einNumber, dotNumber,
      createdBy: req.user._id, status: 'inModeration'
    });
    console.log(newCarrier)
    if (document) {
      const newDocument = {
        type: documentType,
        path: document.path,
        expirationDate: documentExpirationDate ? new Date(documentExpirationDate) : undefined,
      }; newCarrier.documents.push(newDocument);
    }
    
   await newCarrier.save();

    req.flash('success', 'Carrier setup submitted successfully. Please wait for approval.');
    res.render('setupComplete', { title: "Setup Complete" });
  } catch (err) {
      console.error(err);
      req.flash('error', 'An error occurred while submitting the carrier setup.');
      res.json(err);
      }
});


      
router.get('/setup-complete', async (req, res) => {
  res.render('setupComplete', { title: "Setup Complete" });
});


  
  router.get('/list', paginate.middleware(10, 50), async (req, res) => {
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
  
  
  
  router.get('/:id', async (req, res) => {
    try {
      
      const carrier = await Carrier.findById(req.params.id);
      const invite = await Invite.find({mcNumber: carrier.mcNumber});
      
      console.log(invite)
      res.render('carrier/show', { carrier, documents: carrier.documents, title: "Carrier Details", invite });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  
  router.get('/:id/document/:path', async (req, res) => {

    const documentPath = req.params.path;
    console.log(documentPath);
    const fullPath = path.join(__dirname, '..', documentPath);
  
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.status(404).send('Document not found');
    }
  });
  


  router.post('/:id/activate', async (req, res) => {
    try {
      const carrierId = req.params.id;
      const carrier = await Carrier.findById(carrierId);
  
      if (carrier) {
        carrier.status = 'Active';
        await carrier.save();
  
        // Generate and save the PDF document
        const fileName = `./docs/carrierMc/${carrier.mcNumber}/broker-carrier-agreement.pdf`;
        generateBrokerCarrierAgreement(carrier, fileName);
  
        res.status(200).json({ success: true, message: 'Carrier activated successfully.' });
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
