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
const multer = require('multer');
const storage = require('../storage');





const upload = multer({ storage });


// Other routes...

router.get('/carrier-setup', async (req, res) => {
  const token = req.query.token;
  console.log(token)
  try {
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);

    if (invite && moment().isBefore(invite.expiresAt)) {
      res.render('carrierSetup', { mcNumber: invite.mcNumber, token, title: "Carrier Setup" });
    } else {
      res.status(400).send('The invite link is expired or invalid.');
    }
  } catch (error) {
    res.status(400).send('The invite link is expired or invalid.');
  }
});

// POST route for the carrier setup form submission
router.post('/submit-carrier-setup', upload.single('document'), async (req, res) => {
  const { mcNumber, token, email, name, phone, address, address2, city, state, zip, einNumber, dotNumber, documentType, documentExpirationDate } = req.body;

  try {
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      throw new Error('Invite not found.');
    }
    if (moment().isAfter(invite.expiresAt)) {
      throw new Error('Invite has expired.');
    }

    const newCarrier = new Carrier({
      name,
      mcNumber,
      email,
      phone,
      address,
      address2,
      city,
      state,
      zip,
      einNumber,
      dotNumber,
      createdBy: invite.createdBy,
      status: "inModeration",
    });

    // Save the new Carrier object
    await newCarrier.save();

    // Save the uploaded document as a new Document object
    if (req.file) {
      const newDocument = new Document({
        carrier: newCarrier._id,
        type: documentType,
        path: path.join('carrierMc', mcNumber, req.file.filename),
        expirationDate: documentExpirationDate ? new Date(documentExpirationDate) : null,
      });

      await newDocument.save();
    }

    res.render('setupComplete', { user: req.user, carrier: newCarrier, title: "Setup Complete" })
    // res.json({ success: true, newCarrier });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});


router.get('/setup-complete', async (req, res) => {
res.render('setupComplete', {
  title: 'Setup Complete with AGD Logistics',
  //description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.'
});
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
      title: "",
      carriers: carriersResults,
      pageCountCarriers,
      pagesCarriers: paginate.getArrayPages(req)(3, pageCountCarriers, req.query.page),
    });
  } else {
    res.render('/', {
      user: req.user,title: ""
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    const documents = await Document.find({ carrier: req.params.id });
console.log(documents);
    res.render('carrier/show', { carrier, documents });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});


module.exports = router;
