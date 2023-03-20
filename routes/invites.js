const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const moment = require('moment');
const Carrier = require('../models/carrier');
const Invite = require('../models/invite');
const User = require('../models/user');

// Other routes...

router.post('/generate-invite-link', async (req, res) => {
    const { mcNumber } = req.body;
  
    const existingCarrier = await Carrier.findOne({ mcNumber });
    if (existingCarrier) {
      return res.status(400).json({ error: 'A carrier with this MC number already exists.' });
    }
  
    // Create a new invite and save it to the database
    const invite = new Invite({
      mcNumber,
      createdBy: req.user._id,
      expiresAt: moment().add(2, 'hours').toDate(),
    });
  
    await invite.save();
  
    // Generate the invite token
    const inviteToken = jwt.sign(
      { inviteId: invite._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  
    // Generate the invite URL
    const inviteUrl = `${req.protocol}://${req.get('host')}/carrier-setup?token=${inviteToken}`;
  
    // Send the invite URL in the response
    res.json({ inviteUrl });
  });
module.exports = router;

