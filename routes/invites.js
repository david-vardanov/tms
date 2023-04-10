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
const Log = require('../models/log'); // Import the Log model
const isAuthenticated = require('../middlewares/authMiddleware');
const uaParser = require('ua-parser-js');
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

router.get('/list',isAuthenticated, paginate.middleware(10, 50), async (req, res) => {


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
});

router.get('/:id',isAuthenticated, async (req, res) => {
    
  try {
    const invite = await Invite.findById(req.params.id).populate('logs');
    res.render('invite/show', { invite, logs: invite.logs, title: "Invite Details" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});




router.get('/log/:inviteId', async (req, res) => {
  const inviteId = req.params.inviteId;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'] || req.headers['referrer'];
  const language = req.headers['accept-language'];
  const accessTime = new Date();
  
  const ua = uaParser(userAgent);
  const platform = ua.os.name || 'Unknown';

  try {
    const invite = await Invite.findById(inviteId);

    if (invite) {
      const log = new Log({
        invite: inviteId,
        ipAddress,
        userAgent,
        referrer,
        accessTime,
        language,
        platform,
      });

      await log.save();

      // Add the log entry to the invite's logs array and save
      invite.logs.push(log);
      await invite.save();

      res.status(200).json({ success: true, message: 'Data logged successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Invite not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
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
  // console.log((req.params.id))
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) {
      return res.status(404).send('Invite not found');
    }
    invite.isExpired = true
    await invite.save();
    // console.log(invite);
    return res.redirect('/');
  } catch (error) {
    next(error);
  }
});






module.exports = router;

