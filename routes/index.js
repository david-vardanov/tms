const express = require('express');
const home = require('./home');
const users = require('./users');
const carriers = require('./carriers');
const invites = require('./invites');
const isAuthenticated = require('../middlewares/authMiddleware');


const router = express.Router();

router.use('/', home);
router.use('/', users);
router.use('/users',isAuthenticated, users);
router.use('/carriers',isAuthenticated, carriers);
router.use('/invites',isAuthenticated, invites);

module.exports = router;
