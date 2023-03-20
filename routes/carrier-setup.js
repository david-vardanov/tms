const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const moment = require('moment');
const Carrier = require('../models/carrier');
const Invite = require('../models/invite');
const User = require('../models/user');

// Other routes...

// GET route for the carrier setup page
router.get('/carrier-setup', async (req, res) => {
  const token = req.query.token;
  try {
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);

    if (invite && moment().isBefore(invite.expiresAt)) {
      res.render('carrier-setup', { mcNumber: invite.mcNumber, token });
    } else {
      res.status(400).send('The invite link is expired or invalid.');
    }
  } catch (error) {
    res.status(400).send('The invite link is expired or invalid.');
  }
});

// POST route for the carrier setup form submission
router.post('/submit-carrier-setup', async (req, res) => {
  const { mcNumber, email, token } = req.body;

  try {
    const { inviteId } = jwt.verify(token, process.env.JWT_SECRET);
    const invite = await Invite.findById(inviteId);

    if (invite && moment().isBefore(invite.expiresAt)) {
      const newCarrier = new Carrier({
        mcNumber,
        email,
        createdBy: invite.createdBy,
      });
      await newCarrier.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'The invite link is expired or invalid.' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: 'The invite link is expired or invalid.' });
  }
});


  

module.exports = router;
