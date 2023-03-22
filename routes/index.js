const express = require('express');
const home = require('./home');
const users = require('./users');
const carriers = require('./carriers');
const invites = require('./invites');

const router = express.Router();

router.use('/', home);
router.use('/', users);
router.use('/users', users);
router.use('/carriers', carriers);
router.use('/invites', invites);

module.exports = router;
