const express = require('express');
const home = require('./home');
const users = require('./users');
const carriers = require('./carriers');
const brokers = require('./broker');
const loads = require('./load');

const invites = require('./invites');
const isAuthenticated = require('../middlewares/authMiddleware');


const router = express.Router();

router.use('/', home);
router.use('/', users);
router.use('/users',isAuthenticated, users);
router.use('/carriers', carriers);
router.use('/loads',isAuthenticated, loads);
router.use('/invites',isAuthenticated, invites);
router.use('/brokers',isAuthenticated, brokers);

module.exports = router;
