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
const paginate = require('express-paginate');
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
sendEmail(email, "hello axper", "arachin emailna");
    // Add a success flash message and redirect to the carrier setup page
    return res.status(200).json({
      flashType: 'success',
      message: 'An invitation link has been generated and sent to the carrier.',
      inviteUrl: inviteUrl
    });
  }
});




router.get('/list', paginate.middleware(10, 50), async (req, res) => {
  if (req.isAuthenticated()) {

    const filter = {};
   const [inviteResults] = await Promise.all([
      Invite.find(filter).sort({ updatedAt: 'desc' }).limit(req.query.limit).skip(req.skip).lean().exec(),
    ]);

    const [invitesCount] = await Promise.all([
      Invite.countDocuments(filter),
    ]);

    const pageCountInvites = Math.ceil(invitesCount / req.query.limit);
    res.render('invite/list', {
      user: req.user,
      title: "List of Invites",
      invites: inviteResults,
      pageCountInvites,
      pagesInvites: paginate.getArrayPages(req)(3, pageCountInvites, req.query.page),
    });
  } else {
    res.render('dashboard', {
      user: req.user,title: "Dashboard"
    });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const inviteId = req.params.id;
    
    // Find the invite by its ID
    const invite = await Invite.findById(inviteId);

    if (invite) {
     // Remove the invite from the database
      await Invite.findByIdAndRemove(inviteId);
      res.status(200).json({ success: true, message: 'Invite deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Invite not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});




router.post('/:id/revoke', async (req, res, next) => {
  console.log((req.params.id))
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) {
      return res.status(404).send('Invite not found');
    }
    invite.isExpired = true
    await invite.save();
    console.log(invite);
    return res.redirect('/');
  } catch (error) {
    next(error);
  }
});






module.exports = router;

