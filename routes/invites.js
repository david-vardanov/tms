const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const flash = require('express-flash');
const shortid = require('shortid');
const moment = require('moment');
const Carrier = require('../models/carrier');
const Invite = require('../models/invite');
const User = require('../models/user');
const sendEmail = require('../helper/send-email');

// Other routes...

router.post('/generate-invite-link', async (req, res) => {
  console.log("mta")
  const { mcNumber, email } = req.body;
  const existingCarrier = await Carrier.findOne({ mcNumber });
  if (existingCarrier) {
    console.log("mta")
    return res.status(400).json({
      flashType: 'error',
      message: 'A carrier with this MC number already exists.'
    });
  } else {
    // Create a new invite and save it to the database
    const invite = new Invite({
      mcNumber,
      createdBy: req.user._id,
      expiresAt: moment().add(2, 'hours').toDate(),
    });
    await invite.save();

    // Generate the invite token and URL
    const inviteToken = jwt.sign(
      { inviteId: invite._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    const inviteUrl = `${req.protocol}://${req.get('host')}/carriers/carrier-setup?token=${inviteToken}`;
sendEmail(email, "hello axper", "arachin emailna")
    // Add a success flash message and redirect to the carrier setup page
    return res.status(200).json({
      flashType: 'success',
      message: 'An invitation link has been generated and sent to the carrier.',
      inviteUrl: inviteUrl
    });
  }
});


module.exports = router;

